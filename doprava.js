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
const adresaVyzvednutiInput = document.getElementById('adresa_skladu');
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

function prefillForm() {
    // Dodavatel
    var dodavatelEl = document.getElementById('val-dodavatel');
    if (params.dodavatel) {
        dodavatelEl.textContent = decodeURIComponent(params.dodavatel);
    } else {
        document.getElementById('detail-dodavatel').style.display = 'none';
    }

    // Předvyplnění polí z URL parametrů
    if (params.adresa_skladu) {
        var decoded = decodeURIComponent(params.adresa_skladu);
        var match = Array.from(adresaVyzvednutiInput.options).find(function(o) { return o.value === decoded; });
        adresaVyzvednutiInput.value = match ? decoded : adresaVyzvednutiInput.options[0].value;
    }
    if (params.adresa_dodani) {
        adresaDodaniInput.value = decodeURIComponent(params.adresa_dodani);
    }
    if (params.zpusob_baleni) {
        zpusobBaleniInput.value = decodeURIComponent(params.zpusob_baleni);
    }
    if (params.pocet_palet) {
        pocetPaletInput.value = decodeURIComponent(params.pocet_palet);
    }
    if (params.rozmery_palety) {
        rozmerPaletyInput.value = decodeURIComponent(params.rozmery_palety);
    }
    if (params.vaha_kg) {
        vahaKgInput.value = decodeURIComponent(params.vaha_kg);
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
        showFieldError(adresaVyzvednutiError, 'Vyplňte adresu vyzvednutí.');
        valid = false;
    }

    if (!adresaDodaniInput.value.trim()) {
        showFieldError(adresaDodaniError, 'Vyplňte adresu dodání.');
        valid = false;
    }

    if (!zpusobBaleniInput.value.trim()) {
        showFieldError(zpusobBaleniError, 'Vyplňte způsob balení.');
        valid = false;
    }

    var pocet = parseInt(pocetPaletInput.value, 10);
    if (!pocetPaletInput.value || isNaN(pocet) || pocet < 1) {
        showFieldError(pocetPaletError, 'Zadejte počet palet (min. 1).');
        valid = false;
    }

    if (!rozmerPaletyInput.value.trim()) {
        showFieldError(rozmerPaletyError, 'Vyplňte rozměry palety.');
        valid = false;
    }

    var vaha = parseFloat(vahaKgInput.value);
    if (!vahaKgInput.value || isNaN(vaha) || vaha <= 0) {
        showFieldError(vahaKgError, 'Zadejte váhu (větší než 0).');
        valid = false;
    }

    if (!terminPrepravyInput.value) {
        showFieldError(terminPrepravyError, 'Zvolte požadovaný termín přepravy.');
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
        adresa_skladu: adresaVyzvednutiInput.value,
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
        successCard.style.display = 'block';
        successCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
        log('Error:', err);

        var errorMsg = 'Chyba při odesílání. Zkuste znovu nebo kontaktujte support.';

        if (err.name === 'AbortError') {
            errorMsg = 'Požadavek trval příliš dlouho. Zkuste to znovu.';
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            errorMsg = 'Nepodařilo se odeslat objednávku. Zkontrolujte připojení.';
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
// INICIALIZACE
// ============================================

function init() {
    log('Initializing doprava page...', params);

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
