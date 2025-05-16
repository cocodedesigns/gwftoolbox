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

                var subsetOption = `
                    <option value="${subset}">${subsetLabel}</option>
                `;

                $('#font-subsets-toggle').append(subsetHTML);

                $('#unicodeSubset').append(subsetOption);
            });

            // Default to Latin if available
            if (fontSubsets.includes('latin')) {
                $('#unicodeSubset').val('latin');
            }

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

    // Set .text-one (prefers 700)
    var fontweightOne = setClosestFontWeight(700, selectedVariants);

    // Set .text-two (prefers 400)
    var fontweightTwo = setClosestFontWeight(400, selectedVariants);

    // Normalize variant values
    const normalizedVariants = selectedVariants.map(v => {
        if (v === '400') return 'regular';
        if (v === '400italic') return 'italic';
        return v.toLowerCase(); // e.g., '100italic'
    });

    // Fetch the font files data directly from the API
    const fontFilesData = fontFiles;

    const zip = new JSZip();
    const fontDir = zip.folder('fonts');
    const fontFaceRules = [];
    const downloadedFonts = new Set();

    // Iterate over selected variants and download the corresponding TTF files
    for (const variant of normalizedVariants) {
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

    let svgMarkup = await getVerticalMetrics(ttfFile, true);
    let devMarkup = await getFontDeveloperInfo(ttfFile, true);
    console.log(svgMarkup);

    // Generate the HTML preview file
    var htmlPreview = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview: ${fontName}</title>
    <style>
        @import url('./style.css');

        :root{
            --color-background: #f8f9fa;
            --color-text: #222;
            --color-accent: #3972cf;
            --color-metadata: #505050;
            --color-fontbutton-hover: #f0f0f0;
            --color-link: #1a73e8;
            --color-link-hover: #0c58c0;
            --color-button-bg: #e0e0e0;
            --color-button-border: #ccc;
            --color-button-hover: #d0d0d0;
            --color-button-text: #333;
            --color-ui-background: #fff;
            --color-notice-bg: #fff9db;         /* pastel yellow */
            --color-notice-border: #f7c948;     /* dandelion yellow */

            --color-baseline: #1e90ff;   /* Dodger Blue */
            --color-xheight: #2e8b57;    /* Sea Green */
            --color-capheight: #800080;  /* Purple */
            --color-descender: #dc143c;  /* Crimson */
        }

        /* Base Reset & Typography */
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }

        html, 
        body { 
            min-height: 100%; 
            font-family: '${fontName}', sans-serif;
            color: #222; 
            background: #f8f9fa; 
        }

        body{
            padding: 2.5rem 1rem;
        }

        a { 
            color: inherit; 
            text-decoration: none; 
            color: var(--color-link);
            transition: all .2s ease-in-out;
        }

        a:hover { 
            text-decoration: underline; 
            color: var(--color-link-hover);
        }

        .font-data {
            display: flex;
            flex-wrap: wrap;
            gap: 54px;
            max-width: 1400px;
            width: 100%;
            margin: 0 auto;
        }

        .font-data .preview{
            width: 100%;
            display: flex;
            gap: 30px;
            flex-wrap: wrap;
        }

        .font-data .preview .typeface{
            width: 275px;
        }

        .font-data .preview .typeface-tech{
            flex: 1;
            font-family: var(--body-typeface);
        }

        .font-data .preview .typeface-tech .ttf-meta{
            padding: 0 0 1.5rem;
        }

        .font-data .preview .typeface-tech .ttf-meta p:not(:last-of-type){
            padding: 0 0 0.5rem;
        }

        .font-data .preview .typeface-tech .ttf-meta p{ 
            line-height: 1.5;
            font-size: 0.9rem;
        }

        .font-data .preview .typeface-tech .ttf-meta .meta-data{
            font-weight: 700;
        }

        .font-data .preview .typeface-tech .typography-terms{
            padding: 1rem 0 0;
        }

        .font-data .preview .typeface-tech .typography-terms p{
            font-size: 0.85rem;
        }

        .font-data .preview .typeface-tech .typography-terms p:not(:last-of-type){
            padding: 0 0 0.2rem;
        }

        .font-data .variants{
            width: calc( 45% - 36px );
        }

        .font-data .uses{
            width: calc( 55% - 36px );
        }

        figure.preview {
            border-top: 1px solid #222;
            padding-top: 1rem;
        }

        .preview .font-name {
            font-family: var(--body-typeface); 
            font-size: 1.5rem;
            font-weight: 700;
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
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: var(--color-button-text);
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
            color: var(--color-button-text);
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

        .fa-icon{
            width: 0.9rem;
            display: inline-block;
            vertical-align: middle;
        }

        .fa-icon svg path{
            fill: currentColor;
        }

        .fa-arrow-right{
            margin: 0 0 0 0.5rem;
        }

        .fa-circle{
            margin: 0 0.5rem 0 0;
        }

        .uses .option.lead .data {
            font-size: 1.25rem;
            line-height: 1.5;
        }

        .uses .option.paragraph .data {
            font-size: 1rem;
            line-height: 1.5;
            color: var(--color-button-text);
        }

        .uses .option.quote .data {
            font-size: 1.15rem;
            font-style: italic;
            line-height: 1.5;
            font-weight: 400;
        }

        .uses .option.link .data a {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            text-decoration: none;
            color: var(--color-link);
            font-weight: 400;
            margin-right: 1rem;
        }

        .uses .option.link .dta a:hover{
            color: var(--color-link-hover);
        }

        .uses .option.button .data a {
            display: inline-block;
            border: 1px solid var(--color-text);
            padding: 0.75rem 1.5rem;
            text-decoration: none;
            font-weight: 400;
            margin: 0 1rem 1rem 0;
        }

        .uses .option.button .data .option-one{
            color: var(--color-text);
            background-color: transparent;
        }

        .uses .option.button .data .option-two{
            color: var(--color-ui-background);
            background-color: var(--color-text);
        }
        
        .main-text, .text-one, .text-two {
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        .main-text {
            padding: 3rem;
            position: relative;
            z-index: 2;
            background-color: var(--color-ui-background);
            color: var(--color-text);
            border: solid 1px #222;
            border-radius: 3px;
        }

        .main-text .text-one {
            font-size: 56px;
            font-weight: ${fontweightOne};
            margin-bottom: 0.5rem;
            line-height: 1;
        }

        .main-text .text-two {
            font-size: 36px;
            font-weight: ${fontweightTwo};
            line-height: 1;
        }

        .main-text span[contenteditable="true"] {
            display: block;
            line-height: 1.4;
            background: none;
            padding: 0.5rem;
            transition: background .1s ease-in-out;
            border-radius: 8px;
        }

        .main-text span[contenteditable="true"]:hover,
        .main-text span[contenteditable="true"]:focus{
            background: rgba(160, 160, 165, 0.3); /* darker on hover */
        }

        .main-text span[contenteditable="true"]:hover{
            cursor: pointer;
        }

        .main-text span[contenteditable="true"]:focus{
            cursor: text;
        }
    </style>
</head>
<body>
    <div class="font-data" id="style-guide">
        <figure class="preview">
            <div class="typeface">
                <p class="font-name">${fontName}</p>
                <p class="font-cat">${fontCategory}</p>
                <p class="font-preview">
                    <span class="preview-a">a</span>
                    <span class="preview-g">g</span>
                </p>
            </div>
            <div class="typeface-tech">
                <div class="ttf-meta">
                    <p>Designer: <span class="meta-data designer">${devMarkup.designerName}</span></p>
                    <p>Designer URL: <span class="meta-data designer-url">${devMarkup.designerURL}</span></p>
                    <p>Copyright: <span class="meta-data copyright">${devMarkup.copyright}</span></p>
                    <p>License: <span class="meta-data license">${devMarkup.license}</span></p>
                </div>
                <div id="sample">
                    ${svgMarkup}
                </div>

                <div class="typography-terms">
                    <p><strong>Baseline:</strong> The invisible line upon which most letters "sit." It serves as the foundation for aligning text across a line.</p>
                    <p><strong>X-Height:</strong> The height of the lowercase "x" in a typeface. It represents the typical height of lowercase letters and affects readability and visual size.</p>
                    <p><strong>Cap Height:</strong> The height of capital letters from the baseline, such as "H" or "T." It's used to align uppercase characters in a line of text.</p>
                    <p><strong>Ascender:</strong> The portion of a lowercase letter (like "b" or "d") that rises above the x-height.</p>
                    <p><strong>Descender:</strong> The part of a letter that falls below the baseline, such as in "y", "p", or "g."</p>
                    <p>For more information, visit <a href="https://www.myfonts.com/pages/fontscom-learning-fontology-level-1-type-anatomy-anatomy" target="_blank">Fonts.com: The Anatomy of a Typeface</a>.</p>
                </div>
            </div>
        </figure>
        <article class="main-text">
            <p class="text-one"><span contenteditable="true" class="input-one" data-default="The chills you get when listening to music are caused by your brain releasing dopamine.">The chills you get when listening to music are caused by your brain releasing dopamine.</span></p>
            <p class="text-two"><span contenteditable="true" class="input-two" data-default="When tunes that give you the chills, it's due to the fact that your brain reacts to the stimulation by releasing dopamine, which is a neurotransmitter that causes pleasure.">When tunes that give you the chills, it's due to the fact that your brain reacts to the stimulation by releasing dopamine, which is a neurotransmitter that causes pleasure.</span></p>
        </article>
        <figure class="variants" id="font-variants">
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
                    <a href="#link" class="option-one">Option 1 <span class="fa-icon fa-arrow-right">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                            <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/>
                        </svg>
                    </span></a>
                    <a href="#link" class="option-two">Option 2 <span class="fa-icon fa-arrow-right">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                            <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/>
                        </svg>
                    </span></a>
                </p>
            </div>
            <div class="option button">
                <p class="label">Button</p>
                <p class="data">
                    <a href="#button" class="option-one"><span class="fa-icon fa-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                            <path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/>
                        </svg>
                    </span> Call to action</a>
                    <a href="#button" class="option-two"><span class="fa-icon fa-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                            <path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/>
                        </svg>
                    </span> Call to action</a>
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

// Fallback method to calculate x-height and cap height if not present in OS/2
function getXHeightFallback(font) {
    const glyph = font.charToGlyph("x");
    return glyph.getBoundingBox().y2; // or y2 - y1 for actual height
}

function getCapHeightFallback(font) {
    const glyph = font.charToGlyph("H");
    return glyph.getBoundingBox().y2;
}

async function getVerticalMetrics(fontSrc, asString = false) {
    let font = await loadFont(fontSrc);
    
    let { unitsPerEm, ascender, descender } = font;
    let xHeight = font.tables.os2.sxHeight || getXHeightFallback(font);
    let capHeight = font.tables.os2.sCapHeight || getCapHeightFallback(font);

    let fontSize = 100;
    let scale = fontSize / unitsPerEm;

    let yBaseline = ascender * scale;
    let yXHeight = yBaseline - xHeight * scale;
    let yCapHeight = yBaseline - capHeight * scale;
    let yDescender = yBaseline + Math.abs(descender) * scale;

    let yOffset = fontSize * (ascender / unitsPerEm);
    let path = font.getPath('AaBbCcHhIiJjXxYyZz', 0, yOffset, fontSize);
    let viewWidth = 1100;
    let lineHeight = (ascender + Math.abs(descender)) * scale;

    if (asString) {
        // Return an SVG string
        let svgString = `
<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${viewWidth} ${lineHeight}">
    <path fill="black" d="${path.toPathData(1)}" />

    <!-- Guide Lines -->
    <line x1="0" x2="${viewWidth}" y1="${yBaseline}" y2="${yBaseline}" stroke="blue" stroke-width="1" />
    <line x1="0" x2="${viewWidth}" y1="${yXHeight}" y2="${yXHeight}" stroke="green" stroke-width="1" />
    <line x1="0" x2="${viewWidth}" y1="${yCapHeight}" y2="${yCapHeight}" stroke="purple" stroke-width="1" />
    <line x1="0" x2="${viewWidth}" y1="${yDescender}" y2="${yDescender}" stroke="red" stroke-width="1" stroke-dasharray="4 2" />

    <!-- Left Labels -->
    <text x="5" y="${yBaseline - 2}" fill="blue" font-size="10px" font-family="sans-serif">Baseline</text>
    <text x="5" y="${yXHeight - 2}" fill="green" font-size="10px" font-family="sans-serif">X-Height</text>
    <text x="5" y="${yCapHeight - 2}" fill="purple" font-size="10px" font-family="sans-serif">Cap Height</text>
    <text x="5" y="${yDescender - 2}" fill="red" font-size="10px" font-family="sans-serif">Descender</text>

    <!-- Right Labels -->
    <text x="${viewWidth - 5}" y="${yBaseline - 2}" text-anchor="end" fill="blue" font-size="10px" font-family="'Inter', sans-serif">Baseline</text>
    <text x="${viewWidth - 5}" y="${yXHeight - 2}" text-anchor="end" fill="green" font-size="10px" font-family="'Inter', sans-serif">X-Height</text>
    <text x="${viewWidth - 5}" y="${yCapHeight - 2}" text-anchor="end" fill="purple" font-size="10px" font-family="'Inter', sans-serif">Cap Height</text>
    <text x="${viewWidth - 5}" y="${yDescender - 2}" text-anchor="end" fill="red" font-size="10px" font-family="'Inter', sans-serif">Descender</text>
</svg>`.trim();
        return svgString;
    } else {
        // Render to DOM (as before)
        preview.setAttribute('d', path.toPathData(1));

        pathBaseline.setAttribute('y1', yBaseline);
        pathBaseline.setAttribute('y2', yBaseline);

        pathXheight.setAttribute('y1', yXHeight);
        pathXheight.setAttribute('y2', yXHeight);

        pathCapHeight.setAttribute('y1', yCapHeight);
        pathCapHeight.setAttribute('y2', yCapHeight);

        pathDescender.setAttribute('y1', yDescender);
        pathDescender.setAttribute('y2', yDescender);

        svg.setAttribute('viewBox', [0, 0, viewWidth, lineHeight]);

        labelBaselineLeft.setAttribute('y', yBaseline - 2);
        labelXheightLeft.setAttribute('y', yXHeight - 2);
        labelCapHeightLeft.setAttribute('y', yCapHeight - 2);
        labelDescenderLeft.setAttribute('y', yDescender - 2);

        labelBaselineRight.setAttribute('y', yBaseline - 2);
        labelXheightRight.setAttribute('y', yXHeight - 2);
        labelCapHeightRight.setAttribute('y', yCapHeight - 2);
        labelDescenderRight.setAttribute('y', yDescender - 2);

        labelBaselineRight.setAttribute('x', viewWidth - 5);
        labelXheightRight.setAttribute('x', viewWidth - 5);
        labelCapHeightRight.setAttribute('x', viewWidth - 5);
        labelDescenderRight.setAttribute('x', viewWidth - 5);
    }
}

// 1. Mapping Google Fonts subsets to Unicode ranges
const unicodeSubsetMap = {
    latin: [0x0020, 0x007F],
    'latin-ext': [0x0100, 0x024F],
    greek: [0x0370, 0x03FF],
    'greek-ext': [0x1F00, 0x1FFF],
    cyrillic: [0x0400, 0x04FF],
    'cyrillic-ext': [0x0500, 0x052F],
    vietnamese: [0x0102, 0x1EF9],
    arabic: [0x0600, 0x06FF],
    hebrew: [0x0590, 0x05FF],
    devanagari: [0x0900, 0x097F],
    thai: [0x0E00, 0x0E7F],
    bengali: [0x0980, 0x09FF],
    tamil: [0x0B80, 0x0BFF],
    telugu: [0x0C00, 0x0C7F],
    malayalam: [0x0D00, 0x0D7F],
    kannada: [0x0C80, 0x0CFF],
    gujarati: [0x0A80, 0x0AFF],
    gurmukhi: [0x0A00, 0x0A7F],
    sinhala: [0x0D80, 0x0DFF],
    khmer: [0x1780, 0x17FF],
    'vietnamese': [0x0102, 0x1EF9],
};

function generateCharacterMapFromFont(font, containerElement, unicodeRange = [32, 126]) {
    const fontClass = `custom-font-${Date.now()}`;

    // Inject @font-face style if not already present (optional)
    const style = document.createElement('style');
    style.textContent = `
        @font-face {
            font-family: '${fontClass}';
            src: url('${URL.createObjectURL(new Blob([font.toArrayBuffer()], { type: 'font/ttf' }))}');
        }
    `;
    document.head.appendChild(style);

    // Clear previous content
    containerElement.innerHTML = '';

    // Add container class for styling (optional)
    containerElement.classList.add('character-map');

    // Generate glyph boxes
    for (let code = unicodeRange[0]; code <= unicodeRange[1]; code++) {
        const glyph = font.charToGlyph(String.fromCharCode(code));
        if (!glyph) continue;

        const char = String.fromCharCode(code);
        const box = document.createElement('div');
        box.textContent = char;
        box.title = `U+${code.toString(16).toUpperCase()}`;
        box.classList.add('glyph-box', fontClass); // for custom font & styling

        containerElement.appendChild(box);

        box.addEventListener('click', () => handleGlyphClick(char, font));
    }
}

function handleGlyphClick(char, font) {
    const glyph = font.charToGlyph(char);
    if (!glyph) return;

    const glyphInfo = {
        name: glyph.name,
        unicode: glyph.unicode ? glyph.unicode.toString(16).toUpperCase().padStart(4, '0') : 'N/A',
        index: glyph.index,
        xMin: glyph.xMin,
        xMax: glyph.xMax,
        yMin: glyph.yMin,
        yMax: glyph.yMax,
        advanceWidth: glyph.advanceWidth,
        leftSideBearing: glyph.leftSideBearing
    };

    displayGlyphPreview(glyph, font);
    displayGlyphInfo(glyphInfo);
}

function displayGlyphPreview(glyph, font) {
    const container = document.getElementById('glyphPreview');
    container.innerHTML = '';

    const unitsPerEm = font.unitsPerEm;
    const scale = 1000 / unitsPerEm;

    const xHeight = font.tables.os2?.sxHeight ?? font.tables.hhea.ascender * 0.5;
    const capHeight = font.tables.os2?.sCapHeight ?? font.tables.hhea.ascender;
    const ascender = font.ascender;
    const descender = font.descender;

    const padding = 350;
    const scaledAdvanceWidth = glyph.advanceWidth * scale;
    const width = Math.max(scaledAdvanceWidth, 600);
    const height = (ascender - descender) * scale;

    const svgWidth = width + padding * 2;
    const svgHeight = height + padding * 2;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%'); // display size (can change)
    svg.setAttribute('height', '400');
    svg.setAttribute('viewBox', `${-padding} ${-ascender * scale - padding} ${svgWidth} ${svgHeight}`);

    // Grid lines
    const gridSpacing = 100;
    for (let x = -padding; x <= width + padding; x += gridSpacing) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('x2', x);
        line.setAttribute('y1', -ascender * scale - padding);
        line.setAttribute('y2', -descender * scale + padding);
        line.setAttribute('stroke', '#eee');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
    }
    for (let y = -ascender * scale - padding; y <= -descender * scale + padding; y += gridSpacing) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', -padding);
        line.setAttribute('x2', width + padding);
        line.setAttribute('y1', y);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', '#eee');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
    }

    // Metrics
    const metrics = [
        { y: 0, color: 'blue', label: 'Baseline' },
        { y: -xHeight * scale, color: 'green', label: 'x-height' },
        { y: -capHeight * scale, color: 'purple', label: 'Cap Height' },
        { y: -ascender * scale, color: '#999', label: 'Ascender' },
        { y: -descender * scale, color: 'red', label: 'Descender' }
    ];

    metrics.forEach(({ y, color, label }) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', -padding);
        line.setAttribute('x2', width + padding);
        line.setAttribute('y1', y);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '3.5');
        svg.appendChild(line);

        // Left label
        const leftLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        leftLabel.setAttribute('x', -padding + 5);
        leftLabel.setAttribute('y', y - 4);
        leftLabel.setAttribute('fill', color);
        leftLabel.setAttribute('font-size', '64');
        leftLabel.setAttribute('font-family', 'sans-serif');
        leftLabel.textContent = label;
        svg.appendChild(leftLabel);

        // Right label
        const rightLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        rightLabel.setAttribute('x', width + padding - 5);
        rightLabel.setAttribute('y', y - 4);
        rightLabel.setAttribute('fill', color);
        rightLabel.setAttribute('font-size', '64');
        rightLabel.setAttribute('font-family', 'sans-serif');
        rightLabel.setAttribute('text-anchor', 'end');
        rightLabel.textContent = label;
        svg.appendChild(rightLabel);
    });

    // Advance width markers (dashed verticals at 0 and advance width)
    [0, scaledAdvanceWidth].forEach((xPos, i) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', xPos);
        line.setAttribute('x2', xPos);
        line.setAttribute('y1', -ascender * scale - padding);
        line.setAttribute('y2', -descender * scale + padding);
        line.setAttribute('stroke', '#999');
        line.setAttribute('stroke-dasharray', '4,2');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', xPos + 4);
        text.setAttribute('y', 40); // readable position above baseline
        text.setAttribute('fill', '#555');
        text.setAttribute('font-size', '28');
        text.setAttribute('font-family', 'monospace');
        text.textContent = i === 0 ? '0' : `${Math.round(glyph.advanceWidth)}`;
        svg.appendChild(text);
    });

    // Glyph path
    const path = glyph.getPath(0, 0, 1000); // base units
    const d = path.toPathData(3);
    const outline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    outline.setAttribute('d', d);
    outline.setAttribute('fill', 'black');
    outline.setAttribute('stroke', 'black');
    svg.appendChild(outline);

    // On-curve / off-curve points
    path.commands.forEach(cmd => {
        let points = [];
        switch (cmd.type) {
            case 'M':
            case 'L':
                points.push({ x: cmd.x, y: cmd.y, onCurve: true });
                break;
            case 'Q':
                points.push({ x: cmd.x1, y: cmd.y1, onCurve: false });
                points.push({ x: cmd.x, y: cmd.y, onCurve: true });
                break;
            case 'C':
                points.push({ x: cmd.x1, y: cmd.y1, onCurve: false });
                points.push({ x: cmd.x2, y: cmd.x2, onCurve: false });
                points.push({ x: cmd.x, y: cmd.y, onCurve: true });
                break;
        }

        points.forEach(pt => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', pt.x);
            circle.setAttribute('cy', pt.y);
            circle.setAttribute('r', 10);
            circle.setAttribute('fill', pt.onCurve ? '#0c0' : '#c00');
            circle.setAttribute('stroke', '#000');
            circle.setAttribute('stroke-width', '1');
            svg.appendChild(circle);
        });
    });

    container.appendChild(svg);
}

function displayGlyphInfo(info) {
    $('#character-map #glyphInfo .data-item.name').text(info.name);
    $('#character-map #glyphInfo .data-item.unicode').text(info.unicode);
    $('#character-map #glyphInfo .data-item.index').text(info.index);
    $('#character-map #glyphInfo .data-item.xmin').text(info.xMin);
    $('#character-map #glyphInfo .data-item.xmax').text(info.xMax);
    $('#character-map #glyphInfo .data-item.ymin').text(info.yMin);
    $('#character-map #glyphInfo .data-item.ymax').text(info.yMax);
    $('#character-map #glyphInfo .data-item.advancewidth').text(info.advanceWidth);
    $('#character-map #glyphInfo .data-item.leftsidebearing').text(info.leftSideBearing);
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

async function getFontDeveloperInfo(fontSrc, asString = false) {
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

    if (asString){
        return developerInfo;
    } else {
        // Optionally, you can set the data into an HTML element
        $('#style-guide .ttf-meta .designer').text(developerInfo.designerName);
        $('#style-guide .ttf-meta .designer-url').text(developerInfo.designerURL);
        $('#style-guide .ttf-meta .copyright').text(developerInfo.copyright);
        $('#style-guide .ttf-meta .license').text(developerInfo.license);
    }
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