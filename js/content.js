$(document).ready(function () {
    initToggles(); // Run on initial load
});

$('#get-font').on('click', function(e){
    e.preventDefault();

    $('#code-content')
        .removeClass()
        .addClass('google-cdn');
    $('#code-content .tab-content').removeClass('show').hide();
    $('#code-content .tab-button').removeClass('active');

    $('#code-content .tab-content.google-cdn').addClass('show').show();
    $('#code-content .tab-button.google-cdn').addClass('active');

    $('#code-modal').fadeIn(350);
});

$('#close-modal').on('click', function(){
    $('#code-modal').fadeOut(350);
});

// Correct way to initialize Coloris() only once for an element
Coloris({
    el: '.coloris',
    theme: 'pill',
    swatches: [
        '#264653',
        '#2a9d8f',
        '#e9c46a',
        '#f4a261',
        '#e76f51',
        '#d62828',
        '#023e8a',
        '#0077b6',
        '#0096c7',
        '#00b4d8',
        '#48cae4'
    ]
});

$(document).ready(function () {
    const keys = {
        primary: 'fontPreview_primary',
        secondary: 'fontPreview_secondary',
        background: 'fontPreview_background'
    };

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

        $('.text-one').css('color', primary);
        $('.text-two').css('color', secondary);
        $('article.main-text').css('background-color', background);

        if (primary !== '') localStorage.setItem(keys.primary, primary);
        if (secondary !== '') localStorage.setItem(keys.secondary, secondary);
        if (background !== '') localStorage.setItem(keys.background, background);
    }

    $('#primary-color, #secondary-color, #background-color').on('input change', updateFontStyles);

    loadStoredColors();

    updateFontStyles();

    $('#reset-colors').on('click', function (e) {
        e.preventDefault();
        // Remove saved values from localStorage
        localStorage.removeItem(keys.primary);
        localStorage.removeItem(keys.secondary);
        localStorage.removeItem(keys.background);

        // Reset inputs to their default values from data-default attributes
        ['#primary-color', '#secondary-color', '#background-color'].forEach(selector => {
            const input = $(selector);
            const defaultVal = input.data('default');
            input.val(defaultVal);

            // Update Coloris if available
            const el = input.get(0);
            if (window.Coloris?.setInstanceValue) {
                Coloris.setInstanceValue(el, defaultVal);
            } else {
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });

        // Apply styles again
        updateFontStyles();
    });
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

document.querySelectorAll("#primary-color, #secondary-color, #background-color").forEach(input => {
    input.addEventListener("input", updateAllContrastTests);
});

// Initial run
updateAllContrastTests();

document.querySelectorAll('[contenteditable="true"]').forEach(span => {
    span.addEventListener('focus', function () {
        // Delay ensures selection occurs after focus
        setTimeout(() => {
            const range = document.createRange();
            range.selectNodeContents(this);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }, 0);
    });
});

document.querySelectorAll('[contenteditable="true"]').forEach(span => {
    const key = `editable-${span.className}`; // Use the class as a unique key
    const defaultText = span.getAttribute('data-default') || 'Type something…';

    // Load from localStorage or insert default
    const saved = localStorage.getItem(key);
    if (saved) {
        span.textContent = saved;
    } else if (span.textContent.trim() === '') {
        span.textContent = defaultText;
        span.classList.add('is-default');
    }

    // Select content on focus
    span.addEventListener('focus', () => {
        if (span.classList.contains('is-default')) {
            span.textContent = '';
            span.classList.remove('is-default');
        }

        // Delay needed for selection to work
        setTimeout(() => {
            const range = document.createRange();
            range.selectNodeContents(span);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }, 0);
    });

    // Save to localStorage on blur
    span.addEventListener('blur', () => {
        const content = span.textContent.trim();
        if (content === '') {
            span.textContent = "Enter text here";
            span.classList.add('is-default');
            localStorage.removeItem(key); // Clear it
        } else {
            localStorage.setItem(key, content);
        }
    });
});

$(document).on('click', '#reset-text', function (e) {
	e.preventDefault();

    console.log('Resetting text');

	$('[contenteditable="true"]').each(function () {
		const key = `editable-${$(this).attr('class')}`;
		const defaultText = $(this).attr('data-default') || 'Type something…';

		$(this).text(defaultText);
		localStorage.removeItem(key);
	});
});

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

$('#copy-html').on('click', function (e) {
    e.preventDefault();
    const htmlCode = $('#html-output code').text();
    navigator.clipboard.writeText(htmlCode)
        .then(() => showToast('HTML copied!', 'success'))
        .catch(() => showToast('Failed to copy HTML.', 'error'));
});

$('#copy-css').on('click', function (e) {
    e.preventDefault();
    const cssCode = $('#css-output code').text();
    navigator.clipboard.writeText(cssCode)
        .then(() => showToast('CSS copied!', 'success'))
        .catch(() => showToast('Failed to copy CSS.', 'error'));
});

