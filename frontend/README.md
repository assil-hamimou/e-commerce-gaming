# A2SIL — Frontend React + Vite + TypeScript

Ce dossier contient l'application frontend moderne développée avec **React 18**, **Vite**, **TypeScript** et **Tailwind CSS**, connectée à l'API REST PHP / MySQL de GameStore.

## Direction visuelle

- **Typographie** : Space Grotesk pour les titres et DM Sans pour le texte, combinaison mise en avant par [Fontpair](https://fontpair.co/?webview=1) et ajustée à la lisibilité du catalogue.
- **Boutons** : effets de survol courts et lumineux inspirés des composants communautaires de [Uiverse](https://uiverse.io/), adaptés aux couleurs A2SIL.
- **Fonds** : fichier SVG fluide local inspiré des générateurs d'abstractions de [fffuel](https://fffuel.co/).
- **Illustration** : scène « Game world » de [unDraw](https://undraw.co/illustration/game-world_z4nd), recolorée avec l'accent A2SIL pour le panneau principal quand un produit n'a pas de couverture.

---

## Démarrage rapide

### 1. Prérequis
- **XAMPP** en cours d'exécution avec **Apache** et **MySQL** (la base `gamestore_db` importée).
- **Node.js 18+** installé.

### 2. Lancement en mode Développement

```bash
cd c:\xampp\htdocs\game-store\frontend
npm.cmd install
npm.cmd run dev
```

`npm.cmd` fonctionne dans PowerShell même si l'exécution des scripts `.ps1` est désactivée.

L'application démarre immédiatement sur :
👉 **http://localhost:5173**

Le serveur de développement Vite redirige automatiquement les requêtes `/api/*` vers le backend PHP Apache (`http://localhost:8080/game-store/api/*`).

---

## Configuration du port Apache / XAMPP

Si votre Apache écoute sur un port différent (par exemple le port standard `80` au lieu de `8080`), modifiez simplement la cible dans [vite.config.ts](file:///c:/xampp/htdocs/game-store/frontend/vite.config.ts) :

```ts
proxy: {
  '/api': {
    target: 'http://localhost/game-store', // ou http://localhost:8080/game-store
    changeOrigin: true,
  }
}
```

---

## Compilation pour la production

Pour compiler le frontend en fichiers statiques optimisés :

```bash
npm run build
```

Les fichiers générés se trouveront dans `frontend/dist/`.
