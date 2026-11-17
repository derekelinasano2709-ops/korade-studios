# KORADE STUDIOS — Enhanced Website

A premium responsive Roblox studio website with a black-and-gold visual identity, animated 2D canvas, interactive effects, five languages, theme switching and a configurable game showcase.

## Files (6 code/document files + logo asset)

- `index.html` — page structure
- `style.css` — visual design, responsive layout and animations
- `script.js` — interactions, particles, parallax, theme, language, links and gallery
- `translations.js` — English, Spanish, Portuguese, French and German
- `config.js` — game, screenshot and Discord URLs
- `README.md` — instructions
- `assets/korade-crown.png` — the supplied KORADE crown logo, optimized with transparent background

## Current game and community links

The package is already configured with the supplied Smash Eggs For Animals Roblox page and KORADE Discord invitation. The game cover and available thumbnails are requested automatically from Roblox using the place ID in `config.js`. If Roblox has no approved thumbnail available or its thumbnail service is temporarily unavailable, the designed KORADE fallback artwork appears. You can still add manually hosted screenshots in the `screenshots` array.

## Optional: Change the game images and links

Open `config.js` and edit:

```js
game: {
  name: "Your actual game title",
  description: "Your game description",
  url: "https://www.roblox.com/games/YOUR_PLACE_ID/Game-Name",
  image: "https://direct-image-url/game-cover.jpg",
  screenshots: [
    "https://direct-image-url/screenshot-1.jpg",
    "https://direct-image-url/screenshot-2.jpg"
  ]
},
discord: {
  invite: "https://discord.gg/YOUR_INVITE"
}
```

Use direct HTTPS image URLs ending in a supported image format, or URLs from a host that serves the image itself. The website can retrieve public Roblox thumbnails automatically for the configured place ID. Manually supplied screenshot URLs remain optional. If Roblox does not return artwork, the designed KORADE fallback appears instead. Broken gallery images are automatically removed.

## Replace the old GitHub files

1. Download and unzip this package.
2. Open the existing `korade-studios` repository.
3. Upload/replace `index.html`, `style.css`, `script.js`, `translations.js`, `config.js`, and `README.md` in the repository root.
4. Upload the `assets` folder with `korade-crown.png` inside it. Keep the folder name exactly `assets`.
5. Commit the changes.
6. GitHub Pages will redeploy automatically.

Keep the structure:

```text
korade-studios/
├── index.html
├── style.css
├── script.js
├── translations.js
├── config.js
├── README.md
└── assets/
    └── korade-crown.png
```

## Features

- Black/gold theme plus light mode; preference saved locally.
- English, Spanish, Portuguese, French and German.
- 2D gold particle canvas and connecting trails.
- Cursor spotlight, magnetic buttons, tilt cards and hero parallax on desktop.
- Animated page loader, scroll progress, marquee and reveal transitions.
- Configurable game cover and screenshot gallery.
- Configurable Discord invite.
- Responsive mobile navigation.
- 16+ self-declaration prompt. This is not formal age verification and does not technically prevent access.

No frameworks, build tools, backend, or paid APIs are required. Works on GitHub Pages.
