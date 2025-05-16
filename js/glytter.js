// Glytter-style font character map with glyph-box wrappers
// Thanks to Adam Twardoch and Christian Genco for fontkit browser tips

var root = document.documentElement; // <html> element
var charmap = document.getElementById("charmap");

function log(message = "-----------------") {
    if (console && console.log) console.log(message);
}

function displayFontInfo(charactersHtml) {
    charmap.innerHTML = charactersHtml;
}

function createGlyphBoxesFromCharSet(characterSet) {
    // Wrap each character in a div.glyph-box and join them
    return characterSet
        .map(codePoint => `<div class="glyph-box char-${codePoint}" data-unicode="${codePoint}">&#${codePoint};</div>`)
        .join(' ');
}

function attachGlyphClickHandlers(font) {
    const glyphBoxes = document.querySelectorAll('.glyph-box');
    glyphBoxes.forEach(box => {
        box.addEventListener('click', () => {
            const codePoint = parseInt(box.dataset.unicode, 10);
            const char = String.fromCodePoint(codePoint);
            handleGlyphClick(char, font, codePoint); // Pass the codePoint too (optional)
        });
    });
}


function parseFontFile() {
    let fontkitFont = null;
    let opentypeFont = null;

    const reader = new FileReader();

    reader.onload = () => {
        const arrayBuffer = reader.result;

        try {
            // Parse fonts
            fontkitFont = fontkit.create(new Buffer(arrayBuffer));
            opentypeFont = opentype.parse(arrayBuffer); // ← this is the one we want for glyph clicks

            // Inject into page
            const fontFace = new FontFace("TempFont", arrayBuffer);
            fontFace.load().then(loadedFont => {
                document.fonts.add(loadedFont);
                root.style.setProperty("--font-family", "TempFont, AdobeBlank");
            });

            // Display character map using FontKit
            const charactersHtml = createGlyphBoxesFromCharSet(fontkitFont.characterSet);
            displayFontInfo(charactersHtml);

            // Attach click handlers with OpenType.js font
            attachGlyphClickHandlers(opentypeFont);
        } catch (error) {
            log(error);
            charmap.innerHTML = `<p>Error loading font: ${error.message}</p>`;
            root.style.setProperty("--font-family", "Firava");
        }
    };

    reader.readAsArrayBuffer(inputFile);
}

function loadDefaultFont(fontPath = "fonts/Firava.woff2") {
    fetch(fontPath)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
            // Use Uint8Array for fontkit
            const fontkitFont = fontkit.create(new Buffer(arrayBuffer));

            // Use opentype.js to get glyph data later
            const opentypeFont = opentype.parse(arrayBuffer);

            const charactersHtml = createGlyphBoxesFromCharSet(fontkitFont.characterSet);
            displayFontInfo(charactersHtml);
            attachGlyphClickHandlers(opentypeFont);
        })
        .catch(error => {
            log("Error loading default font: " + error);
        });
}

window.addEventListener("DOMContentLoaded", () => {
    loadDefaultFont();
});
