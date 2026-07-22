# Paris AI Tourist Guide

Recovered, maintainable source for the Paris summer-school guide deployed at
<https://epsi-paris-summerschool.web.app>.

## What was recovered

- React/Vite single-page application with Home, Trip Guide and Restaurant Map routes
- 26-item restaurant snapshot and specialty filters
- Leaflet/OpenStreetMap markers and walking directions
- The original Paris navy, gold and cream visual direction

## Data policy

The restaurant collection is stored in `src/data/restaurants.js`. It is a dated editorial
snapshot recovered from the deployed application, not a live directory. The interface labels
ratings and prices accordingly and links every venue to a live Google Maps search for verification.

Time-sensitive travel answers live in `src/data/travelTips.js` and link to official sources. The
review date is displayed in the Trip Guide.

## Local development

```bash
pnpm install
pnpm dev
```

Create a production build with:

```bash
pnpm build
```

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds and publishes the `main` branch to:

<https://hejinghan777.github.io/paris-program/>

The Pages build uses the `/paris-program/` asset base and hash-based client routing so Home, Trip
Guide and Restaurants continue to work when the page is refreshed.

## Optional Firebase Hosting

`firebase.json` deploys the Vite `dist` directory, keeps client-side routes working and gives
fingerprinted assets a long-lived immutable cache.

```bash
firebase deploy --only hosting
```
