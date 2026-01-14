// ============================================
// Yes.cz RFQ Systém - JavaScript
// ============================================

// ============================================
// KONFIGURACE
// ============================================
const CONFIG = {
    WEBHOOK_URL: 'https://hook.eu2.make.com/XXXXX', // TODO: Nastavte URL z Make.com webhooku
    TIMEOUT: 10000,
    MIN_DATE_OFFSET: 1, // Nejdříve zítřek
    MAX_DATE_OFFSET: 90, // Maximálně 90 dní
    SUCCESS_URL: 'success.html',
    DEBUG: false
};

// ============================================
// DOM ELEMENTS
// ============================================
const form = document.getElementById('rfqForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const errorAlert = document.getElementById('errorAlert');
const errorMessage = document.getElementById('errorMessage');

// Form inputs
const inputs = {
    jmeno: document.getElementById('zakaznik_jmeno'),
    email: document.getElementById('zakaznik_email'),
    telefon: document.getElementById('zakaznik_telefon'),
    produkt: document.getElementById('produkt'),
    mnozstvi: document.getElementById('mnozstvi'),
    psc: document.getElementById('psc_dodani'),
    termin: document.getElementById('pozadovany_termin'),
    poznamka: document.getElementById('poznamka')
};

// Error elements
const errorElements = {
    jmeno: document.getElementById('jmeno-error'),
    email: document.getElementById('email-error'),
    telefon: document.getElementById('telefon-error'),
    produkt: document.getElementById('produkt-error'),
    mnozstvi: document.getElementById('mnozstvi-error'),
    psc: document.getElementById('psc-error'),
    termin: document.getElementById('termin-error')
};

// ============================================
// UTILITY FUNKCE
// ============================================

/**
 * Logování (pouze v DEBUG módu)
 */
function log(...args) {
    if (CONFIG.DEBUG) {
        console.log('[RFQ]', ...args);
    }
}

/**
 * Zavření error alertu (globální funkce pro onclick)
 */
window.closeErrorAlert = function() {
    errorAlert.style.display = 'none';
};

/**
 * Zobrazení error alertu
 */
function showErrorAlert(message) {
    errorMessage.textContent = message;
    errorAlert.style.display = 'flex';
    errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-hide po 10 sekundách
    setTimeout(() => {
        closeErrorAlert();
    }, 10000);
}

/**
 * Zobrazení chyby u konkrétního pole
 */
function showFieldError(fieldName, message) {
    const errorEl = errorElements[fieldName];
    const input = inputs[fieldName];
    
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('active');
    }
    
    if (input) {
        input.setAttribute('aria-invalid', 'true');
        input.style.borderColor = 'var(--red-error)';
    }
}

/**
 * Vyčištění chyby u pole
 */
function clearFieldError(fieldName) {
    const errorEl = errorElements[fieldName];
    const input = inputs[fieldName];
    
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('active');
    }
    
    if (input) {
        input.setAttribute('aria-invalid', 'false');
        input.style.borderColor = '';
    }
}

/**
 * Vyčištění všech chyb
 */
function clearAllErrors() {
    Object.keys(errorElements).forEach(key => {
        clearFieldError(key);
    });
    closeErrorAlert();
}

// ============================================
// VALIDAČNÍ FUNKCE
// ============================================

/**
 * Validace jména
 */
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

/**
 * Validace emailu
 */
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

/**
 * Validace telefonu (před odesláním - jen číslice)
 */
function validateTelefon(value) {
    if (!value) {
        return 'Toto pole je povinné';
    }
    // Odstranit všechny nečíselné znaky
    const digits = value.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 13) {
        return 'Zadejte platné telefonní číslo ve formátu +420 123 456 789';
    }
    if (!digits.startsWith('420') && digits.length === 9) {
        return 'Telefonní číslo musí začínat +420';
    }
    return null;
}

/**
 * Validace produktu
 */
function validateProdukt(value) {
    if (!value || value.trim().length < 2) {
        return 'Zadejte název produktu (min 2 znaky)';
    }
    if (value.length > 200) {
        return 'Název produktu může obsahovat maximálně 200 znaků';
    }
    return null;
}

/**
 * Validace množství
 */
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

/**
 * Validace PSČ
 */
function validatePSC(value) {
    if (!value) {
        return 'Toto pole je povinné';
    }
    // Odstranit mezery
    const digits = value.replace(/\s/g, '');
    if (!/^\d{5}$/.test(digits)) {
        return 'PSČ musí obsahovat přesně 5 číslic';
    }
    return null;
}

/**
 * Validace termínu
 */
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
        return `Datum může být maximálně ${CONFIG.MAX_DATE_OFFSET} dní od dneška`;
    }
    return null;
}

/**
 * Validace poznámky
 */
function validatePoznamka(value) {
    if (value && value.length > 500) {
        return 'Poznámka může obsahovat max 500 znaků';
    }
    return null;
}

/**
 * Validace celého formuláře
 */
function validateForm() {
    clearAllErrors();
    
    const values = {
        jmeno: inputs.jmeno.value.trim(),
        email: inputs.email.value.trim(),
        telefon: inputs.telefon.value,
        produkt: inputs.produkt.value.trim(),
        mnozstvi: inputs.mnozstvi.value,
        psc: inputs.psc.value,
        termin: inputs.termin.value,
        poznamka: inputs.poznamka.value.trim()
    };
    
    const errors = {
        jmeno: validateJmeno(values.jmeno),
        email: validateEmail(values.email),
        telefon: validateTelefon(values.telefon),
        produkt: validateProdukt(values.produkt),
        mnozstvi: validateMnozstvi(values.mnozstvi),
        psc: validatePSC(values.psc),
        termin: validateTermin(values.termin),
        poznamka: validatePoznamka(values.poznamka)
    };
    
    let hasErrors = false;
    let firstErrorField = null;
    
    Object.keys(errors).forEach(key => {
        if (errors[key]) {
            showFieldError(key, errors[key]);
            hasErrors = true;
            if (!firstErrorField) {
                firstErrorField = inputs[key];
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

/**
 * Formátování telefonu během psaní (+420 123 456 789)
 */
function formatTelefon(value) {
    // Odstranit vše kromě číslic
    let digits = value.replace(/\D/g, '');
    
    // Pokud začíná 420, ponechat, jinak přidat 420
    if (digits.startsWith('420')) {
        digits = digits.substring(3);
    }
    
    // Omezit na 9 číslic
    digits = digits.substring(0, 9);
    
    // Formátovat: +420 XXX XXX XXX
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

/**
 * Formátování PSČ během psaní (120 00)
 */
function formatPSC(value) {
    // Odstranit vše kromě číslic
    let digits = value.replace(/\D/g, '');
    
    // Omezit na 5 číslic
    digits = digits.substring(0, 5);
    
    // Formátovat: XXX XX
    if (digits.length <= 3) {
        return digits;
    }
    return digits.substring(0, 3) + ' ' + digits.substring(3, 5);
}

/**
 * Předzpracování dat před odesláním
 */
function preprocessData() {
    return {
        timestamp: new Date().toISOString(),
        produkt: inputs.produkt.value.trim(),
        zakaznik_jmeno: inputs.jmeno.value.trim(),
        zakaznik_email: inputs.email.value.trim(),
        zakaznik_telefon: inputs.telefon.value.replace(/\D/g, ''), // Jen číslice
        mnozstvi: parseInt(inputs.mnozstvi.value, 10),
        psc_dodani: inputs.psc.value.replace(/\s/g, ''), // Odstranit mezery
        pozadovany_termin: inputs.termin.value, // YYYY-MM-DD
        poznamka: inputs.poznamka.value.trim() || '',
        formular_url: window.location.href,
        user_agent: navigator.userAgent
    };
}

// ============================================
// PŘEDVYPLNĚNÍ PRODUKTU Z URL
// ============================================

/**
 * Načtení produktu z URL parametru
 */
function loadProductFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const productParam = urlParams.get('product');
    
    if (productParam && productParam.trim()) {
        // Dekódovat URL encoding
        const productName = decodeURIComponent(productParam.trim());
        
        if (productName.length >= 2) {
            inputs.produkt.value = productName;
            inputs.produkt.setAttribute('readonly', 'readonly');
            
            // Zobrazit helper text
            const helper = document.getElementById('produkt-helper');
            if (helper) {
                helper.style.display = 'flex';
            }
            
            log('Produkt předvyplněn z URL:', productName);
        }
    }
}

// ============================================
// NASTAVENÍ DATE PICKERU
// ============================================

/**
 * Nastavení minimálního a maximálního data
 */
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
// POČÍTADLO ZNAKŮ PRO POZNÁMKU
// ============================================

/**
 * Aktualizace počítadla znaků
 */
function updateCharCounter() {
    const counter = document.getElementById('poznamka-counter');
    if (counter) {
        const length = inputs.poznamka.value.length;
        counter.textContent = `${length}/500`;
        
        if (length > 500) {
            counter.style.color = 'var(--red-error)';
        } else {
            counter.style.color = 'var(--text-secondary)';
        }
    }
}

// ============================================
// LOADING STAV
// ============================================

/**
 * Nastavení loading stavu
 */
function setLoadingState(loading) {
    if (loading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        
        // Disable všechny inputy
        Object.values(inputs).forEach(input => {
            if (input) input.disabled = true;
        });
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        
        // Enable všechny inputy
        Object.values(inputs).forEach(input => {
            if (input) input.disabled = false;
        });
    }
}

// ============================================
// ODESLÁNÍ FORMULÁŘE
// ============================================

/**
 * Odeslání dat do Make.com webhooku
 */
async function submitForm() {
    // Validace
    if (!validateForm()) {
        return;
    }
    
    // Kontrola webhook URL
    if (!CONFIG.WEBHOOK_URL || CONFIG.WEBHOOK_URL.includes('XXXXX')) {
        showErrorAlert('Chyba konfigurace: Make.com webhook URL není nastaven. Kontaktujte administrátora.');
        return;
    }
    
    // Předzpracování dat
    const data = preprocessData();
    
    log('Odesílám data:', data);
    
    // Loading stav
    setLoadingState(true);
    
    try {
        // Timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
        
        // POST request
        const response = await fetch(CONFIG.WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Zkontrolovat response
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} ${errorText}`);
        }
        
        // Success - uložit email do sessionStorage a redirect
        sessionStorage.setItem('rfq_email', data.zakaznik_email);
        window.location.href = CONFIG.SUCCESS_URL;
        
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
// EVENT LISTENERS
// ============================================

// Form submit
form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitForm();
});

// Real-time validace při blur
inputs.jmeno.addEventListener('blur', () => {
    const error = validateJmeno(inputs.jmeno.value.trim());
    if (error) {
        showFieldError('jmeno', error);
    } else {
        clearFieldError('jmeno');
    }
});

inputs.email.addEventListener('blur', () => {
    const error = validateEmail(inputs.email.value.trim());
    if (error) {
        showFieldError('email', error);
    } else {
        clearFieldError('email');
    }
});

inputs.telefon.addEventListener('blur', () => {
    const error = validateTelefon(inputs.telefon.value);
    if (error) {
        showFieldError('telefon', error);
    } else {
        clearFieldError('telefon');
    }
});

inputs.produkt.addEventListener('blur', () => {
    const error = validateProdukt(inputs.produkt.value.trim());
    if (error) {
        showFieldError('produkt', error);
    } else {
        clearFieldError('produkt');
    }
});

inputs.mnozstvi.addEventListener('blur', () => {
    const error = validateMnozstvi(inputs.mnozstvi.value);
    if (error) {
        showFieldError('mnozstvi', error);
    } else {
        clearFieldError('mnozstvi');
    }
});

inputs.psc.addEventListener('blur', () => {
    const error = validatePSC(inputs.psc.value);
    if (error) {
        showFieldError('psc', error);
    } else {
        clearFieldError('psc');
    }
});

inputs.termin.addEventListener('blur', () => {
    const error = validateTermin(inputs.termin.value);
    if (error) {
        showFieldError('termin', error);
    } else {
        clearFieldError('termin');
    }
});

inputs.poznamka.addEventListener('blur', () => {
    const error = validatePoznamka(inputs.poznamka.value);
    if (error) {
        showErrorAlert(error);
    }
});

// Auto-formátování během psaní
inputs.telefon.addEventListener('input', (e) => {
    const formatted = formatTelefon(e.target.value);
    e.target.value = formatted;
    clearFieldError('telefon');
});

inputs.psc.addEventListener('input', (e) => {
    const formatted = formatPSC(e.target.value);
    e.target.value = formatted;
    clearFieldError('psc');
});

// Počítadlo znaků pro poznámku
inputs.poznamka.addEventListener('input', () => {
    updateCharCounter();
    const error = validatePoznamka(inputs.poznamka.value);
    if (error) {
        showErrorAlert(error);
    }
});

// Clear error při psaní
Object.keys(inputs).forEach(key => {
    inputs[key].addEventListener('input', () => {
        clearFieldError(key);
    });
});

// ============================================
// INICIALIZACE
// ============================================

/**
 * Inicializace při načtení stránky
 */
function init() {
    log('Initializing RFQ form...');
    
    // Nastavit date picker
    setupDatePicker();
    
    // Načíst produkt z URL
    loadProductFromURL();
    
    // Aktualizovat počítadlo znaků
    updateCharCounter();
    
    log('RFQ form initialized');
}

// Spustit při načtení DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
