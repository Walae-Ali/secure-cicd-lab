const { exec } = require('child_process');

// VERSION VULNERABLE (démo TP 2) : injection de commande
// Exemple d'exploitation : /ping?host=8.8.8.8;id
module.exports = function ping(req, res) {
  exec('ping -c 1 ' + req.query.host, (err, stdout) => {
    res.send(stdout);
  });
};
