const express = require('express');
const router = express.Router();
const { generateProgramAndNutrition, adjustProgram } = require('../services/anthropic');

router.post('/generate-program', async (req, res) => {
  try {
    const { profile, analysis } = req.body;
    if (!profile) return res.status(400).json({ error: 'profile est requis' });
    const result = await generateProgramAndNutrition({ profile, analysis });
    res.json(result);
  } catch (err) {
    console.error('Erreur /generate-program', err);
    res.status(500).json({ error: 'Génération impossible', detail: err.message });
  }
});

router.post('/adjust-program', async (req, res) => {
  try {
    const { profile, currentProgram, feedback } = req.body;
    if (!profile || !currentProgram || !feedback) {
      return res.status(400).json({ error: 'profile, currentProgram et feedback sont requis' });
    }
    const result = await adjustProgram({ profile, currentProgram, feedback });
    res.json(result);
  } catch (err) {
    console.error('Erreur /adjust-program', err);
    res.status(500).json({ error: 'Ajustement impossible', detail: err.message });
  }
});

module.exports = router;
