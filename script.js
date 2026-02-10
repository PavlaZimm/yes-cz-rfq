// ============================================
// Yes.cz RFQ Systém - JavaScript
// ============================================

// ============================================
// KONFIGURACE
// ============================================
const CONFIG = {
    WEBHOOK_URL: 'https://hook.eu1.make.com/nyw1kstb4dh3bhaysu1vrsk7x9v87ddr',
    // URL pro načtení značek z Airtable (Make.com webhook nebo vlastní API)
    // Pokud je prázdný, použijí se fallback značky
    BRANDS_API_URL: '',
    TIMEOUT: 10000,
    MIN_DATE_OFFSET: 1,
    MAX_DATE_OFFSET: 90,
    SUCCESS_URL: 'success.html',
    DEBUG: false,
    // Fallback značky - použijí se, pokud není nastaveno BRANDS_API_URL
    // nebo pokud načtení z API selže
    FALLBACK_BRANDS: [
        'Aiko',
        'Canadian Solar',
        'Canadian Solar Měniče',
        'DAH Solar',
        'FoxESS',
        'Fronius',
        'Goodwe',
        'Hanersun',
        'Huasan',
        'Leapton',
        'Risen',
        'Solax',
        'Victron'
    ]
};

// ============================================
// STAV APLIKACE
// ============================================
let brands = [];
let highlightedIndex = -1;
let selectedBrand = '';
let submissionCount = 0;

// ============================================
// DOM ELEMENTS
// ============================================
const form = document.getElementById('rfqForm');
const formCard = document.getElementById('formCard');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const errorAlert = document.getElementById('errorAlert');
const errorMessage = document.getElementById('errorMessage');
const successAlert = document.getElementById('successAlert');
const submitAnotherBtn = document.getElementById('submitAnotherBtn');

// Form inputs
const inputs = {
    znackaInput: document.getElementById('znacka-input'),
    znacka: document.getElementById('znacka'),
    specifikace: document.getElementById('specifikace'),
    mnozstvi: document.getElementById('mnozstvi'),
    psc: document.getElementById('psc_dodani'),
    termin: document.getElementById('pozadovany_termin'),
    jmeno: document.getElementById('zakaznik_jmeno'),
    email: document.getElementById('zakaznik_email'),
    telefon: document.getElementById('zakaznik_telefon'),
    poznamka: document.getElementById('poznamka')
};

// Dropdown elements
const znackaDropdown = document.getElementById('znackaDropdown');
const znackaList = document.getElementById('znacka-list');
const znackaLoading = document.getElementById('znacka-loading');

// Error elements
const errorElements = {
    znacka: document.getElementById('znacka-error'),
    specifikace: document.getElementById('specifikace-error'),
    mnozstvi: document.getElementById('mnozstvi-error'),
    psc: document.getElementById('psc-error'),
    termin: document.getElementById('termin-error'),
    jmeno: document.getElementById('jmeno-error'),
    email: document.getElementById('email-error'),
    telefon: document.getElementById('telefon-error')
};

// ============================================
// UTILITY FUNKCE
// ============================================

function log(...args) {
    if (CONFIG.DEBUG) {
        console.log('[RFQ]', ...args);
    }
}

window.closeErrorAlert = function () {
    errorAlert.style.display = 'none';
};

function showErrorAlert(message) {
    errorMessage.textContent = message;
    errorAlert.style.display = 'flex';
    errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => { closeErrorAlert(); }, 10000);
}

function showFieldError(fieldName, message) {
    const errorEl = errorElements[fieldName];
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('active');
    }

    // Determine input element
    let input;
    if (fieldName === 'znacka') {
        input = inputs.znackaInput;
    } else {
        input = inputs[fieldName];
    }

    if (input) {
        input.setAttribute('aria-invalid', 'true');
        input.style.borderColor = 'var(--red-error)';
    }
}

function clearFieldError(fieldName) {
    const errorEl = errorElements[fieldName];
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('active');
    }

    let input;
    if (fieldName === 'znacka') {
        input = inputs.znackaInput;
    } else {
        input = inputs[fieldName];
    }

    if (input) {
        input.setAttribute('aria-invalid', 'false');
        input.style.borderColor = '';
    }
}

function clearAllErrors() {
    Object.keys(errorElements).forEach(key => {
        clearFieldError(key);
    });
    closeErrorAlert();
}

// ============================================
// NAČTENÍ ZNAČEK Z AIRTABLE / API
// ============================================

async function loadBrands() {
    // Pokud není API URL, použij fallback
    if (!CONFIG.BRANDS_API_URL) {
        brands = CONFIG.FALLBACK_BRANDS.slice().sort();
        log('Použity fallback značky:', brands.length);
        return;
    }

    znackaLoading.style.display = 'flex';

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

        const response = await fetch(CONFIG.BRANDS_API_URL, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error('API error: ' + response.status);
        }

        const data = await response.json();

        // Podporuje formáty:
        // 1. Pole stringů: ["Brand A", "Brand B"]
        // 2. Pole objektů: [{ name: "Brand A" }, { name: "Brand B" }]
        // 3. Objekt s polem: { brands: ["Brand A", ...] } nebo { records: [...] }
        if (Array.isArray(data)) {
            brands = data.map(item =>
                typeof item === 'string' ? item : (item.name || item.Name || item.znacka || '')
            ).filter(Boolean).sort();
        } else if (data.brands && Array.isArray(data.brands)) {
            brands = data.brands.filter(Boolean).sort();
        } else if (data.records && Array.isArray(data.records)) {
            brands = data.records.map(r =>
                r.fields ? (r.fields.name || r.fields.Name || r.fields.znacka || '') : ''
            ).filter(Boolean).sort();
        } else {
            throw new Error('Neočekávaný formát dat');
        }

        log('Načteno značek z API:', brands.length);
    } catch (error) {
        log('Chyba při načítání značek:', error);
        brands = CONFIG.FALLBACK_BRANDS.slice().sort();
        log('Použity fallback značky po chybě');
    } finally {
        znackaLoading.style.display = 'none';
    }
}

// ============================================
// SEARCHABLE DROPDOWN
// ============================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const queryEscaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('(' + queryEscaped + ')', 'gi');
    return escaped.replace(regex, '<mark>$1</mark>');
}

function renderDropdownList(filter) {
    const query = (filter || '').trim().toLowerCase();
    let filtered;

    if (query) {
        filtered = brands.filter(b => b.toLowerCase().includes(query));
    } else {
        filtered = brands.slice();
    }

    znackaList.innerHTML = '';
    highlightedIndex = -1;

    if (filtered.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'dropdown-empty';
        empty.textContent = query ? 'Značka nenalezena' : 'Žádné značky k dispozici';
        znackaList.appendChild(empty);
        return;
    }

    filtered.forEach((brand, index) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.setAttribute('data-value', brand);
        li.innerHTML = highlightMatch(brand, filter);
        if (brand === selectedBrand) {
            li.classList.add('selected');
        }
        li.addEventListener('mousedown', (e) => {
            e.preventDefault();
            selectBrand(brand);
        });
        znackaList.appendChild(li);
    });
}

function openDropdown() {
    znackaDropdown.classList.add('open');
    inputs.znackaInput.setAttribute('aria-expanded', 'true');
    renderDropdownList(inputs.znackaInput.value);
}

function closeDropdown() {
    znackaDropdown.classList.remove('open');
    inputs.znackaInput.setAttribute('aria-expanded', 'false');
    highlightedIndex = -1;
}

function selectBrand(brand) {
    selectedBrand = brand;
    inputs.znackaInput.value = brand;
    inputs.znacka.value = brand;
    clearFieldError('znacka');
    closeDropdown();
    // Focus next field
    inputs.specifikace.focus();
}

function navigateDropdown(direction) {
    const items = znackaList.querySelectorAll('li[role="option"]');
    if (items.length === 0) return;

    // Remove old highlight
    if (highlightedIndex >= 0 && items[highlightedIndex]) {
        items[highlightedIndex].classList.remove('highlighted');
    }

    highlightedIndex += direction;
    if (highlightedIndex < 0) highlightedIndex = items.length - 1;
    if (highlightedIndex >= items.length) highlightedIndex = 0;

    items[highlightedIndex].classList.add('highlighted');
    items[highlightedIndex].scrollIntoView({ block: 'nearest' });
}

// Dropdown event listeners
inputs.znackaInput.addEventListener('focus', () => {
    openDropdown();
});

inputs.znackaInput.addEventListener('input', () => {
    selectedBrand = '';
    inputs.znacka.value = '';
    openDropdown();
    renderDropdownList(inputs.znackaInput.value);
    clearFieldError('znacka');
});

inputs.znackaInput.addEventListener('blur', () => {
    // Delay to allow mousedown on list items
    setTimeout(() => {
        // If user typed something but didn't select from list, try to match
        const typed = inputs.znackaInput.value.trim();
        if (typed && !selectedBrand) {
            const match = brands.find(b => b.toLowerCase() === typed.toLowerCase());
            if (match) {
                selectBrand(match);
            }
        }
        closeDropdown();

        // Validate
        const error = validateZnacka();
        if (error) {
            showFieldError('znacka', error);
        } else {
            clearFieldError('znacka');
        }
    }, 200);
});

inputs.znackaInput.addEventListener('keydown', (e) => {
    const isOpen = znackaDropdown.classList.contains('open');

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen) openDropdown();
        navigateDropdown(1);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen) openDropdown();
        navigateDropdown(-1);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
            const items = znackaList.querySelectorAll('li[role="option"]');
            if (items[highlightedIndex]) {
                selectBrand(items[highlightedIndex].getAttribute('data-value'));
            }
        }
    } else if (e.key === 'Escape') {
        closeDropdown();
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!znackaDropdown.contains(e.target)) {
        closeDropdown();
    }
});

// ============================================
// VALIDAČNÍ FUNKCE
// ============================================

function validateZnacka() {
    const value = inputs.znacka.value || inputs.znackaInput.value.trim();
    if (!value) {
        return 'Vyberte značku ze seznamu';
    }
    // Check if it's a valid brand from the list
    const isValid = brands.some(b => b.toLowerCase() === value.toLowerCase());
    if (!isValid) {
        return 'Vyberte platnou značku ze seznamu';
    }
    return null;
}

function validateSpecifikace(value) {
    if (!value || value.trim().length < 5) {
        return 'Specifikace musí obsahovat alespoň 5 znaků';
    }
    if (value.length > 2000) {
        return 'Specifikace může obsahovat maximálně 2000 znaků';
    }
    return null;
}

function validateJmeno(value) {
    if (!value || value.trim().length < 2) {
        return 'Jméno musí obsahovat alespoň 2 znaky';
    }
    if (value.length > 100) {
        return 'Jméno může obsahovat maximálně 100 znaků';
    }
    if (!/^[A-Za-zÁáČčĎďÉéĚěÍíŇňÓóŘřŠšŤťÚúŮůÝýŽž\s]+$/.test(value)) {
        return 'Jméno může obsahovat pouze písmena a mezery';
    }
    return null;
}

function validateEmail(value) {
    if (!value) {
        return 'Toto pole je povinné';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        return 'Zadejte platnou emailovou adresu';
    }
    return null;
}

function validateTelefon(value) {
    if (!value) {
        return 'Toto pole je povinné';
    }
    const digits = value.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 13) {
        return 'Zadejte platné telefonní číslo ve formátu +420 123 456 789';
    }
    if (!digits.startsWith('420') && digits.length === 9) {
        return 'Telefonní číslo musí začínat +420';
    }
    return null;
}

function validateMnozstvi(value) {
    const num = parseInt(value, 10);
    if (!value || isNaN(num) || num < 1) {
        return 'Množství musí být celé číslo větší než 0';
    }
    if (num !== parseFloat(value)) {
        return 'Množství musí být celé číslo';
    }
    return null;
}

function validatePSC(value) {
    if (!value) {
        return 'Toto pole je povinné';
    }
    const digits = value.replace(/\s/g, '');
    if (!/^\d{5}$/.test(digits)) {
        return 'PSČ musí obsahovat přesně 5 číslic';
    }
    return null;
}

function validateTermin(value) {
    if (!value) {
        return 'Toto pole je povinné';
    }
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDate = new Date(today);
    minDate.setDate(today.getDate() + CONFIG.MIN_DATE_OFFSET);

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + CONFIG.MAX_DATE_OFFSET);

    if (selectedDate < minDate) {
        return 'Vyberte datum nejdříve od zítřka';
    }
    if (selectedDate > maxDate) {
        return 'Datum může být maximálně ' + CONFIG.MAX_DATE_OFFSET + ' dní od dneška';
    }
    return null;
}

function validatePoznamka(value) {
    if (value && value.length > 500) {
        return 'Poznámka může obsahovat max 500 znaků';
    }
    return null;
}

function validateForm() {
    clearAllErrors();

    const values = {
        znacka: null,
        specifikace: inputs.specifikace.value.trim(),
        jmeno: inputs.jmeno.value.trim(),
        email: inputs.email.value.trim(),
        telefon: inputs.telefon.value,
        mnozstvi: inputs.mnozstvi.value,
        psc: inputs.psc.value,
        termin: inputs.termin.value,
        poznamka: inputs.poznamka.value.trim()
    };

    const errors = {
        znacka: validateZnacka(),
        specifikace: validateSpecifikace(values.specifikace),
        mnozstvi: validateMnozstvi(values.mnozstvi),
        psc: validatePSC(values.psc),
        termin: validateTermin(values.termin),
        jmeno: validateJmeno(values.jmeno),
        email: validateEmail(values.email),
        telefon: validateTelefon(values.telefon),
        poznamka: validatePoznamka(values.poznamka)
    };

    let hasErrors = false;
    let firstErrorField = null;

    Object.keys(errors).forEach(key => {
        if (errors[key]) {
            showFieldError(key, errors[key]);
            hasErrors = true;
            if (!firstErrorField) {
                if (key === 'znacka') {
                    firstErrorField = inputs.znackaInput;
                } else {
                    firstErrorField = inputs[key];
                }
            }
        }
    });

    if (hasErrors && firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
    }

    return !hasErrors;
}

// ============================================
// FORMÁTOVÁNÍ FUNKCE
// ============================================

function formatTelefon(value) {
    let digits = value.replace(/\D/g, '');

    if (digits.startsWith('420')) {
        digits = digits.substring(3);
    }

    digits = digits.substring(0, 9);

    if (digits.length === 0) {
        return '';
    }

    let formatted = '+420';
    if (digits.length > 0) {
        formatted += ' ' + digits.substring(0, 3);
    }
    if (digits.length > 3) {
        formatted += ' ' + digits.substring(3, 6);
    }
    if (digits.length > 6) {
        formatted += ' ' + digits.substring(6, 9);
    }

    return formatted;
}

function formatPSC(value) {
    let digits = value.replace(/\D/g, '');
    digits = digits.substring(0, 5);

    if (digits.length <= 3) {
        return digits;
    }
    return digits.substring(0, 3) + ' ' + digits.substring(3, 5);
}

function preprocessData() {
    return {
        timestamp: new Date().toISOString(),
        znacka: inputs.znacka.value || inputs.znackaInput.value.trim(),
        specifikace: inputs.specifikace.value.trim(),
        zakaznik_jmeno: inputs.jmeno.value.trim(),
        zakaznik_email: inputs.email.value.trim(),
        zakaznik_telefon: inputs.telefon.value.replace(/\D/g, ''),
        mnozstvi: parseInt(inputs.mnozstvi.value, 10),
        psc_dodani: inputs.psc.value.replace(/\s/g, ''),
        pozadovany_termin: inputs.termin.value,
        poznamka: inputs.poznamka.value.trim() || '',
        formular_url: window.location.href,
        user_agent: navigator.userAgent
    };
}

// ============================================
// NASTAVENÍ DATE PICKERU
// ============================================

function setupDatePicker() {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + CONFIG.MIN_DATE_OFFSET);

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + CONFIG.MAX_DATE_OFFSET);

    inputs.termin.setAttribute('min', minDate.toISOString().split('T')[0]);
    inputs.termin.setAttribute('max', maxDate.toISOString().split('T')[0]);
}

// ============================================
// POČÍTADLA ZNAKŮ
// ============================================

function updateSpecifikaceCounter() {
    const counter = document.getElementById('specifikace-counter');
    if (counter) {
        const length = inputs.specifikace.value.length;
        counter.textContent = length + '/2000';
        counter.style.color = length > 2000 ? 'var(--red-error)' : 'var(--text-secondary)';
    }
}

function updatePoznamkaCounter() {
    const counter = document.getElementById('poznamka-counter');
    if (counter) {
        const length = inputs.poznamka.value.length;
        counter.textContent = length + '/500';
        counter.style.color = length > 500 ? 'var(--red-error)' : 'var(--text-secondary)';
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

        Object.values(inputs).forEach(input => {
            if (input && input.type !== 'hidden') input.disabled = true;
        });
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';

        Object.values(inputs).forEach(input => {
            if (input && input.type !== 'hidden') input.disabled = false;
        });
    }
}

// ============================================
// KONTAKTNÍ ÚDAJE - ULOŽENÍ/OBNOVENÍ
// ============================================

function saveContactInfo() {
    try {
        const contact = {
            jmeno: inputs.jmeno.value.trim(),
            email: inputs.email.value.trim(),
            telefon: inputs.telefon.value,
            psc: inputs.psc.value
        };
        sessionStorage.setItem('rfq_contact', JSON.stringify(contact));
    } catch (e) {
        // sessionStorage not available
    }
}

function restoreContactInfo() {
    try {
        const saved = sessionStorage.getItem('rfq_contact');
        if (saved) {
            const contact = JSON.parse(saved);
            if (contact.jmeno) inputs.jmeno.value = contact.jmeno;
            if (contact.email) inputs.email.value = contact.email;
            if (contact.telefon) inputs.telefon.value = contact.telefon;
            if (contact.psc) inputs.psc.value = contact.psc;
        }
    } catch (e) {
        // sessionStorage not available
    }
}

// ============================================
// ODESLÁNÍ FORMULÁŘE
// ============================================

async function submitForm() {
    if (!validateForm()) {
        return;
    }

    if (!CONFIG.WEBHOOK_URL || CONFIG.WEBHOOK_URL.includes('XXXXX')) {
        showErrorAlert('Chyba konfigurace: Make.com webhook URL není nastaven. Kontaktujte administrátora.');
        return;
    }

    const data = preprocessData();
    log('Odesílám data:', data);

    setLoadingState(true);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

        const response = await fetch(CONFIG.WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error('Server error: ' + response.status + ' ' + errorText);
        }

        // Uložit kontaktní údaje pro opakované odeslání
        saveContactInfo();
        submissionCount++;

        // Zobrazit inline úspěch
        showInlineSuccess(data.znacka);

    } catch (error) {
        log('Error:', error);

        let errorMsg = 'Nastala chyba při odesílání. Zkuste to prosím znovu.';

        if (error.name === 'AbortError') {
            errorMsg = 'Požadavek trval příliš dlouho. Zkuste to znovu.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMsg = 'Nepodařilo se odeslat formulář. Zkontrolujte připojení.';
        } else if (error.message.includes('Server error')) {
            errorMsg = 'Došlo k chybě na serveru. Kontaktujte nás na +420 608 887 277';
        }

        showErrorAlert(errorMsg);
        setLoadingState(false);
    }
}

// ============================================
// INLINE ÚSPĚCH + POPTAT DALŠÍ ZNAČKU
// ============================================

function showInlineSuccess(brandName) {
    // Skrýt formulář
    formCard.style.display = 'none';

    // Zobrazit success alert s názvem značky
    const successMsg = document.getElementById('successMessage');
    if (submissionCount > 1) {
        successMsg.textContent = 'Poptávka pro značku "' + brandName + '" byla odeslána (' + submissionCount + '. poptávka v této relaci).';
    } else {
        successMsg.textContent = 'Poptávka pro značku "' + brandName + '" byla úspěšně odeslána. Ozveme se vám s nabídkou.';
    }

    successAlert.style.display = 'flex';
    successAlert.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setLoadingState(false);
}

function resetForNewBrand() {
    // Skrýt success alert
    successAlert.style.display = 'none';

    // Zobrazit formulář
    formCard.style.display = 'block';

    // Resetovat produktová pole
    selectedBrand = '';
    inputs.znackaInput.value = '';
    inputs.znacka.value = '';
    inputs.specifikace.value = '';
    inputs.mnozstvi.value = '';
    inputs.termin.value = '';
    inputs.poznamka.value = '';

    // Obnovit kontaktní údaje
    restoreContactInfo();

    // Aktualizovat počítadla
    updateSpecifikaceCounter();
    updatePoznamkaCounter();

    // Vyčistit chyby
    clearAllErrors();

    // Aktualizovat date picker
    setupDatePicker();

    // Focus na značku
    inputs.znackaInput.focus();
    formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// EVENT LISTENERS
// ============================================

// Form submit
form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitForm();
});

// Poptat další značku
submitAnotherBtn.addEventListener('click', () => {
    resetForNewBrand();
});

// Real-time validace při blur
inputs.specifikace.addEventListener('blur', () => {
    const error = validateSpecifikace(inputs.specifikace.value.trim());
    if (error) showFieldError('specifikace', error);
    else clearFieldError('specifikace');
});

inputs.jmeno.addEventListener('blur', () => {
    const error = validateJmeno(inputs.jmeno.value.trim());
    if (error) showFieldError('jmeno', error);
    else clearFieldError('jmeno');
});

inputs.email.addEventListener('blur', () => {
    const error = validateEmail(inputs.email.value.trim());
    if (error) showFieldError('email', error);
    else clearFieldError('email');
});

inputs.telefon.addEventListener('blur', () => {
    const error = validateTelefon(inputs.telefon.value);
    if (error) showFieldError('telefon', error);
    else clearFieldError('telefon');
});

inputs.mnozstvi.addEventListener('blur', () => {
    const error = validateMnozstvi(inputs.mnozstvi.value);
    if (error) showFieldError('mnozstvi', error);
    else clearFieldError('mnozstvi');
});

inputs.psc.addEventListener('blur', () => {
    const error = validatePSC(inputs.psc.value);
    if (error) showFieldError('psc', error);
    else clearFieldError('psc');
});

inputs.termin.addEventListener('blur', () => {
    const error = validateTermin(inputs.termin.value);
    if (error) showFieldError('termin', error);
    else clearFieldError('termin');
});

inputs.poznamka.addEventListener('blur', () => {
    const error = validatePoznamka(inputs.poznamka.value);
    if (error) showErrorAlert(error);
});

// Auto-formátování během psaní
inputs.telefon.addEventListener('input', (e) => {
    e.target.value = formatTelefon(e.target.value);
    clearFieldError('telefon');
});

inputs.psc.addEventListener('input', (e) => {
    e.target.value = formatPSC(e.target.value);
    clearFieldError('psc');
});

// Počítadla znaků
inputs.specifikace.addEventListener('input', () => {
    updateSpecifikaceCounter();
    clearFieldError('specifikace');
});

inputs.poznamka.addEventListener('input', () => {
    updatePoznamkaCounter();
});

// Clear error při psaní (pro pole bez speciálního handleru)
['jmeno', 'email', 'mnozstvi'].forEach(key => {
    inputs[key].addEventListener('input', () => {
        clearFieldError(key);
    });
});

// ============================================
// INICIALIZACE
// ============================================

async function init() {
    log('Initializing RFQ form...');

    // Nastavit date picker
    setupDatePicker();

    // Aktualizovat počítadla znaků
    updateSpecifikaceCounter();
    updatePoznamkaCounter();

    // Obnovit kontaktní údaje z předchozí relace
    restoreContactInfo();

    // Načíst značky z API/fallback
    await loadBrands();

    // Načíst značku z URL parametru
    loadBrandFromURL();

    log('RFQ form initialized, brands loaded:', brands.length);
}

function loadBrandFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const brandParam = urlParams.get('brand') || urlParams.get('znacka');

    if (brandParam && brandParam.trim()) {
        const brandName = decodeURIComponent(brandParam.trim());
        const match = brands.find(b => b.toLowerCase() === brandName.toLowerCase());
        if (match) {
            selectBrand(match);
        } else {
            inputs.znackaInput.value = brandName;
        }
    }
}

// Spustit při načtení DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
