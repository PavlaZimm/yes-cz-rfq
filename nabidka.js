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
    produkty: urlParams.get('produkty'),
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
        return 'Cenová nabídka je povinná a musí být větší než 0.';
    }
    var num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
        return 'Cenová nabídka je povinná a musí být větší než 0.';
    }
    return null;
}

function isExpired(uzaverkaStr) {
    if (!uzaverkaStr) return false;
    try {
        // Uzávěrka je do 12:00 daného dne
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
    // Produkty mohou přijít jako:
    // 1. JSON string v parametru "produkty"
    // 2. Textový řetězec v "specifikace" (starý formát)
    var products = [];

    if (params.produkty) {
        try {
            var parsed = JSON.parse(decodeURIComponent(params.produkty));
            if (Array.isArray(parsed)) {
                products = parsed;
            }
        } catch (e) {
            // Zkusit jako text
            log('Products parse error, trying text:', e);
        }
    }

    // Fallback: specifikace jako text (řádky "Panel XY - 30 ks")
    if (products.length === 0 && params.specifikace) {
        var lines = decodeURIComponent(params.specifikace).split('\n');
        lines.forEach(function(line) {
            line = line.trim();
            if (!line) return;
            // Zkusit parsovat "specifikace - XX ks"
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

    // Produkty
    var produktyEl = document.getElementById('val-produkty');
    var products = parseProducts();
    if (products.length > 0) {
        products.forEach(function(p) {
            var li = document.createElement('li');
            var text = escapeHtml(p.specification || p.specifikace || '');
            var qty = p.quantity || p.pocet_kusu;
            if (qty) {
                text += ' — <strong>' + qty + ' kusů</strong>';
            }
            li.innerHTML = text;
            produktyEl.appendChild(li);
        });
    } else {
        var li = document.createElement('li');
        li.textContent = '—';
        produktyEl.appendChild(li);
    }

    // Termín dodání
    var terminEl = document.getElementById('val-termin');
    terminEl.textContent = params.termin ? formatCzechDate(params.termin) : '—';

    // Uzávěrka - s časem do 12:00
    var uzaverkaEl = document.getElementById('val-uzaverka');
    if (params.uzaverka) {
        uzaverkaEl.textContent = formatCzechDate(params.uzaverka) + ' do 12:00';
    } else {
        uzaverkaEl.textContent = '—';
    }
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
        declineBtn.disabled = true;
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        cenaInput.disabled = false;
        poznamkaInput.disabled = false;
        declineBtn.disabled = false;
    }
}

// ============================================
// ODESLÁNÍ NABÍDKY
// ============================================

async function submitOffer() {
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

        log('Nabídka odeslána úspěšně');
        offerCard.style.display = 'none';
        document.getElementById('successTitle').textContent = 'Děkujeme!';
        document.getElementById('successPerex').textContent = 'Nabídka odeslána! Děkujeme.';
        successCard.style.display = 'block';
        successCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
        log('Error:', err);

        var errorMsg = 'Chyba při odesílání. Zkuste znovu nebo kontaktujte support.';

        if (err.name === 'AbortError') {
            errorMsg = 'Požadavek trval příliš dlouho. Zkuste to znovu.';
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            errorMsg = 'Nepodařilo se odeslat nabídku. Zkontrolujte připojení.';
        }

        showError(errorMsg);
        setLoadingState(false);
    }
}

// ============================================
// ODMÍTNUTÍ ÚČASTI
// ============================================

async function declineOffer() {
    if (isExpired(params.uzaverka)) {
        offerCard.style.display = 'none';
        expiredCard.style.display = 'block';
        return;
    }

    var data = {
        record_id: params.record_id,
        declined: true,
        datum_odeslani: new Date().toISOString()
    };

    log('Odmítám účast:', data);
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

        log('Odmítnutí odesláno');
        offerCard.style.display = 'none';
        document.getElementById('successTitle').textContent = 'Děkujeme za informaci';
        document.getElementById('successPerex').textContent = 'Máte možnost se později připojit.';
        successCard.style.display = 'block';
        successCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
        log('Error:', err);
        showError('Chyba při odesílání. Zkuste znovu nebo kontaktujte support.');
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

declineBtn.addEventListener('click', function () {
    declineOffer();
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
