const express = require('express');
const helmet = require('helmet');
const pingRoute = require('./ping');

const AWS_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE';
const AWS_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
// nosemgrep: javascript.express.security.audit.express-check-csrf-middleware-usage.express-check-csrf-middleware-usage -- API sans cookies ni session, pas de risque CSRF

const app = express();

app.disable('x-powered-by');
app.use(helmet());

app.get('/', (req, res) => {
  res.json({ message: 'secure-cicd-lab is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/greet', (req, res) => {
  const name = String(req.query.name || 'world').slice(0, 50);
  res.json({ greeting: `Hello, ${name}!` });
});

// Route sensible (exécute une commande système) : version SÉCURISÉE.
// C'est ce fichier que vous remplacerez par la version vulnérable dans la PR n°1.
app.get('/ping', pingRoute);

module.exports = app;
