const express = require('express');
const router = express.Router();
const { analyzePhotos } = require('../services/anthropic');

router.post('/analyze-photo', async (req, res) => {
  try {
    const { profile, photos } = req.body;
    if (!profile || !photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ error: 'profile et photos sont requis' });
    }
    const analysis = await analyzePhotos({ profile, photos });
    res.json(analysis);
  } catch (err) {
    console.error('Erreur /analyze-photo', err);
    res.status(500).json({ error: 'Analyse impossible', detail: err.message });
  }
});

module.exports = router;
