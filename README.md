# Google Fonts Toolbox

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Built With](https://img.shields.io/badge/Built_with-HTML%2C%20CSS%2C%20JS-brightgreen)
![Status](https://img.shields.io/badge/status-in%20progress-yellow)
![GitHub last commit](https://img.shields.io/github/last-commit/cocodedesigns/gwftoolbox)
![Dark Mode](https://img.shields.io/badge/dark%20mode-supported-black)

A lightweight, single-page frontend app for exploring Google Fonts, previewing them in real time, and downloading selected fonts. Built with HTML, CSS, JavaScript, and jQuery, with dynamic routing, theme support, and cookie-based preferences.

## 🚀 Features

- **SPA-like routing** using `load()` and `history.pushState()` for seamless navigation
- **Google Fonts preview** from a local `googlefonts.json` data file
- **Pretty URLs** handled by Nginx rewrite rules
- **Dark/Light/Auto theme** toggle with cookies
- **Google Analytics tracking** for key interactions
- **Responsive design** and minimal dependencies

## 📁 Project Structure

```

/
├── index.html
├── pages/
│   ├── about.html
│   ├── how-it-works.html
│   └── ...
├── preview/
│   └── {font-name}/ → loads fontpreview\.html with the correct font
├── fontpreview\.html
├── fonts/
│   └── googlefonts.json
├── css/
│   └── style.css
├── js/
│   └── app.js
├── set-theme.php
├── media/
│   └── (images, favicons, etc.)
└── README.md

````

## 🧰 Local Setup

This app is designed for local development using [Local by Flywheel](https://localwp.com/) with **Nginx**. No `.htaccess` is needed.

### Routing

Nginx configuration should include:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
````

This ensures that clean URLs like `/about/` or `/preview/roboto/` are properly routed to the single-page app.

## 🎨 Theme Toggle

Toggle between:

* `light-mode`
* `dark-mode`
* `auto-mode`

Cookie: `fontdl_theme`
Icon updates automatically using Font Awesome.

## 📊 Analytics

Google Analytics tracks clicks on:

* `.page-link` (internal nav links)
* `.font-link` (font previews)
* `#download-fonts` (download trigger)

## 📅 Last Updated

The last update is stored in a JavaScript `lastUpdated` variable (`YYYY-MM-DD`) and dynamically inserted into the DOM as `F d, Y`.

Example:

```js
const lastUpdated = '2025-05-12';
const options = { year: 'numeric', month: 'long', day: 'numeric' };
$('.show-lastUpdated').text(new Date(lastUpdated).toLocaleDateString(undefined, options));
```

## 📄 License

MIT — free to use, modify, and distribute.

---

Created with care by [Nathan Hawkes](https://thewpbard.dev) – *The WP Bard*