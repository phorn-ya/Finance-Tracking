# frontend

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Environment variables

Copy `.env.example` to `.env.local` and fill in your Firebase web app
configuration. Firebase Authentication and Cloud Firestore are used directly
from the frontend; Analytics is initialized only when the browser supports it.
Enable Email/Password sign-in and create a Firestore database in the Firebase
console before using the app. To use the Google button, enable Google as a
sign-in provider and add your local and deployed hostnames to Firebase
Authentication's authorized domains.

Firebase Authentication uses session-only persistence, so signing in does not
keep the login active after the browser session ends. The app does not store
finance records in browser local storage; transactions and budgets are stored
in Cloud Firestore.

The Firebase web configuration is client-visible; do not put service-account
keys or other privileged credentials in frontend env variables. Apply the
Firestore rules in `firestore.rules` before deploying. Firebase Hosting serves
the built frontend files, so provide the `VITE_FIREBASE_*` values in the
deployment build environment.

Manage monthly category limits from the **Budgets** page. Budgets are saved at
`users/{uid}/budgets/{category}` and their progress is calculated from that
user's expense transactions for the current month.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```
