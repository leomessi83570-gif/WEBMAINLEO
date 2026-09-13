require('dotenv').config();
const express = require('express');
const cors = require('cors');

const analyzeRoutes = require('./routes/analyze');
const programRoutes = require('./routes/program');

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' })); // photos en base64 -> payload plus lourd

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api', analyzeRoutes);
app.use('/api', programRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MuscleHome backend démarré sur http://0.0.0.0:${PORT}`);
});
