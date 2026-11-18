# KORADE STUDIOS — Website v3

A responsive, black-and-gold Roblox studio website for GitHub Pages. No framework, build step, backend, paid API, or package installation is required.

## Package contents

The project keeps the agreed six root files, plus the supplied crown logo asset:

```text
repository/
├── index.html
├── style.css
├── script.js
├── translations.js
├── config.js
├── README.md
└── assets/
    └── korade-crown.png
```

## Already configured

- Roblox experience: **Smash Eggs For Animals**
- Roblox place ID: `137764992604751`
- Game URL: `https://www.roblox.com/es/games/137764992604751/Smash-Eggs-For-Animals`
- Official Discord invite: `https://discord.gg/aSZxVj3bW`
- Founder: **Amil_Forsales** (Discord: Folytr)
- Co-founder: **cogjim** (Roblox: @UtopianCow3015)
- Website design/development credit: **Neo** (@comprocosas3)
- Community age requirement: **16+**

## Features

- Five interface languages: English, Spanish, Portuguese, French, and German.
- Dark and light themes, with the selected theme stored locally in the visitor's browser.
- Responsive navigation, mobile menu, scroll progress, animated reveal effects, gold particle canvas, pointer spotlight, magnetic buttons, subtle 3D cards, and a moving studio ticker.
- Roblox public thumbnail loading for the featured experience. If Roblox does not return an image or its thumbnail service is unavailable, the designed crown fallback remains visible.
- Optional screenshot gallery, image lightbox, and copy-game-ID interaction.
- Roadmap, founder profiles, website credits, community invitation, 16+ community standards, privacy notice, security guidelines, terms of use, and FAQ.
- Reduced-motion support and keyboard-operable menus, accordions, and dialogs.

## Editing links or game artwork

Open `config.js`. The current links are already set. To add screenshots, provide direct HTTPS image URLs in `game.screenshots`. To use a manually hosted game cover, set `game.image` to a direct HTTPS image URL. Keep `placeId` as the Roblox **place ID**, not a universe ID.

## Publish or replace the existing GitHub Pages site

1. Download and extract `KORADE-STUDIOS-WEBSITE-V3.zip`.
2. Open the existing GitHub repository.
3. Upload and replace the six root files: `index.html`, `style.css`, `script.js`, `translations.js`, `config.js`, and `README.md`.
4. Upload the `assets` folder and keep `korade-crown.png` inside it.
5. Commit the changes to the branch/folder configured in **Settings → Pages**.
6. Wait for GitHub Pages to finish deployment, then hard-refresh the site (`Cmd + Shift + R` on Mac).

No build command is needed. Keep the filenames and `assets` folder name unchanged.

## Important notes about privacy, security, and age

- This is a static front-end website. Its own code does not create accounts, accept payments, provide forms, install analytics, or send the theme/age preference values to KORADE.
- The theme choice is stored in browser `localStorage`; the 16+ confirmation is stored in `sessionStorage` for the current browser session. Visitors can clear browser site data to remove these preferences.
- Google Fonts and Roblox's public thumbnail service may be contacted by the visitor's browser. GitHub Pages, Google, Roblox, Discord, and other external services operate under their own policies and may process standard technical request data.
- The 16+ prompt is a self-declaration for KORADE community spaces. It is **not** identity or age verification and cannot technically prevent someone from accessing the site. It is not a Roblox game age rating. Roblox's own age ratings and terms still apply.
- The policy text is a practical community/site notice template, not legal advice or a guarantee of compliance with every jurisdiction. Have the studio owner review it for the studio's actual operating practices and local legal requirements before treating it as a formal legal policy.

## Troubleshooting

- If the game image does not load, Roblox may not expose a public thumbnail for the place at that moment. The crown fallback is intentional. Add a direct HTTPS image URL in `config.js` to override it.
- If the old page remains visible after a commit, wait for the Pages deployment and hard-refresh the browser.
- If styles or scripts appear missing, check that all six files are in the repository root and that `assets/korade-crown.png` is in the exact `assets` folder.
