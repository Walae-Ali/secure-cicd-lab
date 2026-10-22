# secure-cicd-lab

Petit projet Node.js/Express pour le **TP 2 : intégration de la sécurité dans un pipeline CI/CD**.

## Contenu

| Fichier | Rôle |
|---|---|
| `src/app.js`, `src/server.js` | API Express (`/`, `/health`, `/greet`, `/ping`) |
| `src/ping.js` | Route `/ping` **sécurisée** (c'est elle qu'on rend vulnérable pour la PR n°1) |
| `test/app.test.js` | Tests unitaires (runner natif de Node) |
| `Dockerfile` | Image de l'appli, utilisée par le scan DAST |
| `.github/workflows/ci.yml` | Pipeline : build/test → SAST (Semgrep) + SCA (Trivy) → DAST (OWASP ZAP) |
| `demo/ping.vulnerable.js.txt` | Version vulnérable de `/ping` pour la démo |

## Lancer en local

```bash
npm install
npm test
npm start            # http://localhost:3000
docker build -t secure-cicd-lab . && docker run -p 3000:3000 secure-cicd-lab
```

## Étape 0 : publier le dépôt (une seule fois)

```bash
git init -b main
git add .
git commit -m "Projet initial"
git remote add origin https://github.com/<votre-compte>/secure-cicd-lab.git
git push -u origin main
```

Puis sur GitHub : **Settings → Branches → Add rule** sur `main` :
- Require a pull request before merging
- Require status checks to pass : `build-test`, `sast`, `sca`, `dast`

(Les checks n'apparaissent dans la liste qu'après une première exécution du workflow.)

`main` doit rester **propre** : le pipeline y est vert.

## PR n°1 : vulnérabilité intentionnelle (le pipeline doit ÉCHOUER)

```bash
git checkout -b feat/vuln-demo
cp demo/ping.vulnerable.js.txt src/ping.js
npm install lodash@4.17.15          # dépendance volontairement vulnérable (SCA)
```

Ajoutez aussi un secret en dur dans `src/app.js`, par exemple :

```js
const AWS_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE';
const AWS_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
```

```bash
git add -A
git commit -m "feat: route /ping (démo vulnérable)"
git push -u origin feat/vuln-demo
```

Ouvrez la PR vers `main`. Résultat attendu :

| Job | Résultat | Cause |
|---|---|---|
| `build-test` | vert | les tests passent toujours |
| `sast` | **rouge** | injection de commande (`exec` + concaténation) |
| `sca` | **rouge** | lodash 4.17.15 (CVE HIGH) et/ou secret détecté |
| `dast` | non exécuté | dépend de `sast` et `sca` |

Le merge est bloqué. **Faites vos captures d'écran** (PR + logs des jobs en échec).

## PR n°2 : correction (le pipeline doit PASSER)

```bash
git checkout main -- src/ping.js src/app.js     # retour aux versions sécurisées
npm install lodash@latest                        # ou: npm uninstall lodash
git add -A
git commit -m "fix: sécurisation de /ping, suppression du secret, mise à jour des dépendances"
git push
```

La PR se met à jour : tous les jobs, y compris `dast`, doivent passer au vert.
Capturez le résultat et le rapport ZAP (artefact `zap-report` dans l'onglet Actions).

## Limites à mentionner dans votre rapport

- Le scan ZAP *baseline* est **passif** : il ne détecterait pas l'injection de commande. C'est le SAST qui l'attrape ici. Un scan actif (`zap-full-scan.py`) est plus complet mais plus long.
- `ignore-unfixed: true` évite de bloquer sur des CVE sans correctif disponible.
- Les seuils HIGH/CRITICAL sont un compromis entre sécurité et nombre de faux positifs.
