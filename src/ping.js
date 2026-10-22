const { execFile } = require('child_process');

// Version sécurisée :
// - le paramètre est validé par une liste blanche de caractères
// - execFile ne passe pas par un shell, donc pas d'injection de commande
const HOST_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9.-]{0,252}$/;

module.exports = function ping(req, res) {
  const host = String(req.query.host || '');

  if (!HOST_PATTERN.test(host)) {
    return res.status(400).json({ error: 'Invalid host' });
  }

  execFile('ping', ['-c', '1', host], { timeout: 5000 }, (err, stdout) => {
    if (err) {
      return res.status(502).json({ error: 'Ping failed' });
    }
    res.type('text/plain').send(stdout);
  });
};
