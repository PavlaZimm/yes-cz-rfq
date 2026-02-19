// ============================================
// Yes.cz RFQ - Dodavatelský formulář nabídky
// ============================================

// ============================================
// KONFIGURACE
// ============================================
const NABIDKA_CONFIG = {
    WEBHOOK_URL: 'https://hook.eu1.make.com/PLACEHOLDER_NABIDKA',
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
const editOfferBtn = document.getElementById('editOfferBtn');

// Form inputs
const cenaInput = document.getElementById('cenova_nabidka');
const poznamkaInput = document.getElementById('nabidka_poznamka');

// Error elements
const cenaError = document.getElementById('cena-error');

// ============================================
// URL PARAMETRY
// ============================================
const urlParams = new URLSearchParams(window.location.search);
const params = {
    record_id: urlParams.get('record_id'),
    znacka: urlParams.get('znacka'),
    specifikace: urlParams.get('specifikace'),
    mnozstvi: urlParams.get('mnozstvi'),
    psc: urlParams.get('psc'),
    termin: urlParams.get('termin'),
    dodavatel: urlParams.get('dodavatel'),
    uzaverka: urlParams.get('uzaverka')
};

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
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return parts[2] + '. ' + parts[1] + '. ' + parts[0];
    } catch (e) {
        return dateStr;
    }
}

function formatPSC(psc) {
    if (!psc) return '';
    const digits = psc.replace(/\D/g, '');
    if (digits.length === 5) {
        return digits.substring(0, 3) + ' ' + digits.substring(3);
    }
    return psc;
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

function showFieldError(errorEl, input, message) {
    errorEl.textContent = message;
    errorEl.classList.add('active');
    input.setAttribute('aria-invalid', 'true');
    input.style.borderColor = 'var(--red-error)';
}

function clearFieldError(errorEl, input) {
    errorEl.textContent = '';
    errorEl.classList.remove('active');
    input.setAttribute('aria-invalid', 'false');
    input.style.borderColor = '';
}

// ============================================
// VALIDACE
// ============================================

function validateCena(value) {
    if (!value) {
        return 'Zadejte cenovou nabídku';
    }
    var num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
        return 'Cenová nabídka musí být kladné číslo';
    }
    return null;
}

function isExpired(uzaverkaStr) {
    if (!uzaverkaStr) return false;
    try {
        var uzaverka = new Date(uzaverkaStr + 'T23:59:59');
        var now = new Date();
        return now > uzaverka;
    } catch (e) {
        return false;
    }
}

// ============================================
// ZOBRAZENÍ DETAILU POPTÁVKY
// ============================================

function renderDetail() {
    // Značka
    var znackaEl = document.getElementById('val-znacka');
    znackaEl.textContent = params.znacka || '—';

    // Specifikace
    var specEl = document.getElementById('val-specifikace');
    specEl.textContent = params.specifikace || '—';

    // Množství
    var mnozstviEl = document.getElementById('val-mnozstvi');
    mnozstviEl.textContent = params.mnozstvi ? params.mnozstvi + ' ks' : '—';

    // PSČ
    var pscEl = document.getElementById('val-psc');
    pscEl.textContent = params.psc ? formatPSC(params.psc) : '—';

    // Termín
    var terminEl = document.getElementById('val-termin');
    terminEl.textContent = params.termin ? formatCzechDate(params.termin) : '—';

    // Dodavatel (pokud je v URL)
    if (params.dodavatel) {
        var dodavatelEl = document.getElementById('val-dodavatel');
        dodavatelEl.textContent = params.dodavatel;
        document.getElementById('detail-dodavatel').style.display = '';
    }

    // Uzávěrka
    var uzaverkaEl = document.getElementById('val-uzaverka');
    uzaverkaEl.textContent = params.uzaverka ? formatCzechDate(params.uzaverka) : '—';
}

// ============================================
// LOADING STAV
// ============================================

function setLoadingState(loading) {
    if (loading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        cenaInput.disabled = true;
        poznamkaInput.disabled = true;
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        cenaInput.disabled = false;
        poznamkaInput.disabled = false;
    }
}

// ============================================
// ODESLÁNÍ NABÍDKY
// ============================================

async function submitOffer() {
    // Validace
    clearFieldError(cenaError, cenaInput);

    var error = validateCena(cenaInput.value);
    if (error) {
        showFieldError(cenaError, cenaInput, error);
        cenaInput.focus();
        return;
    }

    // Kontrola uzávěrky před odesláním
    if (isExpired(params.uzaverka)) {
        offerCard.style.display = 'none';
        expiredCard.style.display = 'block';
        return;
    }

    // Kontrola webhook
    if (!NABIDKA_CONFIG.WEBHOOK_URL || NABIDKA_CONFIG.WEBHOOK_URL.includes('PLACEHOLDER')) {
        showError('Chyba konfigurace: Webhook URL pro nabídky není nastaven. Kontaktujte administrátora.');
        return;
    }

    var data = {
        record_id: params.record_id,
        cenova_nabidka: parseFloat(cenaInput.value),
        poznamka: poznamkaInput.value.trim() || '',
        datum_odeslani: new Date().toISOString()
    };

    log('Odesílám nabídku:', data);
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

        // Úspěch
        log('Nabídka odeslána úspěšně');
        offerCard.style.display = 'none';
        successCard.style.display = 'block';
        successCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
        log('Error:', err);

        var errorMsg = 'Nastala chyba při odesílání. Zkuste to prosím znovu.';

        if (err.name === 'AbortError') {
            errorMsg = 'Požadavek trval příliš dlouho. Zkuste to znovu.';
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            errorMsg = 'Nepodařilo se odeslat nabídku. Zkontrolujte připojení.';
        } else if (err.message.includes('Server error')) {
            errorMsg = 'Došlo k chybě na serveru. Kontaktujte nás na +420 608 887 277';
        }

        showError(errorMsg);
        setLoadingState(false);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

offerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    submitOffer();
});

editOfferBtn.addEventListener('click', function () {
    successCard.style.display = 'none';
    offerCard.style.display = 'block';
    offerCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    cenaInput.focus();
});

cenaInput.addEventListener('input', function () {
    clearFieldError(cenaError, cenaInput);
});

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
// INICIALIZACE
// ============================================

function init() {
    log('Initializing nabidka page...', params);

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
