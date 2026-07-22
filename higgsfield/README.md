# Higgsfield showcase video generator

Generates a cinematic showcase clip of the MOSA Studio site from the four
reference screenshots in `higgsfield/screenshots/` (hero, services, tarifs,
réalisations), using the Higgsfield DoP Turbo image-to-video API.

## Setup

1. Copy `.env.example` to `.env` and fill in both values from
   cloud.higgsfield.ai → API Keys:
   ```
   HIGGSFIELD_API_KEY=...
   HIGGSFIELD_SECRET=...
   ```
2. Node.js 22+ (uses native `fetch`). No npm install needed.
3. Optional: `ffmpeg` on your PATH to auto-concatenate the 4 generated clips
   into one final video (`higgsfield/output/mosa-showcase.mp4`). Without it,
   the individual clips are still saved.

## Run

```
node --env-file=higgsfield/.env higgsfield/generate-showcase.mjs
```

This starts one DoP Turbo job per screenshot, polls each until it completes,
downloads the resulting clip into `higgsfield/output/`, then stitches all
four into `higgsfield/output/mosa-showcase.mp4`.

## Notes

- The screenshots are read by Higgsfield's servers from
  `raw.githubusercontent.com/leomessi83570-gif/webmainleo/<branch>/higgsfield/screenshots/`,
  which requires this repo (or at least this branch) to stay public. Set
  `SCREENSHOT_REF` env var to pin a specific branch/commit if `main` moves on.
- The exact JSON field names for the completed-job response (video URL,
  status value) weren't available to verify against live docs when this
  script was written — `pollJob`/`extractVideoUrl` in `generate-showcase.mjs`
  log the raw response on an unrecognized shape, so the first real run will
  show you the actual field names if the defaults don't match.
- `motions: []` is left empty — call `GET /v1/motions` to see Higgsfield's
  preset motion IDs if you want to combine a preset with the text prompt.
