const keys = {
    primary: 'fontPreview_primary',
    secondary: 'fontPreview_secondary',
    background: 'fontPreview_background',
    textone: {
        fontsize: 'fontPreview_textone_size',
    },
    texttwo: {
        fontsize: 'fontPreview_texttwo_size',
    }
};

function updateFontList() {
    const query = $('#font-search').val().toLowerCase();
    const activeFilters = $('#filters input[type="checkbox"]:checked')
        .map(function () {
            return $(this).val();
        }).get();

    let visibleCount = 0;

    $('#font-list #available-fonts li').each(function () {
        const $item = $(this);
        const name = $item.text().toLowerCase();
        const category = $item.data('category');

        const matchesFilter = activeFilters.length > 0 && activeFilters.includes(category);
        const matchesSearch = name.includes(query);

        if (matchesFilter && matchesSearch) {
            $item.stop(true, true).fadeIn(200);
            visibleCount++;
        } else {
            $item.stop(true, true).fadeOut(200);
        }
    });

    if (visibleCount === 0) {
        $('#no-results-message').fadeIn(200);
    } else {
        $('#no-results-message').hide();
    }
}

function initToggles(container = document) {
    // Section toggles (with labels and optional icons)
    $(container).find('.section-toggle').each(function () {
        const $toggle = $(this);
        const targetId = $toggle.data('target');
        const $target = $('#' + targetId);
        const $label = $toggle.find('span').first();
        const $icon = $toggle.find('i');

        const showText = $toggle.data('show-text') || 'Show Section';
        const hideText = $toggle.data('hide-text') || 'Hide Section';

        // Only init if not already initialized
        if (!$toggle.data('initialized')) {
            $toggle.data('initialized', true);

            $label.text(showText);
            $icon.addClass('fa-chevron-down');

            $toggle.on('click', function (e) {
                e.preventDefault();

                $target.stop(true, true).slideToggle(200, function () {
                    const isVisible = $target.is(':visible');

                    $label.text(isVisible ? hideText : showText);
                    $icon
                        .toggleClass('fa-chevron-up', isVisible)
                        .toggleClass('fa-chevron-down', !isVisible);
                });
            });
        }
    });

    // Button toggles (no icon or label)
    $(container).find('.button-toggle').each(function () {
        const $toggle = $(this);
        const $targetID = $toggle.data('target');
        const $target = $('#' + $targetID);

        if (!$toggle.data('initialized')) {
            $toggle.data('initialized', true);

            $toggle.on('click', function (e) {
                e.preventDefault();
                $target.stop(true, true).slideToggle(200);
            });
        }
    });
}

// Define the readable names for the variants and subsets
const weightLabels = {
    100: 'Thin',
    200: 'Extra Light',
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'Semi Bold',
    700: 'Bold',
    800: 'Extra Bold',
    900: 'Black',
};

const subsetLabels = {
    'arabic': 'Arabic',
    'armenian': 'Armenian',
    'bengali': 'Bengali',
    'cherokee': 'Cherokee',
    'cyrillic': 'Cyrillic',
    'cyrillic-ext': 'Cyrillic Extended',
    'devanagari': 'Devanagari',
    'ethiopic': 'Ethiopic',
    'georgian': 'Georgian',
    'greek': 'Greek',
    'greek-ext': 'Greek Extended',
    'gujarati': 'Gujarati',
    'gurmukhi': 'Gurmukhi',
    'hebrew': 'Hebrew',
    'kannada': 'Kannada',
    'khmer': 'Khmer',
    'korean': 'Korean',
    'latin': 'Latin',
    'latin-ext': 'Latin Extended',
    'malayalam': 'Malayalam',
    'myanmar': 'Myanmar',
    'oriya': 'Odia (Oriya)',
    'sinhala': 'Sinhala',
    'tamil': 'Tamil',
    'telugu': 'Telugu',
    'thai': 'Thai',
    'tibetan': 'Tibetan',
    'vietnamese': 'Vietnamese',
};

var fontName = '';
var fontCategory = '';
var fontVariants = [];
var fontSubsets = [];
var fontFiles = [];
var availableWeights = [];
var ttfFile = '';

function router(pathname) {
    $('#font-preview').fadeOut(150, function() {
        if (!pathname || pathname === '/') {
            $('#font-preview').load('/pages/home.html');
            return;
        }

        // Font preview route
        if (pathname.startsWith('/preview/')) {
            $('#font-preview').load('/fontpreview.html', function () {
            });
            return;
        }

        // Standard page route
        const cleanPath = pathname.replace(/^\/|\/$/g, ''); // remove leading/trailing slashes
        $('#font-preview').load(`/pages/${cleanPath}.html`, function (response, status) {
            if (status === 'error') {
                $('#font-preview').html('<h2>404 - Page not found</h2>');
            }
        });
    });
    $('#font-preview').scrollTop(0).delay(250).fadeIn(150);
}

$(document).on('click', '.page-link', function (e) {
    e.preventDefault();

    const href = $(this).attr('href');
    history.pushState(null, '', href); // Update URL without reload
    router(href); // Load the appropriate content
});

window.addEventListener('popstate', function () {
    router(location.pathname);
});

// Fetch the fonts JSON file
function fetchFontsData() {
    // Get the last part of the path (e.g., "roboto" from /preview/roboto/)
    var pathParts = window.location.pathname.split('/');
    var slug = pathParts.filter(Boolean).pop(); // get last non-empty segment

    // Fetch the fonts JSON file
    fetch('/fonts/googlefonts.json')
        .then(res => res.json())
        .then(data => {
            // Find the font based on the slug
            const font = data.items.find(f => slugify(f.family) === slug);
            if (!font) {
                document.getElementById('font-name').textContent = 'Font not found.';
                return;
            }

            fontName = font.family;
            fontCategory = font.category;
            fontVersion = font.version;
            fontVariants = font.variants;
            fontSubsets = font.subsets;
            fontFiles = font.files;
            lastUpdated = font.lastModified;
            ttfFile = font.files.regular;

            // Convert font name to Google Fonts API format
            var googleFontName = fontName.replace(/ /g, '+');

            // Map and filter variants to readable weights and italic variants
            var variants = Object.keys(font.files).map(v => {
                if (v === 'regular') return '400';
                if (v === 'italic') return '400italic';
                return v;
            });

            // Separate into normal and italic weights
            var normal = [], italic = [];
            variants.forEach(v => {
                if (v.endsWith('italic')) {
                    italic.push(v.replace('italic', '') || '400');
                } else {
                    normal.push(v);
                }
            });

            // Deduplicate and sort the weights
            var uniqueNormal = [...new Set(normal)].sort();
            var uniqueItalic = [...new Set(italic)].sort();

            // Build Google Fonts weights syntax
            var parts = [];
            if (uniqueNormal.length > 0) {
                parts.push(...uniqueNormal.map(w => `0,${w}`));
            }
            if (uniqueItalic.length > 0) {
                parts.push(...uniqueItalic.map(w => `1,${w}`));
            }

            var weights = parts.join(';');
            var href = `https://fonts.googleapis.com/css2?family=${googleFontName}:ital,wght@${weights}&display=swap`;

            // Update <link id="google-font-display">
            var link = document.getElementById('google-font-display');
            if (link) {
                link.href = href;
                link.rel = 'stylesheet';
                link.type = 'text/css';
            } else {
                console.warn('google-font-display link element not found in <head>');
            }

            $('#font-preview').css('font-family', '\'' + fontName + '\', ' + fontCategory)

            $('.show-fontName').text(fontName);
            $('.show-fontCategory').text(fontCategory);
            $('.show-fontVersion').text(fontVersion);

            variants.forEach(variant => {
                let weight = 400;
                let italic = false;

                if (variant === 'regular') {
                    weight = 400;
                } else if (variant === 'italic') {
                    weight = 400;
                    italic = true;
                } else if (variant.endsWith('italic')) {
                    italic = true;
                    weight = parseInt(variant.replace('italic', ''), 10);
                } else {
                    weight = parseInt(variant, 10);
                }

                // Get label from weightLabels or fallback
                let label = weightLabels[weight] || `Weight ${weight}`;

                label += ` (${weight})`;

                if (italic) {
                    label += ' Italic';
                }

                // Optional inline style for preview (e.g., font-weight, font-style)
                let style = `font-family: \'${font.family}\', ${font.category}; font-weight: ${weight};`;
                if (italic) {
                    style += ' font-style: italic;';
                }

                // HTML template
                var variantHTML = `
                    <div class="option variant-${variant}">
                        <div class="label">
                            <p>${label}</p>
                        </div>
                        <div class="data" style="${style}">
                            <p class="font-alpha-upper">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                            <p class="font-alpha-lower">abcdefghijklmnopqrstuvwxyz</p>
                            <p class="font-numeric">0123456789</p>
                            <p class="font-symbol">!@£#$€%^&*()-_=+"'{[]}:&lt;,>.?/</p>
                        </div>
                    </div>
                `;

                var checked = (variant == '400' || variant == 'regular') ? 'checked' : '';

                var variantSelect = `
                    <div class="toggle-wrapper">
                        <input type="checkbox" id="toggle-${variant}" name="variants[]" value="${variant}" ${checked}>
                        <label class="toggle" for="toggle-${variant}"></label>
                        <span class="toggle-label" style="${style}">${label}</span>
                    </div>
                `;

                var variantToolbar = `
                    <option value="${variant}">${label}</option>
                `;

                // Append to container
                $('#font-variants').append(variantHTML);
                $('#font-variant-toggle').append(variantSelect);
                $('#font-weight-primary').append(variantToolbar);
                $('#font-weight-secondary').append(variantToolbar);
            });

            // Example available weights (you'll replace this with your dynamic font weight list)
            availableWeights = variants; // Fallback if undefined

            fontSubsets.forEach(subset => {
                let subsetLabel = subsetLabels[subset];

                var checked = (subset == 'latin' || subset == 'latin-ext') ? 'checked' : '';

                var subsetHTML = `
                    <div class="toggle-wrapper">
                        <input type="checkbox" id="subset-${subset}" name="subset[]" value="${subset}" ${checked}>
                        <label class="toggle" for="toggle-${subset}"></label>
                        <span class="toggle-label">${subsetLabel}</span>
                    </div>
                `;

                $('#font-subsets-toggle').append(subsetHTML);
            });

            var dateObj = new Date(lastUpdated);
    
            const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
            var formattedDate = dateObj.toLocaleDateString('en-US', dateOptions);

            $('.show-lastUpdated').text(formattedDate);

            generateFontOutput();

            $('#view-on-google').attr('href', 'https://fonts.google.com/specimen/' + googleFontName)
        });
}

function setClosestFontWeight(targetWeight, availableWeights) {
	return availableWeights.reduce((prev, curr) => {
		return Math.abs(curr - targetWeight) < Math.abs(prev - targetWeight) ? curr : prev;
	});
}

function loadStoredColors() {
    const colorInputs = [
        { selector: '#primary-color', key: keys.primary },
        { selector: '#secondary-color', key: keys.secondary },
        { selector: '#background-color', key: keys.background }
    ];

    colorInputs.forEach(({ selector, key }) => {
        const input = $(selector);
        const defaultVal = input.data('default');
        const saved = localStorage.getItem(key);
        const finalVal = saved ?? defaultVal;

        input.val(finalVal);

        const el = input.get(0);
        if (window.Coloris?.setInstanceValue) {
            Coloris.setInstanceValue(el, finalVal);
        } else {
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
}

function updateFontStyles() {
    const primary = $('#primary-color').val();
    const secondary = $('#secondary-color').val();
    const background = $('#background-color').val();

    $('#text-preview .main-text .text-one').css('color', primary);
    $('#text-preview .main-text .text-two').css('color', secondary);
    $('#text-preview .main-text').css('background-color', background);

    if (primary !== '') localStorage.setItem(keys.primary, primary);
    if (secondary !== '') localStorage.setItem(keys.secondary, secondary);
    if (background !== '') localStorage.setItem(keys.background, background);
}

// Font size change
$(document).on('input', '#font-size-primary', function () {
	var textoneSize = $(this).val() + 'px';
	$('#text-preview .main-text .text-one').css('font-size', textoneSize);
    $('#text-preview .toolbar #preview-text-one .font-size.display').text(textoneSize);

    localStorage.setItem(keys.textone.fontsize, textoneSize);
});

$(document).on('input', '#font-size-secondary', function () {
	var texttwoSize = $(this).val() + 'px';
	$('#text-preview .main-text .text-two').css('font-size', texttwoSize);
    $('#text-preview .toolbar #preview-text-two .font-size.display').text(texttwoSize);

    localStorage.setItem(keys.texttwo.fontsize, texttwoSize);
});

// Font size change
$(document).on('input', '#font-weight-primary', function () {
	var textoneWeight = $(this).val().toString();
    
    if ( textoneWeight.includes('italic') ){
        textoneWeight = textoneWeight.replace('italic', '').trim();
        $('#text-preview .main-text .text-one').css('font-style', 'italic').css('font-weight', textoneWeight);
    } else {
        $('#text-preview .main-text .text-one').css('font-weight', textoneWeight).css('font-style', 'normal');
    }
});

$(document).on('input', '#font-weight-secondary', function () {
	var texttwoWeight = $(this).val().toString();
    
    if ( texttwoWeight.includes('italic') ){
        texttwoWeight = texttwoWeight.replace('italic', '').trim();
        $('#text-preview .main-text .text-two').css('font-style', 'italic').css('font-weight', texttwoWeight);
    } else {
        $('#text-preview .main-text .text-two').css('font-weight', texttwoWeight).css('font-style', 'normal');
    }
});


function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const bigint = parseInt(hex, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function luminance(r, g, b) {
    const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrast(rgb1, rgb2) {
    const lum1 = luminance(...rgb1);
    const lum2 = luminance(...rgb2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

function updateTestSection(sectionId, foregroundHex, backgroundHex) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const fg = hexToRgb(foregroundHex);
    const bg = hexToRgb(backgroundHex);
    const ratio = contrast(fg, bg).toFixed(2);

    // Update swatch backgrounds and code
    section.querySelector(".foreground .swatch").style.backgroundColor = foregroundHex;
    section.querySelector(".foreground .code").textContent = foregroundHex;
    section.querySelector(".background .swatch").style.backgroundColor = backgroundHex;
    section.querySelector(".background .code").textContent = backgroundHex;

    // Update contrast ratio
    const contrastText = section.querySelector(".contrast");
    if (contrastText) contrastText.textContent = `${ratio}:1`;

    const tests = [
        { selector: ".text-normal .aa-normal", threshold: 4.5 },
        { selector: ".text-normal .aaa-normal", threshold: 7 },
        { selector: ".text-large .aa-normal", threshold: 3 },
        { selector: ".text-large .aaa-normal", threshold: 4.5 },
    ];

    tests.forEach(test => {
        const el = section.querySelector(test.selector);
        if (!el) return;

        const icon = el.querySelector("i");
        const isPass = ratio >= test.threshold;

        el.classList.toggle("pass", isPass);
        el.classList.toggle("fail", !isPass);

        if (icon) {
            icon.className = isPass ? "fa-solid fa-check" : "fa-solid fa-xmark";
        }
    });
}

function updateAllContrastTests() {
    const primary = document.querySelector("#primary-color").value;
    const secondary = document.querySelector("#secondary-color").value;
    const background = document.querySelector("#background-color").value;

    try {
        updateTestSection("primary", primary, background);
        updateTestSection("secondary", secondary, background);
    } catch (e) {
        console.error("Invalid color value:", e);
    }
}

function showToast(message, type = 'success') {
    const $toast = $('#toast');
    const $icon = $toast.find('.toast-icon');
    const $message = $toast.find('.toast-message');

    $toast.removeClass('toast-success toast-error show');

    // Set icon based on type
    if (type === 'success') {
        $icon.attr('class', 'toast-icon fas fa-check-circle');
    } else if (type === 'error') {
        $icon.attr('class', 'toast-icon fas fa-times-circle');
    }

    $toast.addClass(`toast-${type}`);
    $message.text(message);
    $toast.addClass('show');

    setTimeout(() => {
        $toast.removeClass('show');
    }, 2000);
}

jQuery(function($) {
    $('#filter-toggle').on('click', function(e) {
        e.preventDefault();
        $('#filters').slideToggle(200);
    });

    // Bind both search and filter to the same handler
    $('#font-search').on('input', updateFontList);
    $('#filters input[type="checkbox"]').on('change', updateFontList);

    // Run once on page load
    window.updateFontList = updateFontList;


    // Resize banner

    const $fontList = $('#font-list');
    const $resizer = $('#resizer');
    const $toggleButton = $('#toggle-font-list');
    const $appMain = $('#app-main');
    
    const MAX_WIDTH = 600; // Set your max width here, adjust as necessary
    const MIN_WIDTH = 0;   // Set minimum width for the panel

    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    let previousWidth = localStorage.getItem('fontListWidth') || '300px';

    // Apply saved width on load
    $fontList.css('width', previousWidth);
    document.documentElement.style.setProperty('--font-list-width', previousWidth);

    // Begin dragging
    $resizer.on('mousedown', function (e) {
        isResizing = true;
        startX = e.clientX;
        startWidth = $fontList.width();
        $resizer.addClass('resizing');

        // Reattach the mousemove and mouseup events when dragging begins
        $(document).on('mousemove', mouseMove);
        $(document).on('mouseup', mouseUp);
    });

    // Dragging in progress
    function mouseMove(e) {
        if (!isResizing) return;

        let newWidth = startWidth + (e.clientX - startX);

        // Apply minimum and maximum width constraints
        if (newWidth < MIN_WIDTH) {
            newWidth = MIN_WIDTH;
        } else if (newWidth > MAX_WIDTH) {
            newWidth = MAX_WIDTH;
        }

        $fontList.css('width', newWidth);
        document.documentElement.style.setProperty('--font-list-width', newWidth + 'px'); // Update CSS variable
    }

    // Dragging ends
    function mouseUp() {
        if (isResizing) {
            isResizing = false;
            $(document).off('mousemove', mouseMove);
            $(document).off('mouseup', mouseUp);
            $resizer.removeClass('resizing');

            const finalWidth = $fontList.width();
            const isHidden = finalWidth <= 10;

            if (isHidden) {
                $fontList.css('width', '0');
                localStorage.setItem('fontListWidth', '0');
                document.documentElement.style.setProperty('--font-list-width', '0px'); // Update CSS variable
                $appMain.addClass('font-list-hidden');
            } else {
                const widthString = finalWidth + 'px';
                localStorage.setItem('fontListWidth', widthString);
                document.documentElement.style.setProperty('--font-list-width', widthString); // Update CSS variable
                $appMain.removeClass('font-list-hidden');
            }

            $toggleButton.attr('aria-expanded', !isHidden);
        }
    }

    // Toggle button with animation
    $toggleButton.on('click', function () {
        const $fontList = $('#font-list');
        const $icon = $(this).find('i');
        const isHidden = $appMain.hasClass('font-list-hidden');

        if (isHidden) {
            // Restore previous width
            const savedWidth = localStorage.getItem('fontListWidth') || '300px';
            $fontList.css('width', savedWidth);
            document.documentElement.style.setProperty('--font-list-width', savedWidth); // Update CSS variable
            $appMain.removeClass('font-list-hidden');
            $icon.removeClass('fa-chevron-right').addClass('fa-chevron-left').css({ transform: 'rotate(0deg)' });
            $(this).attr('aria-expanded', 'true');
        } else {
            // Hide panel
            $fontList.css('width', '0');
            document.documentElement.style.setProperty('--font-list-width', '0px'); // Update CSS variable
            $appMain.addClass('font-list-hidden');
            $icon.removeClass('fa-chevron-left').addClass('fa-chevron-right').css({ transform: 'rotate(180deg)' });
            $(this).attr('aria-expanded', 'false');
        }
    });
});

$(document).on('click', '#code-modal .tab-button', function (e) {
    e.preventDefault();

    const target = $(this).attr('href');
    const $targetContent = $(target);
    const $activeContent = $('#code-content .tab-content.show');

    if ($targetContent.is($activeContent)) return;

    $activeContent.removeClass('show').fadeOut(200, function () {
        $targetContent.fadeIn(200).addClass('show');
    });

    $('#code-content .tab-button').removeClass('active');
    $(this).addClass('active');

    $('#code-content')
        .removeClass()
        .addClass(target.replace('#', ''));
});

$(document).on('click', '#download-fonts', async function () {
    const $btn = $(this);
    const $icon = $btn.find('i');
    const $label = $btn.find('.label');

    // Disable button and show loading state
    $btn.prop('disabled', true);
    $icon.removeClass('fa-download').addClass('fa-spinner fa-spin-pulse');
    $label.text('Downloading, please wait …');

    const fontFamilySlug = slugify(fontName);

    const selectedVariants = $('input[name="variants[]"]:checked').map(function () {
        return this.value;
    }).get();

    const selectedSubsets = $('input[name="subsets[]"]:checked').map(function () {
        return this.value;
    }).get();

    if (selectedVariants.length === 0) {
        alert('Please select at least one variant.');
        return;
    }

    // Normalize variant values
    const normalizedVariants = selectedVariants.map(v => {
        if (v === 'regular') return '400';
        if (v === 'italic') return '400italic';
        return v.toLowerCase(); // e.g., '100italic'
    });

    // Fetch the font files data directly from the API
    const fontFilesData = fontFiles;

    const zip = new JSZip();
    const fontDir = zip.folder('fonts');
    const fontFaceRules = [];
    const downloadedFonts = new Set();

    // Iterate over selected variants and download the corresponding TTF files
    for (const variant of selectedVariants) {
        const variantKey = variant.toLowerCase();

        // Check if this variant has a corresponding TTF file in the data
        if (fontFilesData[variantKey]) {
            const fontUrl = fontFilesData[variantKey];

            // Avoid downloading the same font multiple times
            if (downloadedFonts.has(fontUrl)) continue;

            const filename = `${fontFamilySlug}-${variantKey}.ttf`;

            try {
                const response = await fetch(fontUrl);
                const blob = await response.blob();
                fontDir.file(filename, blob);
                downloadedFonts.add(fontUrl);

                // Generate @font-face CSS rule for the downloaded font
                const ruleText = `@font-face {
    font-family: '${fontName}';
    font-style: ${variantKey.includes('italic') ? 'italic' : 'normal'};
    font-weight: ${variantKey.replace('italic', '').trim() || '400'};
    src: url('./fonts/${filename}') format('truetype');
    font-display: swap;
}`;

                fontFaceRules.push(ruleText);
            } catch (err) {
                console.error(`Error downloading ${filename}:`, err);
            }
        }
    }

    if (fontFaceRules.length === 0) {
        alert('No matching fonts were downloaded.');
        return;
    }

    // Create CSS file
    zip.file('style.css', fontFaceRules.join('\n\n') + '\n');

    // Generate the HTML preview file
    const htmlPreview = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview: ${fontName}</title>
    <style>
        @import url('./style.css');
        /* Base Reset & Typography */
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }

        html, 
        body { 
            height: 100%; 
            font-family: '${fontName}', sans-serif;
            color: #222; 
            background: #f8f9fa; 
        }

        body{
            padding: 1rem;
        }

        a { 
            color: inherit; 
            text-decoration: none; 
        }

        a:hover { 
            text-decoration: underline; 
        }

        .font-data {
            display: flex;
            flex-wrap: wrap;
            gap: 54px;
            margin-top: 3rem;
        }

        .font-data .preview{
            width: calc( 23% - 36px );
        }

        .font-data .variants{
            width: calc( 35% - 36px );
        }

        .font-data .uses{
            width: calc( 42% - 36px );
        }

        figure.preview {
            border-top: 1px solid #222;
            padding-top: 1rem;
        }

        .preview .font-name {
            font-family: var(--body-typeface); 
            font-size: 1.5rem;
            font-weight: 600;
            margin: 0;
        }

        .preview .font-cat {
            font-family: var(--body-typeface); 
            font-size: 0.9rem;
            color: #888;
            margin: 0.5rem 0 1rem;
        }

        .font-preview {
            font-size: 9rem;
            display: flex;
            gap: 0.5rem;
            font-weight: 400;
            height: 220px;
            align-items: end;
        }

        .font-preview .preview-a{ 
            font-weight: 700; 
            text-transform: uppercase; 
        }

        /* Variants grid */
        figure.variants {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .variants .option{ 
            display: flex; 
            gap: 2rem; 
        }

        .variants .option .label, .variants .option .data{
            border-top: 1px solid #222;
            padding: 1rem 0;
        }

        .variants .label {
            font-family: var(--body-typeface); 
            font-size: 0.95rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #333;
            width: 125px;
        }

        .variants .data{ 
            flex: 1; 
        }

        .variants .data p {
            margin: 0.25rem 0;
            font-size: 1.125rem;
            overflow-wrap: anywhere;
            line-height: 1.4;
        }

        /* Usage examples */
        figure.uses {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            border-top: solid 1px #222;
            padding: 1.3rem 0 0;
        }

        .uses .option{ 
            display: flex; 
            gap: 1.25rem; 
        }

        .uses .option .label {
            font-family: var(--body-typeface);
            font-size: 0.8rem;
            text-transform: uppercase;
            color: #666;
            width: 120px;
        }

        .uses .option .data{ 
            flex: 1; 
        }

        .uses .option.title{ 
            align-items: end;
        }

        .uses .option.title .data {
            font-size: 2rem;
            font-weight: 700;
            line-height: 1.6;
        }

        .uses .option.lead .data {
            font-size: 1.25rem;
            line-height: 1.5;
        }

        .uses .option.paragraph .data {
            font-size: 1rem;
            line-height: 1.5;
            color: #333;
        }

        .uses .option.quote .data {
            font-size: 1.15rem;
            font-style: italic;
            line-height: 1.5;
            font-weight: 500;
        }

        .uses .option.link .data a {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            text-decoration: none;
            color: #1a73e8;
            font-weight: 500;
            margin-right: 1rem;
        }

        .uses .option.button .data a {
            display: inline-block;
            border: 1px solid #222;
            padding: 0.75rem 1.5rem;
            text-decoration: none;
            font-weight: 400;
            margin: 0 1rem 1rem 0;
        }

        .uses .option.button .data .option-one{
            color: #222;
            background-color: transparent;
        }

        .uses .option.button .data .option-two{
            color: #FFF;
            background-color: #222;
        }

        .fa-arrow-right, .fa-circle {
            font-size: 0.9em;
        }

        .fa-arrow-right{
            margin: 0 0 0 0.5rem;
        }

        .fa-cicle{
            margin: 0 0.5rem 0 0;
        }
    </style>
</head>
<body>
    <div class="font-data" id="style-guide">
        <figure class="preview">
            <p class="font-name">${fontName}</p>
            <p class="font-cat">${fontCategory}</p>
            <p class="font-preview">
                <span class="preview-a">a</span>
                <span class="preview-g">g</span>
            </p>
        </figure>
        <figure class="variants">
            ${selectedVariants.map(variant => {
                let isItalic = variant.includes('italic');
                let weight = isItalic ? variant.replace('italic', '') : variant;
                const label = weight === '400' ? 'Regular' : weight;

                var textLabel = weightLabels[weight] + ' (' + weight + ')' + ( isItalic ? ' Italic' : '' );

                return `
                    <div class="option variant-${variant}">
                        <div class="label">${textLabel}</div>
                        <div class="data" style="font-weight: ${weight}; ${isItalic ? 'font-style: italic;' : ''}">
                            <p class="font-alpha-upper">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                            <p class="font-alpha-lower">abcdefghijklmnopqrstuvwxyz</p>
                            <p class="font-numeric">0123456789</p>
                            <p class="font-symbol">!@£#$€%^&*()-_=+"'{[]}:;&lt;,>.?/</p>
                        </div>
                    </div>
                `;
            }).join('')}
        </figure>
        <figure class="uses">
            <div class="option title">
                <p class="label">Title</p>
                <p class="data">The Outermost House</p>
            </div>
            <div class="option lead">
                <p class="label">Lead</p>
                <p class="data">In a world older and more complete tha ours they move finished and complete, gifted with estensions of the senses we have lost or never attained, living by voices we shall never hear.</p>
            </div>
            <div class="option paragraph">
                <p class="label">Paragraph</p>
                <p class="data">They are not brethren, they are not underlinks, they are other nations, caught with ourselves in the net of life and time, felow prisoners of the spendor and travail of the earth.</p>
            </div>
            <div class="option quote">
                <p class="label">Quote</p>
                <p class="data">&quot;We need another and a wiser and perhaps a more mystical concept of animals.&quot;</p>
            </div>
            <div class="option link">
                <p class="label">Link</p>
                <p class="data">
                    <a href="#link" class="option-one">Option 1 <span class="fa-solid fa-arrow-right icon"></span></a>
                    <a href="#link" class="option-two">Option 2 <span class="fa-solid fa-arrow-right icon"></span></a>
                </p>
            </div>
            <div class="option button">
                <p class="label">Button</p>
                <p class="data">
                    <a href="#button" class="option-one"><span class="fa-regular fa-circle icon"></span> Call to action</a>
                    <a href="#button" class="option-two"><span class="fa-regular fa-circle icon"></span> Call to action</a>
                </p>
            </div>
        </figure>
    </div>
</body>
</html>`;

    zip.file('preview.html', htmlPreview);

    // Generate the ZIP file
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${fontFamilySlug}-fonts.zip`);
    resetButton();

    function resetButton() {
        $btn.prop('disabled', false);
        $icon.removeClass('fa-spinner fa-spin-pulse').addClass('fa-download');
        $label.text('Download fonts');
    }
});

function generateFontOutput() {

    const selected = $('#font-variant-form input[name="variants[]"]:checked').map(function () {
        return $(this).val();
    }).get();

    const normal = [], italic = [];
    selected.forEach(v => {
        if (v.endsWith('italic')) {
            italic.push(v.replace('italic', '') || '400');
        } else {
            normal.push(v);
        }
    });

    const uniqueNormal = [...new Set(normal)].sort();
    const uniqueItalic = [...new Set(italic)].sort();

    const googleFontName = fontName.replace(/ /g, '+');
    const parts = [];

    if (uniqueNormal.length > 0) {
        parts.push(...uniqueNormal.map(w => `0,${w}`));
    }
    if (uniqueItalic.length > 0) {
        parts.push(...uniqueItalic.map(w => `1,${w}`));
    }

    if (parts.length === 0) {
        $('#html-output code').text('No variants selected.');
        return;
    }

    const weights = parts.join(';');
    const href = `https://fonts.googleapis.com/css2?family=${googleFontName}:ital,wght@${weights}&display=swap`;

    const cssOutput = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${href}" rel="stylesheet">`;

    const cssClasses = selected.map(v => {
        const isItalic = v.endsWith('italic');
        const weight = isItalic ? v.replace('italic', '') || '400' : v;
        const style = isItalic ? 'italic' : 'normal';

        const weightNameMap = {
            '100': 'thin',
            '200': 'extra-light',
            '300': 'light',
            '400': 'regular',
            '500': 'medium',
            '600': 'semi-bold',
            '700': 'bold',
            '800': 'extra-bold',
            '900': 'black'
        };

        const readableWeight = weightNameMap[weight] || weight;
        const className = `${fontName.toLowerCase().replace(/ /g, '-')}-${readableWeight}${isItalic ? '-italic' : ''}`;

        return `.${className} {\n  font-family: "${fontName}", ${fontCategory};\n  font-weight: ${weight};\n  font-style: ${style};\n}`;
    }).join('\n\n');

    $('#css-output code').html(Prism.highlight(cssClasses.trim().trimStart(), Prism.languages.css, 'css'));
    Prism.highlightAllUnder(document.getElementById('css-output'));

    $('#html-output code').html(Prism.highlight(cssOutput.trim().trimStart(), Prism.languages.html, 'html'));
    Prism.highlightAllUnder(document.getElementById('html-output'));
}

// Function to get a cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Function to set a cookie
function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}

// Function to update the theme based on the current preference
function updateThemeIcon(theme) {
    const icon = {
        'light-mode': 'fa-sun',
        'dark-mode': 'fa-moon',
        'auto-mode': 'fa-circle-half-stroke'
    }[theme];

    $('#toggle-theme i')
        .removeClass()
        .addClass(`fa-solid ${icon}`);
}

// Event listener to toggle the theme
$(document).on('click', '#toggle-theme', function () {
    let currentTheme = getCookie('fontdl_theme') || 'auto-mode';

    const themes = ['light-mode', 'dark-mode', 'auto-mode'];
    const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];

    // Set the new theme in the cookie
    setCookie('fontdl_theme', nextTheme);

    // Apply the theme to the body
    document.body.className = nextTheme;
    currentTheme = nextTheme;

    // Update the icon based on the new theme
    updateThemeIcon(currentTheme);
});

// Trigger when checkboxes change
$(document).on('change', '#font-variant-form input[name="variants[]"]', generateFontOutput);

async function getVerticalMetrics(fontSrc) {
    let font = await loadFont(fontSrc);
    let fontFamily = font.tables.name.fontFamily.en;

    // font metrics
    let { unitsPerEm, ascender, descender } = font;
    let xHeight = font.tables.os2.sxHeight;
    let capHeight = font.tables.os2.sCapHeight;

    // font rendering scale
    let fontSize = 100;
    let scale = fontSize / unitsPerEm;

    let yBaseline = ascender * scale;
    let yXHeight = yBaseline - xHeight * scale;
    let yCapHeight = yBaseline - capHeight * scale;
    let yDescender = yBaseline + Math.abs(descender) * scale;

    // output metrics to pre tag
    let data = {
        fontFamily,
        xHeight,
        capHeight,
        ascender,
        descender,
        unitsPerEm
    };

    // draw font glyph
    let yOffset = fontSize * (ascender / unitsPerEm);
    let path = font.getPath('AaBbCcHhIiJjXxYyZz', 0, yOffset, fontSize);

    const labelOffset = 2;
    const viewWidth = 1100;

    preview.setAttribute('d', path.toPathData(1));

    // position guide lines
    pathBaseline.setAttribute('y1', yBaseline);
    pathBaseline.setAttribute('y2', yBaseline);

    pathXheight.setAttribute('y1', yXHeight);
    pathXheight.setAttribute('y2', yXHeight);

    pathCapHeight.setAttribute('y1', yCapHeight);
    pathCapHeight.setAttribute('y2', yCapHeight);

    pathDescender.setAttribute('y1', yDescender);
    pathDescender.setAttribute('y2', yDescender);

    // update SVG viewBox
    let lineHeight = (ascender + Math.abs(descender)) * scale;
    svg.setAttribute('viewBox', [0, 0, viewWidth, lineHeight]);

    // Position labels slightly above the lines

    // Set Y positions
    labelBaselineLeft.setAttribute('y', yBaseline - labelOffset);
    labelXheightLeft.setAttribute('y', yXHeight - labelOffset);
    labelCapHeightLeft.setAttribute('y', yCapHeight - labelOffset);
    labelDescenderLeft.setAttribute('y', yDescender - labelOffset);

    labelBaselineRight.setAttribute('y', yBaseline - labelOffset);
    labelXheightRight.setAttribute('y', yXHeight - labelOffset);
    labelCapHeightRight.setAttribute('y', yCapHeight - labelOffset);
    labelDescenderRight.setAttribute('y', yDescender - labelOffset);

    // Set X positions for right-side labels
    labelBaselineRight.setAttribute('x', viewWidth - 5);
    labelXheightRight.setAttribute('x', viewWidth - 5);
    labelCapHeightRight.setAttribute('x', viewWidth - 5);
    labelDescenderRight.setAttribute('x', viewWidth - 5);
}


/**
* opentype.js helper
* Based on @yne's comment
* https://github.com/opentypejs/opentype.js/issues/183#issuecomment-1147228025
* will decompress woff2 files
*/
async function loadFont(src, options = {}) {
    let buffer = {};
    let font = {};
    let ext = 'woff2';
    let url;

    // 1. is file
    if (src instanceof Object) {
        // get file extension to skip woff2 decompression
        let filename = src.name.split(".");
        ext = filename[filename.length - 1];
        buffer = await src.arrayBuffer();
    }

    // 2. is base64 data URI
    else if (/^data/.test(src)) {
        // is base64
        let data = src.split(";");
        ext = data[0].split("/")[1];

        // create buffer from blob
        let srcBlob = await (await fetch(src)).blob();
        buffer = await srcBlob.arrayBuffer();
    }

    // 3. is url
    else {


        // if google font css - retrieve font src
        if (/googleapis.com/.test(src)) {
        ext = 'woff2';
        src = await getGoogleFontUrl(src, options);
        }


        // might be subset - no extension
        let hasExt = (src.includes('.woff2') || src.includes('.woff') || src.includes('.ttf') || src.includes('.otf')) ? true : false;
        url = src.split(".");
        ext = hasExt ? url[url.length - 1] : 'woff2';

        let fetchedSrc = await fetch(src);
        buffer = await fetchedSrc.arrayBuffer();
    }

    // decompress woff2
    if (ext === "woff2") {
        buffer = Uint8Array.from(Module.decompress(buffer)).buffer;
    }

    // parse font
    font = opentype.parse(buffer);
    return font;
}

async function getFontDeveloperInfo(fontSrc) {
    // Load the font using OpenType.js
    let font = await loadFont(fontSrc);
    
    // Access the 'name' table to get font metadata
    let nameTable = font.tables.name;

    // Get developer information from the name table
    let developerInfo = {
        fontFamily: nameTable.fontFamily.en, // Font family name
        fontSubFamily: nameTable.fontSubFamily, // Font subfamily (e.g., Regular, Bold)
        designerName: nameTable.designerName ? nameTable.designerName.en : "Not available", // Designer name
        designerURL: nameTable.designerURL ? nameTable.designerURL.en : "Not available", // Designer URL (if available)
        copyright: nameTable.copyright ? nameTable.copyright.en : "Not available", // Copyright info
        license: nameTable.license ? nameTable.license.en : "Not available" // License info (if available)
    };
    
    // Optionally, you can set the data into an HTML element
    $('#style-guide .ttf-meta .designer').text(developerInfo.designerName);
    $('#style-guide .ttf-meta .designer-url').text(developerInfo.designerURL);
    $('#style-guide .ttf-meta .copyright').text(developerInfo.copyright);
    $('#style-guide .ttf-meta .license').text(developerInfo.license);
}


function trackClick(category, label, action = 'click') {
    if (typeof gtag === 'function') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label,
        });
    } else {
        console.warn('gtag not found: Event not tracked');
    }
}

$(document).on('click', '[data-ga-category]', function () {
    const category = $(this).data('ga-category');
    const label = $(this).data('ga-label') || $(this).attr('href') || $(this).text().trim();
    trackClick(category, label);
});

// Trigger once on page load
generateFontOutput();