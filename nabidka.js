// ============================================
// Yes.cz RFQ - Dodavatelský formulář nabídky
// ============================================

// ============================================
// KONFIGURACE
// ============================================
const NABIDKA_CONFIG = {
    WEBHOOK_URL: 'https://hook.eu1.make.com/fv734p7p8aar5yfenpybsf9dl62kj5j9',
    TIMEOUT: 10000,
    DEBUG: false
};

// ============================================
// DOM ELEMENTS
// ============================================
const errorAlert = document.getElementById('errorAlert');
const errorMessage = document.getElementById('errorMessage');
const invalidLinkCard = document.getElementById('invalidLinkCard');
const expiredCard = document.getElementById('expiredCard');
const offerCard = document.getElementById('offerCard');
const successCard = document.getElementById('successCard');
const offerForm = document.getElementById('offerForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const declineBtn = document.getElementById('declineBtn');

// Form inputs
const poznamkaInput = document.getElementById('nabidka_poznamka');
const productPricesContainer = document.getElementById('product-prices');
const zpusobBaleniInput = document.getElementById('zpusob_baleni');
const pocetPaletInput = document.getElementById('pocet_palet');
const rozmerPaletyInput = document.getElementById('rozmery_palety');
const vahaKgInput = document.getElementById('vaha_kg');

// Error elements
const pricesError = document.getElementById('prices-error');
const zpusobBaleniError = document.getElementById('zpusob-baleni-error');
const pocetPaletError = document.getElementById('pocet-palet-error');
const rozmerPaletyError = document.getElementById('rozmery-palety-error');
const vahaKgError = document.getElementById('vaha-kg-error');

// ============================================
// URL PARAMETRY
// ============================================
const urlParams = new URLSearchParams(window.location.search);
const params = {
    record_id: urlParams.get('record_id'),
    znacka: urlParams.get('znacka'),
    specifikace: urlParams.get('specifikace'),
    produkty: urlParams.get('produkty'),
    termin: urlParams.get('termin'),
    dodavatel: urlParams.get('dodavatel'),
    uzaverka: urlParams.get('uzaverka')
};

// Parsed products (shared between render and submit)
var parsedProducts = [];

// Prevent double submission
var isSubmitting = false;

// ============================================
// JAZYKOVÁ DETEKCE
// ============================================
var langParam = new URLSearchParams(window.location.search).get('lang');
var isCzech = langParam
    ? (langParam === 'cs' || langParam === 'sk')
    : ((navigator.language || '').startsWith('cs') || (navigator.language || '').startsWith('sk'));

var CS_NABIDKA = {
    invalidTitle: 'Neplatný odkaz',
    invalidText: 'Neplatný odkaz. Zkontrolujte email s pozvánkou.',
    expiredTitle: 'Uzávěrka skončila',
    expiredText: 'Uzávěrka pro tuto poptávku skončila. Děkujeme za zájem.',
    sectionDetail: 'Detail poptávky',
    labelDodavatel: 'Dodavatel',
    labelZnacka: 'Značka',
    labelDeadline: 'Uzávěrka nabídek',
    sectionOffer: 'Vaše nabídka',
    labelPrices: 'Cena za položky v EUR bez DPH',
    pricesHintTop: 'Cenu uveďte již nejnižší možnou, je možná pouze jediná nabídka.',
    pricesHintBottom: 'Cena včetně dopravy na sklad: Sparkinvest s.r.o., Kozomín 501, 277 45 Kozomín',
    noProducts: 'Žádné produkty',
    labelBaleni: 'Způsob balení',
    baleniPlaceholder: 'Např. na paletě, v kartonu...',
    labelPalet: 'Počet palet',
    labelRozmery: 'Rozměry zásilky (cm)',
    rozmeryPlaceholder: 'délka × šířka × výška (cm), např. 120 × 80 × 150',
    rozmeryHint: 'délka × šířka × výška, např. 120 × 80 × 150',
    labelVaha: 'Váha celkem (kg)',
    labelNote: 'Poznámka',
    noteHint: 'Maximálně 1000 znaků',
    submitBtn: 'Odeslat nabídku',
    submitting: 'Odesílám...',
    declineBtn: 'Odmítám se účastnit',
    successTitle: 'Děkujeme!',
    successText: 'Nabídka odeslána! Děkujeme.',
    declineTitle: 'Vaše odmítnutí bylo zaznamenáno',
    declineText: 'Děkujeme za odpověď.',
    optional: '(volitelně)',
    required: '*',
    errorTitle: 'Chyba',
    submitAriaLabel: 'Odeslat nabídku',
    priceFor: 'Cena za ',
    // Validation
    errPrices: 'Vyplňte cenu u všech položek. Cena musí být větší než 0.',
    errBaleni: 'Vyplňte způsob balení.',
    errPalet: 'Zadejte počet palet (min. 1).',
    errRozmery: 'Vyplňte rozměry zásilky.',
    errVaha: 'Zadejte váhu (větší než 0).',
    errGeneral: 'Chyba při odesílání. Zkuste znovu nebo kontaktujte support.',
    errTimeout: 'Požadavek trval příliš dlouho. Zkuste to znovu.',
    errNetwork: 'Nepodařilo se odeslat nabídku. Zkontrolujte připojení.'
};

var EN_NABIDKA = {
    invalidTitle: 'Invalid link',
    invalidText: 'Invalid link. Please check the invitation email.',
    expiredTitle: 'Deadline expired',
    expiredText: 'The deadline for this request has passed. Thank you for your interest.',
    sectionDetail: 'Request details',
    labelDodavatel: 'Supplier',
    labelZnacka: 'Brand',
    labelDeadline: 'Offer deadline',
    sectionOffer: 'Your offer',
    labelPrices: 'Price per item in EUR excl. VAT',
    pricesHintTop: 'Please enter the lowest possible price, only one offer is allowed.',
    pricesHintBottom: 'Price including delivery to warehouse: Sparkinvest s.r.o., Kozomín 501, 277 45 Kozomín',
    noProducts: 'No products',
    labelBaleni: 'Packaging method',
    baleniPlaceholder: 'E.g. on pallet, in carton...',
    labelPalet: 'Number of pallets',
    labelRozmery: 'Shipment dimensions (cm)',
    rozmeryPlaceholder: 'length × width × height (cm), e.g. 120 × 80 × 150',
    rozmeryHint: 'length × width × height, e.g. 120 × 80 × 150',
    labelVaha: 'Total weight (kg)',
    labelNote: 'Note',
    noteHint: 'Maximum 1000 characters',
    submitBtn: 'Submit offer',
    submitting: 'Submitting...',
    declineBtn: 'Decline participation',
    successTitle: 'Thank you!',
    successText: 'Offer submitted! Thank you.',
    declineTitle: 'Your decline has been recorded',
    declineText: 'Thank you for your response.',
    optional: '(optional)',
    required: '*',
    errorTitle: 'Error',
    submitAriaLabel: 'Submit offer',
    priceFor: 'Price for ',
    // Validation
    errPrices: 'Fill in the price for all items. Price must be greater than 0.',
    errBaleni: 'Fill in the packaging method.',
    errPalet: 'Enter the number of pallets (min. 1).',
    errRozmery: 'Fill in the shipment dimensions.',
    errVaha: 'Enter the weight (greater than 0).',
    errGeneral: 'Error submitting. Please try again or contact support.',
    errTimeout: 'Request took too long. Please try again.',
    errNetwork: 'Failed to submit the offer. Check your connection.'
};

var tn = isCzech ? CS_NABIDKA : EN_NABIDKA;

// ============================================
// UTILITY FUNKCE
// ============================================

function log(...args) {
    if (NABIDKA_CONFIG.DEBUG) {
        console.log('[Nabidka]', ...args);
    }
}

function formatCzechDate(dateStr) {
    if (!dateStr) return '';
    try {
        var parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return parseInt(parts[2], 10) + '. ' + parseInt(parts[1], 10) + '. ' + parts[0];
    } catch (e) {
        return dateStr;
    }
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    errorMessage.textContent = message;
    errorAlert.style.display = 'flex';
}

function showFieldError(errorEl, message) {
    errorEl.textContent = message;
    errorEl.classList.add('active');
    var group = errorEl.closest('.form-group');
    if (group) group.classList.add('field-error');
}

function clearFieldError(errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('active');
    var group = errorEl.closest('.form-group');
    if (group) group.classList.remove('field-error');
}

function isExpired(uzaverkaStr) {
    if (!uzaverkaStr) return false;
    try {
        var uzaverka = new Date(uzaverkaStr + 'T12:00:00');
        var now = new Date();
        return now > uzaverka;
    } catch (e) {
        return false;
    }
}

// ============================================
// PARSOVÁNÍ PRODUKTŮ Z URL
// ============================================

function parseProducts() {
    var products = [];

    if (params.produkty) {
        try {
            var parsed = JSON.parse(decodeURIComponent(params.produkty));
            if (Array.isArray(parsed)) {
                products = parsed;
            }
        } catch (e) {
            log('Products parse error, trying text:', e);
        }
    }

    // Fallback: specifikace jako text
    if (products.length === 0 && params.specifikace) {
        var lines = decodeURIComponent(params.specifikace).split('\n');
        lines.forEach(function(line) {
            line = line.trim();
            if (!line) return;
            var match = line.match(/^(.+?)\s*-\s*(\d+)\s*ks$/i);
            if (match) {
                products.push({
                    specification: match[1].trim(),
                    quantity: parseInt(match[2], 10)
                });
            } else {
                products.push({ specification: line, quantity: null });
            }
        });
    }

    return products;
}

// ============================================
// ZOBRAZENÍ DETAILU POPTÁVKY
// ============================================

function renderDetail() {
    // Dodavatel
    var dodavatelEl = document.getElementById('val-dodavatel');
    if (params.dodavatel) {
        dodavatelEl.textContent = decodeURIComponent(params.dodavatel);
    } else {
        document.getElementById('detail-dodavatel').style.display = 'none';
    }

    // Značka
    var znackaEl = document.getElementById('val-znacka');
    znackaEl.textContent = params.znacka ? decodeURIComponent(params.znacka) : '—';

    // Uzávěrka
    var uzaverkaEl = document.getElementById('val-uzaverka');
    if (params.uzaverka) {
        uzaverkaEl.textContent = formatCzechDate(params.uzaverka) + ' do 12:00';
    } else {
        uzaverkaEl.textContent = '—';
    }

    // Produkty s cenami
    parsedProducts = parseProducts();
    renderProductPrices();
}

// ============================================
// PRODUKTY S CENAMI
// ============================================

function renderProductPrices() {
    productPricesContainer.innerHTML = '';

    if (parsedProducts.length === 0) {
        var emptyRow = document.createElement('div');
        emptyRow.className = 'product-price-row';
        emptyRow.innerHTML = '<span class="product-price-label">' + tn.noProducts + '</span>';
        productPricesContainer.appendChild(emptyRow);
        return;
    }

    parsedProducts.forEach(function(product, index) {
        var spec = product.specification || product.specifikace || '';
        var qty = product.quantity || product.pocet_kusu;

        var row = document.createElement('div');
        row.className = 'product-price-row';

        var label = document.createElement('div');
        label.className = 'product-price-label';
        var labelText = escapeHtml(spec);
        if (qty) {
            labelText += ' <span class="product-price-qty">' + qty + ' ks</span>';
        }
        label.innerHTML = labelText;

        var inputWrapper = document.createElement('div');
        inputWrapper.className = 'input-wrapper product-price-input-wrapper';

        var input = document.createElement('input');
        input.type = 'number';
        input.className = 'form-input product-price-input';
        input.placeholder = '0.00';
        input.min = '0.01';
        input.step = '0.01';
        input.required = true;
        input.setAttribute('data-index', index);
        input.setAttribute('aria-label', tn.priceFor + spec);

        var suffix = document.createElement('span');
        suffix.className = 'input-suffix';
        suffix.textContent = 'EUR';

        inputWrapper.appendChild(input);
        inputWrapper.appendChild(suffix);

        row.appendChild(label);
        row.appendChild(inputWrapper);

        productPricesContainer.appendChild(row);

        // Clear error on input
        input.addEventListener('input', function() {
            clearFieldError(pricesError);
            input.style.borderColor = '';
        });
    });
}

function getPriceInputs() {
    return productPricesContainer.querySelectorAll('.product-price-input');
}

// ============================================
// VALIDACE
// ============================================

function validatePrices() {
    var inputs = getPriceInputs();
    var allValid = true;

    inputs.forEach(function(input) {
        var value = parseFloat(input.value);
        if (!input.value || isNaN(value) || value <= 0) {
            input.style.borderColor = 'var(--red-error)';
            allValid = false;
        } else {
            input.style.borderColor = '';
        }
    });

    if (!allValid) {
        return tn.errPrices;
    }
    return null;
}

function validateShippingFields() {
    var valid = true;

    clearFieldError(zpusobBaleniError);
    clearFieldError(pocetPaletError);
    clearFieldError(rozmerPaletyError);
    clearFieldError(vahaKgError);

    if (!zpusobBaleniInput.value.trim()) {
        showFieldError(zpusobBaleniError, tn.errBaleni);
        valid = false;
    }

    var pocet = parseInt(pocetPaletInput.value, 10);
    if (!pocetPaletInput.value || isNaN(pocet) || pocet < 1) {
        showFieldError(pocetPaletError, tn.errPalet);
        valid = false;
    }

    if (!rozmerPaletyInput.value.trim()) {
        showFieldError(rozmerPaletyError, tn.errRozmery);
        valid = false;
    }

    var vaha = parseFloat(vahaKgInput.value);
    if (!vahaKgInput.value || isNaN(vaha) || vaha <= 0) {
        showFieldError(vahaKgError, tn.errVaha);
        valid = false;
    }

    return valid;
}

// ============================================
// LOADING STAV
// ============================================

function setLoadingState(loading) {
    var priceInputs = getPriceInputs();

    if (loading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        poznamkaInput.disabled = true;
        zpusobBaleniInput.disabled = true;
        pocetPaletInput.disabled = true;
        rozmerPaletyInput.disabled = true;
        vahaKgInput.disabled = true;
        declineBtn.disabled = true;
        priceInputs.forEach(function(input) { input.disabled = true; });
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        poznamkaInput.disabled = false;
        zpusobBaleniInput.disabled = false;
        pocetPaletInput.disabled = false;
        rozmerPaletyInput.disabled = false;
        vahaKgInput.disabled = false;
        declineBtn.disabled = false;
        priceInputs.forEach(function(input) { input.disabled = false; });
    }
}

// ============================================
// ODESLÁNÍ NABÍDKY
// ============================================

async function submitOffer() {
    if (isSubmitting) return;
    clearFieldError(pricesError);

    var error = validatePrices();
    if (error) {
        showFieldError(pricesError, error);
        var firstEmpty = productPricesContainer.querySelector('.product-price-input[style*="red"]');
        if (firstEmpty) firstEmpty.focus();
        return;
    }

    if (!validateShippingFields()) {
        return;
    }

    // Kontrola uzávěrky před odesláním
    if (isExpired(params.uzaverka)) {
        offerCard.style.display = 'none';
        expiredCard.style.display = 'block';
        return;
    }

    // Sestavit produkty s cenami
    var priceInputs = getPriceInputs();
    var products = [];
    parsedProducts.forEach(function(product, index) {
        products.push({
            specification: product.specification || product.specifikace || '',
            quantity: product.quantity || product.pocet_kusu || null,
            price: parseFloat(priceInputs[index].value)
        });
    });

    var data = {
        record_id: params.record_id,
        products: products,
        zpusob_baleni: zpusobBaleniInput.value.trim(),
        pocet_palet: parseInt(pocetPaletInput.value, 10),
        rozmery_palety: rozmerPaletyInput.value.trim(),
        vaha_kg: parseFloat(vahaKgInput.value),
        poznamka: poznamkaInput.value.trim() || '',
        datum_odeslani: new Date().toISOString()
    };

    log('Odesílám nabídku:', data);
    isSubmitting = true;
    setLoadingState(true);

    try {
        var controller = new AbortController();
        var timeoutId = setTimeout(function () { controller.abort(); }, NABIDKA_CONFIG.TIMEOUT);

        var response = await fetch(NABIDKA_CONFIG.WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            var errorText = await response.text();
            throw new Error('Server error: ' + response.status + ' ' + errorText);
        }

        log('Nabídka odeslána úspěšně');
        offerCard.style.display = 'none';
        document.getElementById('successTitle').textContent = tn.successTitle;
        document.getElementById('successPerex').textContent = tn.successText;
        successCard.style.display = 'block';
        successCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
        log('Error:', err);

        var errorMsg = tn.errGeneral;

        if (err.name === 'AbortError') {
            errorMsg = tn.errTimeout;
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            errorMsg = tn.errNetwork;
        }

        showError(errorMsg);
        isSubmitting = false;
        setLoadingState(false);
    }
}

// ============================================
// ODMÍTNUTÍ ÚČASTI
// ============================================

function declineOffer() {
    if (isExpired(params.uzaverka)) {
        offerCard.style.display = 'none';
        expiredCard.style.display = 'block';
        return;
    }

    offerCard.style.display = 'none';
    document.getElementById('successTitle').textContent = tn.declineTitle;
    document.getElementById('successPerex').textContent = tn.declineText;
    successCard.style.display = 'block';
    successCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// EVENT LISTENERS
// ============================================

offerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    submitOffer();
});

declineBtn.addEventListener('click', function () {
    declineOffer();
});

// Clear errors on input for shipping fields
zpusobBaleniInput.addEventListener('input', function() { clearFieldError(zpusobBaleniError); });
pocetPaletInput.addEventListener('input', function() { clearFieldError(pocetPaletError); });
rozmerPaletyInput.addEventListener('input', function() { clearFieldError(rozmerPaletyError); });
vahaKgInput.addEventListener('input', function() { clearFieldError(vahaKgError); });

// Počítadlo znaků poznámky
poznamkaInput.addEventListener('input', function () {
    var counter = document.getElementById('nabidka-poznamka-counter');
    if (counter) {
        var length = poznamkaInput.value.length;
        counter.textContent = length + '/1000';
        counter.style.color = length > 1000 ? 'var(--red-error)' : 'var(--text-secondary)';
    }
});

// ============================================
// PŘEKLAD UI
// ============================================

function applyNabidkaTranslations() {
    if (isCzech) return;

    document.documentElement.lang = 'en';
    document.title = tn.submitBtn + ' - Yes.cz';

    // Invalid link card
    var invalidTitle = invalidLinkCard.querySelector('.form-title');
    if (invalidTitle) invalidTitle.textContent = tn.invalidTitle;
    var invalidText = invalidLinkCard.querySelector('.form-subtitle');
    if (invalidText) invalidText.textContent = tn.invalidText;

    // Expired card
    var expTitle = expiredCard.querySelector('.form-title');
    if (expTitle) expTitle.textContent = tn.expiredTitle;
    var expText = expiredCard.querySelector('.form-subtitle');
    if (expText) expText.textContent = tn.expiredText;

    // Detail section
    var legends = document.querySelectorAll('.form-section-title');
    if (legends[0]) legends[0].textContent = tn.sectionDetail;
    if (legends[1]) legends[1].textContent = tn.sectionOffer;

    // Detail labels
    var dodavLabel = document.querySelector('#detail-dodavatel .detail-label');
    if (dodavLabel) dodavLabel.textContent = tn.labelDodavatel;
    var znackaLabel = document.querySelector('.detail-item:nth-child(2) .detail-label');
    if (znackaLabel) znackaLabel.textContent = tn.labelZnacka;
    var deadlineLabel = document.querySelector('.deadline-label');
    if (deadlineLabel) deadlineLabel.textContent = tn.labelDeadline;

    // Price section
    var priceLabel = document.querySelector('label[class="form-label"]:first-of-type') || productPricesContainer?.closest('.form-group')?.querySelector('.form-label');
    if (priceLabel) priceLabel.innerHTML = tn.labelPrices + ' <span class="required">' + tn.required + '</span>';
    var priceHintTop = productPricesContainer?.closest('.form-group')?.querySelector('.form-hint');
    if (priceHintTop) priceHintTop.textContent = tn.pricesHintTop;
    var priceHintBottom = document.getElementById('prices-hint');
    if (priceHintBottom) priceHintBottom.textContent = tn.pricesHintBottom;

    // Shipping fields
    var baleniLabel = document.querySelector('label[for="zpusob_baleni"]');
    if (baleniLabel) baleniLabel.innerHTML = tn.labelBaleni + ' <span class="required">' + tn.required + '</span>';
    zpusobBaleniInput.placeholder = tn.baleniPlaceholder;

    var paletLabel = document.querySelector('label[for="pocet_palet"]');
    if (paletLabel) paletLabel.innerHTML = tn.labelPalet + ' <span class="required">' + tn.required + '</span>';

    var rozmeryLabel = document.querySelector('label[for="rozmery_palety"]');
    if (rozmeryLabel) rozmeryLabel.innerHTML = tn.labelRozmery + ' <span class="required">' + tn.required + '</span>';
    rozmerPaletyInput.placeholder = tn.rozmeryPlaceholder;
    var rozmeryHint = document.getElementById('rozmery-palety-hint');
    if (rozmeryHint) rozmeryHint.textContent = tn.rozmeryHint;

    var vahaLabel = document.querySelector('label[for="vaha_kg"]');
    if (vahaLabel) vahaLabel.innerHTML = tn.labelVaha + ' <span class="required">' + tn.required + '</span>';

    // Note
    var noteLabel = document.querySelector('label[for="nabidka_poznamka"]');
    if (noteLabel) noteLabel.innerHTML = tn.labelNote + ' <span class="optional">' + tn.optional + '</span>';
    var noteHint = document.getElementById('nabidka-poznamka-hint');
    if (noteHint) noteHint.textContent = tn.noteHint;

    // Error alert
    var errorStrong = errorAlert.querySelector('strong');
    if (errorStrong) errorStrong.textContent = tn.errorTitle;

    // Buttons
    if (btnText) btnText.textContent = tn.submitBtn;
    submitBtn.setAttribute('aria-label', tn.submitAriaLabel);
    var loaderSpan = submitBtn.querySelector('.btn-loader');
    if (loaderSpan) loaderSpan.innerHTML = '<span class="spinner"></span> ' + tn.submitting;
    if (declineBtn) declineBtn.textContent = tn.declineBtn;
}

// ============================================
// INICIALIZACE
// ============================================

function setupLangSwitcher() {
    var buttons = document.querySelectorAll('.lang-btn');
    buttons.forEach(function (btn) {
        var lang = btn.getAttribute('data-lang');
        if ((isCzech && lang === 'cs') || (!isCzech && lang === 'en')) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.setAttribute('aria-pressed', 'false');
        }
        btn.addEventListener('click', function () {
            if (btn.classList.contains('active')) return;
            var url = new URL(window.location.href);
            url.searchParams.set('lang', lang);
            window.location.href = url.toString();
        });
    });
}

function init() {
    log('Initializing nabidka page...', params);

    applyNabidkaTranslations();
    setupLangSwitcher();

    // 1. Kontrola record_id
    if (!params.record_id) {
        invalidLinkCard.style.display = 'block';
        log('Chybí record_id');
        return;
    }

    // 2. Kontrola uzávěrky
    if (isExpired(params.uzaverka)) {
        expiredCard.style.display = 'block';
        log('Uzávěrka vypršela:', params.uzaverka);
        return;
    }

    // 3. Zobrazit detail a formulář
    renderDetail();
    offerCard.style.display = 'block';

    log('Nabidka page initialized');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
