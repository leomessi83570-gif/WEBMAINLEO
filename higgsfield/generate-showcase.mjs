#!/usr/bin/env node
// Generates a cinematic showcase video of the MOSA Studio site by sending
// the four reference screenshots to the Higgsfield DoP Turbo (image-to-video)
// API, polling each job to completion, downloading the clips, then
// concatenating them into one video with ffmpeg.
//
// Docs used (from the user's Higgsfield dashboard, "DoP Turbo" > API Reference):
//   Server: https://platform.higgsfield.ai
//   POST /v1/image2video/dop   — start a generation
//   GET  /requests/{request_id}/status — poll status
// Auth headers: hf-api-key, hf-secret
//
// Run: HIGGSFIELD_API_KEY=... HIGGSFIELD_SECRET=... node higgsfield/generate-showcase.mjs
// (or put both in a .env file next to this script and run with --env-file=.env)

import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE = 'https://platform.higgsfield.ai';
const OUT_DIR = path.join(__dirname, 'output');

const API_KEY = process.env.HIGGSFIELD_API_KEY;
const API_SECRET = process.env.HIGGSFIELD_SECRET;

if (!API_KEY || !API_SECRET) {
  console.error('Missing HIGGSFIELD_API_KEY and/or HIGGSFIELD_SECRET in the environment.');
  console.error('Get both from cloud.higgsfield.ai -> API Keys, then export them or put them in a .env file.');
  process.exit(1);
}

// Raw GitHub URLs — the repo is public, so Higgsfield's servers can fetch these directly.
// Swap GITHUB_REF for a specific commit SHA if you want the images pinned instead of branch-latest.
const GITHUB_REF = process.env.SCREENSHOT_REF || 'claude/higgsfield-api-integration-81uwbt';
const RAW_BASE = `https://raw.githubusercontent.com/leomessi83570-gif/webmainleo/${GITHUB_REF}/higgsfield/screenshots`;

const SHOTS = [
  {
    name: '1-hero',
    image: `${RAW_BASE}/1-hero.png`,
    prompt:
      'Cinematic slow push-in on a dark UI panel. Soft pink, purple and cyan glow breathes gently behind the interface. Subtle parallax between the foreground text and background gradient. Premium, slow-motion, no camera shake, dark minimalist aesthetic.',
  },
  {
    name: '2-services',
    image: `${RAW_BASE}/2-services.png`,
    prompt:
      'Cinematic slow push-in on a dark UI panel with two glowing service cards, one pink-edged, one cyan-edged. The colored glow behind each card pulses gently. Smooth, slow-motion, premium feel, static camera holding depth.',
  },
  {
    name: '3-tarifs',
    image: `${RAW_BASE}/3-tarifs.png`,
    prompt:
      'Cinematic slow push-in on a dark pricing UI panel. The featured pink-bordered pricing card glows softly, gentle ambient light breathing behind it. Smooth, slow-motion, premium feel, subtle parallax depth.',
  },
  {
    name: '4-realisations',
    image: `${RAW_BASE}/4-realisations.png`,
    prompt:
      'Cinematic slow push-in on a dark portfolio UI panel with stacked video cards. Soft glow pulses behind the stacked cards, subtle parallax between layers. Smooth, slow-motion, premium, dark minimalist aesthetic.',
  },
];

const headers = {
  'hf-api-key': API_KEY,
  'hf-secret': API_SECRET,
  'Content-Type': 'application/json',
};

async function startJob(shot) {
  const body = {
    params: {
      seed: 1,
      model: 'dop-turbo',
      prompt: shot.prompt,
      motions: [],
      check_nsfw: true,
      input_images: [{ type: 'image_url', image_url: shot.image }],
      enhance_prompt: true,
    },
    webhook: null,
  };

  const res = await fetch(`${API_BASE}/v1/image2video/dop`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`[${shot.name}] start failed: ${res.status} ${text}`);
  }
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`[${shot.name}] non-JSON response: ${text}`);
  }
  const requestId = json.request_id || json.id || json.data?.request_id || json.data?.id;
  if (!requestId) {
    throw new Error(`[${shot.name}] could not find a request id in response: ${text}`);
  }
  console.log(`[${shot.name}] started, request_id=${requestId}`);
  return requestId;
}

function extractVideoUrl(json) {
  return (
    json.result?.output_url ||
    json.result?.url ||
    json.output?.url ||
    json.output_url ||
    json.video_url ||
    json.results?.[0]?.url ||
    json.data?.output_url ||
    json.data?.url ||
    null
  );
}

async function pollJob(shot, requestId) {
  const url = `${API_BASE}/requests/${requestId}/status`;
  for (let attempt = 0; attempt < 90; attempt++) {
    await new Promise((r) => setTimeout(r, 5000));
    const res = await fetch(url, { headers });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`[${shot.name}] status check failed: ${res.status} ${text}`);
    }
    const json = JSON.parse(text);
    const status = (json.status || json.data?.status || '').toLowerCase();
    console.log(`[${shot.name}] status=${status || '(unknown, raw below)'}`);
    if (['completed', 'succeeded', 'success', 'done'].includes(status)) {
      const videoUrl = extractVideoUrl(json);
      if (!videoUrl) {
        console.error('Full response for field-name debugging:', JSON.stringify(json, null, 2));
        throw new Error(`[${shot.name}] completed but no video URL found — adjust extractVideoUrl().`);
      }
      return videoUrl;
    }
    if (['failed', 'error', 'cancelled'].includes(status)) {
      throw new Error(`[${shot.name}] job failed: ${text}`);
    }
    if (!status) {
      console.error('Unrecognized status payload:', JSON.stringify(json, null, 2));
    }
  }
  throw new Error(`[${shot.name}] timed out waiting for completion`);
}

async function download(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed: ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(destPath, buf);
}

function findFfmpeg() {
  const candidates = ['ffmpeg', '/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux'];
  for (const c of candidates) {
    try {
      execFileSync(c, ['-version'], { stdio: 'ignore' });
      return c;
    } catch {
      // try next
    }
  }
  return null;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const clipPaths = [];

  for (const shot of SHOTS) {
    const requestId = await startJob(shot);
    const videoUrl = await pollJob(shot, requestId);
    const clipPath = path.join(OUT_DIR, `${shot.name}.mp4`);
    await download(videoUrl, clipPath);
    console.log(`[${shot.name}] saved -> ${clipPath}`);
    clipPaths.push(clipPath);
  }

  const ffmpeg = findFfmpeg();
  if (!ffmpeg) {
    console.log('ffmpeg not found — clips saved individually in higgsfield/output/. Install ffmpeg to auto-concatenate.');
    return;
  }

  const listFile = path.join(OUT_DIR, 'concat-list.txt');
  writeFileSync(listFile, clipPaths.map((p) => `file '${p}'`).join('\n'));
  const finalPath = path.join(OUT_DIR, 'mosa-showcase.mp4');
  execFileSync(ffmpeg, ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', finalPath]);
  console.log(`Final showcase video -> ${finalPath}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
