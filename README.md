# Google Fonts Toolbox

![GitHub License](https://img.shields.io/github/license/cocodedesigns/gwftoolbox)
![Built With](https://img.shields.io/badge/Built_with-HTML%2C%20CSS%2C%20JS-brightgreen)
![Status](https://img.shields.io/badge/status-in%20progress-yellow)
![GitHub last commit](https://img.shields.io/github/last-commit/cocodedesigns/gwftoolbox)
![Dark Mode](https://img.shields.io/badge/dark%20mode-supported-black)

A lightweight, single-page frontend app for exploring Google Fonts, previewing them in real time, and downloading selected fonts. Built with HTML, CSS, JavaScript, and jQuery, with dynamic routing, theme support, and cookie-based preferences.

## Features

- Previews the library of Google's fonts using **Google Fonts API**, in all styles and weights
- Checks colour contrast to **WCAG** Guidelines (_AA_ / _AAA_)
- Include fonts on your website using **Google's CDN**
- Download fonts in **TTF** format for self-hosting

## Dependencies

This project uses **[jQuery](https://jquery.com)**. It comes bundled with these scripts:

* [Google Fonts API](https://developers.google.com/fonts)
* [Font Awesome](https://fontawesome.com)
* [Prism.js](https://prismjs.com/)
* [JSZip](https://stuk.github.io/jszip/)
* [Filesaver.js](https://github.com/eligrey/FileSaver.js)

These scripts are bundled directly with the repo, but can be replaced with CDN versions. It also comes bundled with **[Inter](https://fonts.google.com/specimen/Inter)** (in WOFF2 format).

### Why bundle them locally?

When using third-party services, there is always the possibility of information being collected by the provider's servers. Using a local copy of the scripts prevents most of that information, ensuring better compliance with GDPR and other privacy regulations.

## Project Structure

````
/
├── css/
│   ├── prism.css
│   └── style.css
├── fonts/
│   └── googlefonts.json
├── images/
│   ├── logo_darkmode.png
│   └── logo_lightmode.png
├── js/
│   ├── app.js
│   ├── content.js
│   └── prism.js
├── pages/
│   ├── about.html
│   ├── cookies-policy.html
│   ├── hmoe.html
│   ├── license.html
│   ├── privacy-policy.html
│   └── terms-of-use.html
├── .htaccess
├── fontpreview.html
├── index.html
├── LICENSE.md
└── README.md
````

## License

This project is created and released under **MIT License**.

---

Created with care by [Nathan Hawkes](https://thewpbard.dev) – *The WP Bard*