const express = require('express');
const app = express();
const PORT = process.env.PORT || 8081;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

app.listen(PORT, () => {
  console.log(`Service Users démarré sur le port ${PORT}`);
}); 