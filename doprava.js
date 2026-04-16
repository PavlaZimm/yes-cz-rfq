// ============================================
// Yes.cz RFQ - Formulář objednávky dopravy
// ============================================

// ============================================
// KONFIGURACE
// ============================================
const DOPRAVA_CONFIG = {
    WEBHOOK_URL: 'https://hook.eu1.make.com/ljv8o1ub9355xan4p4gnm54mfjgdtvk7',
    TIMEOUT: 10000,
    DEBUG: false
};

// ============================================
// DOM ELEMENTS
// ============================================
const errorAlert = document.getElementById('errorAlert');
const errorMessage = document.getElementById('errorMessage');
const invalidLinkCard = document.getElementById('invalidLinkCard');
const transportCard = document.getElementById('transportCard');
const successCard = document.getElementById('successCard');
const transportForm = document.getElementById('transportForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');

// Form inputs
const adresaVyzvednutiInput = document.getElementById('adresa_vyzvednuti');
const adresaDodaniInput = document.getElementById('adresa_dodani');
const zpusobBaleniInput = document.getElementById('zpusob_baleni');
const pocetPaletInput = document.getElementById('pocet_palet');
const rozmerPaletyInput = document.getElementById('rozmery_palety');
const vahaKgInput = document.getElementById('vaha_kg');
const terminPrepravyInput = document.getElementById('termin_prepravy');
const poznamkaInput = document.getElementById('poznamka');

// Error elements
const adresaVyzvednutiError = document.getElementById('adresa-vyzvednuti-error');
const adresaDodaniError = document.getElementById('adresa-dodani-error');
const zpusobBaleniError = document.getElementById('zpusob-baleni-error');
const pocetPaletError = document.getElementById('pocet-palet-error');
const rozmerPaletyError = document.getElementById('rozmery-palety-error');
const vahaKgError = document.getElementById('vaha-kg-error');
const terminPrepravyError = document.getElementById('termin-prepravy-error');

// ============================================
// URL PARAMETRY
// ============================================
const urlParams = new URLSearchParams(window.location.search);
const params = {
    record_id: urlParams.get('record_id'),
    adresa_dodani: urlParams.get('adresa_dodani'),
    adresa_skladu: urlParams.get('adresa_skladu'),
    zpusob_baleni: urlParams.get('zpusob_baleni'),
    pocet_palet: urlParams.get('pocet_palet'),
    rozmery_palety: urlParams.get('rozmery_palety'),
    vaha_kg: urlParams.get('vaha_kg'),
    dodavatel: urlParams.get('dodavatel')
};

// ============================================
// JAZYKOVÁ DETEKCE
// ============================================
var langParam = new URLSearchParams(window.location.search).get('lang');
var isCzech = langParam
    ? (langParam === 'cs' || langParam === 'sk')
    : ((navigator.language || '').startsWith('cs') || (navigator.language || '').startsWith('sk'));

var CS_DOPRAVA = {
    invalidTitle: 'Neplatný odkaz',
    invalidText: 'Neplatný odkaz. Zkontrolujte email s pozvánkou.',
    sectionDetail: 'Detail zásilky',
    labelDodavatel: 'Dodavatel',
    sectionForm: 'Objednávka dopravy',
    labelPickup: 'Adresa vyzvednutí',
    pickupPlaceholder: 'Adresa skladu dodavatele',
    labelDelivery: 'Adresa dodání',
    deliveryPlaceholder: 'Adresa místa dodání',
    labelBaleni: 'Způsob balení',
    baleniPlaceholder: 'Např. na paletě, v kartonu...',
    labelPalet: 'Počet palet',
    labelRozmery: 'Rozměry zásilky (cm)',
    rozmeryPlaceholder: 'délka × šířka × výška (cm), např. 120 × 80 × 150',
    rozmeryHint: 'délka × šířka × výška, např. 120 × 80 × 150',
    labelVaha: 'Váha celkem (kg)',
    labelTermin: 'Požadovaný termín přepravy',
    labelNote: 'Poznámka',
    noteHint: 'Maximálně 1000 znaků',
    submitBtn: 'Odeslat objednávku dopravy',
    submitting: 'Odesílám...',
    successTitle: 'Děkujeme!',
    successText: 'Objednávka dopravy byla úspěšně odeslána.',
    optional: '(volitelně)',
    required: '*',
    errorTitle: 'Chyba',
    submitAriaLabel: 'Odeslat objednávku dopravy',
    // Validation
    errPickup: 'Vyplňte adresu vyzvednutí.',
    errDelivery: 'Vyplňte adresu dodání.',
    errBaleni: 'Vyplňte způsob balení.',
    errPalet: 'Zadejte počet palet (min. 1).',
    errRozmery: 'Vyplňte rozměry zásilky.',
    errVaha: 'Zadejte váhu (větší než 0).',
    errTermin: 'Zvolte požadovaný termín přepravy.',
    errGeneral: 'Chyba při odesílání. Zkuste znovu nebo kontaktujte support.',
    errTimeout: 'Požadavek trval příliš dlouho. Zkuste to znovu.',
    errNetwork: 'Nepodařilo se odeslat objednávku. Zkontrolujte připojení.'
};

var EN_DOPRAVA = {
    invalidTitle: 'Invalid link',
    invalidText: 'Invalid link. Please check the invitation email.',
    sectionDetail: 'Shipment details',
    labelDodavatel: 'Supplier',
    sectionForm: 'Transport order',
    labelPickup: 'Pickup address',
    pickupPlaceholder: 'Supplier warehouse address',
    labelDelivery: 'Delivery address',
    deliveryPlaceholder: 'Delivery location address',
    labelBaleni: 'Packaging method',
    baleniPlaceholder: 'E.g. on pallet, in carton...',
    labelPalet: 'Number of pallets',
    labelRozmery: 'Shipment dimensions (cm)',
    rozmeryPlaceholder: 'length × width × height (cm), e.g. 120 × 80 × 150',
    rozmeryHint: 'length × width × height, e.g. 120 × 80 × 150',
    labelVaha: 'Total weight (kg)',
    labelTermin: 'Required transport date',
    labelNote: 'Note',
    noteHint: 'Maximum 1000 characters',
    submitBtn: 'Submit transport order',
    submitting: 'Submitting...',
    successTitle: 'Thank you!',
    successText: 'Transport order was successfully submitted.',
    optional: '(optional)',
    required: '*',
    errorTitle: 'Error',
    submitAriaLabel: 'Submit transport order',
    // Validation
    errPickup: 'Fill in the pickup address.',
    errDelivery: 'Fill in the delivery address.',
    errBaleni: 'Fill in the packaging method.',
    errPalet: 'Enter the number of pallets (min. 1).',
    errRozmery: 'Fill in the shipment dimensions.',
    errVaha: 'Enter the weight (greater than 0).',
    errTermin: 'Select the required transport date.',
    errGeneral: 'Error submitting. Please try again or contact support.',
    errTimeout: 'Request took too long. Please try again.',
    errNetwork: 'Failed to submit the order. Check your connection.'
};

var td = isCzech ? CS_DOPRAVA : EN_DOPRAVA;

// ============================================
// UTILITY FUNKCE
// ============================================

function log(...args) {
    if (DOPRAVA_CONFIG.DEBUG) {
        console.log('[Doprava]', ...args);
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorAlert.style.display = 'flex';
}

function showFieldError(errorEl, message) {
    errorEl.textContent = message;
    errorEl.classList.add('active');
}

function clearFieldError(errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('active');
}

// ============================================
// PŘEDVYPLNĚNÍ FORMULÁŘE
// ============================================

function setReadonly(input, value) {
    input.value = value;
    input.readOnly = true;
    input.classList.add('input-readonly');
    // For number inputs, readOnly is not fully supported — prevent changes
    if (input.type === 'number') {
        input.addEventListener('keydown', function(e) { e.preventDefault(); });
        input.addEventListener('wheel', function(e) { e.preventDefault(); });
    }
}

function prefillForm() {
    // Dodavatel
    var dodavatelEl = document.getElementById('val-dodavatel');
    if (params.dodavatel) {
        dodavatelEl.textContent = decodeURIComponent(params.dodavatel);
    } else {
        document.getElementById('detail-dodavatel').style.display = 'none';
    }

    // Předvyplnění polí z URL parametrů — prefilled = readonly
    if (params.adresa_skladu) {
        setReadonly(adresaVyzvednutiInput, decodeURIComponent(params.adresa_skladu));
    }
    if (params.adresa_dodani) {
        setReadonly(adresaDodaniInput, decodeURIComponent(params.adresa_dodani));
    }
    if (params.zpusob_baleni) {
        setReadonly(zpusobBaleniInput, decodeURIComponent(params.zpusob_baleni));
    }
    if (params.pocet_palet) {
        setReadonly(pocetPaletInput, decodeURIComponent(params.pocet_palet));
    }
    if (params.rozmery_palety) {
        setReadonly(rozmerPaletyInput, decodeURIComponent(params.rozmery_palety));
    }
    if (params.vaha_kg) {
        setReadonly(vahaKgInput, decodeURIComponent(params.vaha_kg));
    }

    // Nastavit minimální datum přepravy na dnes
    var today = new Date().toISOString().split('T')[0];
    terminPrepravyInput.setAttribute('min', today);
}

// ============================================
// VALIDACE
// ============================================

function validateForm() {
    var valid = true;

    clearFieldError(adresaVyzvednutiError);
    clearFieldError(adresaDodaniError);
    clearFieldError(zpusobBaleniError);
    clearFieldError(pocetPaletError);
    clearFieldError(rozmerPaletyError);
    clearFieldError(vahaKgError);
    clearFieldError(terminPrepravyError);

    if (!adresaVyzvednutiInput.value.trim()) {
        showFieldError(adresaVyzvednutiError, td.errPickup);
        valid = false;
    }

    if (!adresaDodaniInput.value.trim()) {
        showFieldError(adresaDodaniError, td.errDelivery);
        valid = false;
    }

    if (!zpusobBaleniInput.value.trim()) {
        showFieldError(zpusobBaleniError, td.errBaleni);
        valid = false;
    }

    var pocet = parseInt(pocetPaletInput.value, 10);
    if (!pocetPaletInput.value || isNaN(pocet) || pocet < 1) {
        showFieldError(pocetPaletError, td.errPalet);
        valid = false;
    }

    if (!rozmerPaletyInput.value.trim()) {
        showFieldError(rozmerPaletyError, td.errRozmery);
        valid = false;
    }

    var vaha = parseFloat(vahaKgInput.value);
    if (!vahaKgInput.value || isNaN(vaha) || vaha <= 0) {
        showFieldError(vahaKgError, td.errVaha);
        valid = false;
    }

    if (!terminPrepravyInput.value) {
        showFieldError(terminPrepravyError, td.errTermin);
        valid = false;
    }

    return valid;
}

// ============================================
// LOADING STAV
// ============================================

function setLoadingState(loading) {
    if (loading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        adresaVyzvednutiInput.disabled = true;
        adresaDodaniInput.disabled = true;
        zpusobBaleniInput.disabled = true;
        pocetPaletInput.disabled = true;
        rozmerPaletyInput.disabled = true;
        vahaKgInput.disabled = true;
        terminPrepravyInput.disabled = true;
        poznamkaInput.disabled = true;
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        adresaVyzvednutiInput.disabled = false;
        adresaDodaniInput.disabled = false;
        zpusobBaleniInput.disabled = false;
        pocetPaletInput.disabled = false;
        rozmerPaletyInput.disabled = false;
        vahaKgInput.disabled = false;
        terminPrepravyInput.disabled = false;
        poznamkaInput.disabled = false;
    }
}

// ============================================
// ODESLÁNÍ FORMULÁŘE
// ============================================

async function submitTransport() {
    if (!validateForm()) {
        return;
    }

    var data = {
        record_id: params.record_id,
        adresa_vyzvednuti: adresaVyzvednutiInput.value.trim(),
        adresa_dodani: adresaDodaniInput.value.trim(),
        zpusob_baleni: zpusobBaleniInput.value.trim(),
        pocet_palet: parseInt(pocetPaletInput.value, 10),
        rozmery_palety: rozmerPaletyInput.value.trim(),
        vaha_kg: parseFloat(vahaKgInput.value),
        termin_prepravy: terminPrepravyInput.value,
        poznamka: poznamkaInput.value.trim() || '',
        datum_odeslani: new Date().toISOString()
    };

    log('Odesílám objednávku dopravy:', data);
    setLoadingState(true);

    try {
        var controller = new AbortController();
        var timeoutId = setTimeout(function () { controller.abort(); }, DOPRAVA_CONFIG.TIMEOUT);

        var response = await fetch(DOPRAVA_CONFIG.WEBHOOK_URL, {
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

        log('Objednávka dopravy odeslána úspěšně');
        transportCard.style.display = 'none';
        document.querySelector('#successCard .success-title').textContent = td.successTitle;
        document.querySelector('#successCard .success-perex').textContent = td.successText;
        successCard.style.display = 'block';
        successCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
        log('Error:', err);

        var errorMsg = td.errGeneral;

        if (err.name === 'AbortError') {
            errorMsg = td.errTimeout;
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            errorMsg = td.errNetwork;
        }

        showError(errorMsg);
        setLoadingState(false);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

transportForm.addEventListener('submit', function (e) {
    e.preventDefault();
    submitTransport();
});

// Clear errors on input
adresaVyzvednutiInput.addEventListener('input', function() { clearFieldError(adresaVyzvednutiError); });
adresaDodaniInput.addEventListener('input', function() { clearFieldError(adresaDodaniError); });
zpusobBaleniInput.addEventListener('input', function() { clearFieldError(zpusobBaleniError); });
pocetPaletInput.addEventListener('input', function() { clearFieldError(pocetPaletError); });
rozmerPaletyInput.addEventListener('input', function() { clearFieldError(rozmerPaletyError); });
vahaKgInput.addEventListener('input', function() { clearFieldError(vahaKgError); });
terminPrepravyInput.addEventListener('input', function() { clearFieldError(terminPrepravyError); });

// Počítadlo znaků poznámky
poznamkaInput.addEventListener('input', function () {
    var counter = document.getElementById('poznamka-counter');
    if (counter) {
        var length = poznamkaInput.value.length;
        counter.textContent = length + '/1000';
        counter.style.color = length > 1000 ? 'var(--red-error)' : 'var(--text-secondary)';
    }
});

// ============================================
// PŘEKLAD UI
// ============================================

function applyDopravaTranslations() {
    if (isCzech) return;

    document.documentElement.lang = 'en';
    document.title = td.submitBtn + ' - Yes.cz';

    // Invalid link card
    var invalidTitle = invalidLinkCard.querySelector('.form-title');
    if (invalidTitle) invalidTitle.textContent = td.invalidTitle;
    var invalidText = invalidLinkCard.querySelector('.form-subtitle');
    if (invalidText) invalidText.textContent = td.invalidText;

    // Section legends
    var legends = document.querySelectorAll('.form-section-title');
    if (legends[0]) legends[0].textContent = td.sectionDetail;
    if (legends[1]) legends[1].textContent = td.sectionForm;

    // Detail labels
    var dodavLabel = document.querySelector('#detail-dodavatel .detail-label');
    if (dodavLabel) dodavLabel.textContent = td.labelDodavatel;

    // Form fields
    var pickupLabel = document.querySelector('label[for="adresa_vyzvednuti"]');
    if (pickupLabel) pickupLabel.innerHTML = td.labelPickup + ' <span class="required">' + td.required + '</span>';
    adresaVyzvednutiInput.placeholder = td.pickupPlaceholder;

    var deliveryLabel = document.querySelector('label[for="adresa_dodani"]');
    if (deliveryLabel) deliveryLabel.innerHTML = td.labelDelivery + ' <span class="required">' + td.required + '</span>';
    adresaDodaniInput.placeholder = td.deliveryPlaceholder;

    var baleniLabel = document.querySelector('label[for="zpusob_baleni"]');
    if (baleniLabel) baleniLabel.innerHTML = td.labelBaleni + ' <span class="required">' + td.required + '</span>';
    zpusobBaleniInput.placeholder = td.baleniPlaceholder;

    var paletLabel = document.querySelector('label[for="pocet_palet"]');
    if (paletLabel) paletLabel.innerHTML = td.labelPalet + ' <span class="required">' + td.required + '</span>';

    var rozmeryLabel = document.querySelector('label[for="rozmery_palety"]');
    if (rozmeryLabel) rozmeryLabel.innerHTML = td.labelRozmery + ' <span class="required">' + td.required + '</span>';
    rozmerPaletyInput.placeholder = td.rozmeryPlaceholder;
    var rozmeryHint = document.getElementById('rozmery-palety-hint');
    if (rozmeryHint) rozmeryHint.textContent = td.rozmeryHint;

    var vahaLabel = document.querySelector('label[for="vaha_kg"]');
    if (vahaLabel) vahaLabel.innerHTML = td.labelVaha + ' <span class="required">' + td.required + '</span>';

    var terminLabel = document.querySelector('label[for="termin_prepravy"]');
    if (terminLabel) terminLabel.innerHTML = td.labelTermin + ' <span class="required">' + td.required + '</span>';

    // Note
    var noteLabel = document.querySelector('label[for="poznamka"]');
    if (noteLabel) noteLabel.innerHTML = td.labelNote + ' <span class="optional">' + td.optional + '</span>';
    var noteHint = document.getElementById('poznamka-hint');
    if (noteHint) noteHint.textContent = td.noteHint;

    // Error alert
    var errorStrong = errorAlert.querySelector('strong');
    if (errorStrong) errorStrong.textContent = td.errorTitle;

    // Success card (initial title text)
    var successTitleEl = document.querySelector('#successCard .success-title');
    if (successTitleEl) successTitleEl.textContent = td.successTitle;
    var successPerexEl = document.querySelector('#successCard .success-perex');
    if (successPerexEl) successPerexEl.textContent = td.successText;

    // Submit button
    var btnTextEl = submitBtn.querySelector('.btn-text');
    if (btnTextEl) btnTextEl.textContent = td.submitBtn;
    submitBtn.setAttribute('aria-label', td.submitAriaLabel);
    var loaderSpan = submitBtn.querySelector('.btn-loader');
    if (loaderSpan) loaderSpan.innerHTML = '<span class="spinner"></span> ' + td.submitting;
}

// ============================================
// INICIALIZACE
// ============================================

function init() {
    log('Initializing doprava page...', params);

    applyDopravaTranslations();

    // 1. Kontrola record_id
    if (!params.record_id) {
        invalidLinkCard.style.display = 'block';
        log('Chybí record_id');
        return;
    }

    // 2. Předvyplnit formulář a zobrazit
    prefillForm();
    transportCard.style.display = 'block';

    log('Doprava page initialized');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
