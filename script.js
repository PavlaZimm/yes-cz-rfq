// ============================================
// Yes.cz RFQ Systém - JavaScript
// ============================================

// ============================================
// KONFIGURACE
// ============================================
const CONFIG = {
    WEBHOOK_URL: 'https://hook.eu1.make.com/1f7yqjfjkbxjccqgkyychhl1jo73783l',
    BRANDS_API_URL: '',
    TIMEOUT: 10000,
    MIN_DATE_OFFSET: 7,
    MAX_DATE_OFFSET: 90,
    SUCCESS_URL: 'success.html',
    DEBUG: true,
    MAX_PRODUCTS: 20,
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
        'Huawei Měniče',
        'JA Solar',
        'Jinko Solar',
        'Leapton',
        'Longi',
        'Risen',
        'Solax',
        'Trina',
        'Victron'
    ]
};

// ============================================
// JAZYKOVÁ DETEKCE
// ============================================
const langParam = new URLSearchParams(window.location.search).get('lang');
const isCzech = langParam
    ? (langParam === 'cs' || langParam === 'sk')
    : ((navigator.language || '').startsWith('cs') || (navigator.language || '').startsWith('sk'));

const CS = {
    pageTitle: 'Poptat cenu',
    pageSubtitle: 'Vyberte značku, specifikujte produkty a my vám zašleme nejlepší nabídku od našich dodavatelů',
    sectionProduct: 'Produkt',
    labelBrand: 'Značka',
    brandHint: 'Volitelné – vyberte značku ze seznamu nebo začněte psát pro vyhledání',
    brandPlaceholder: 'Začněte psát název značky...',
    brandNotFound: 'Značka nenalezena',
    brandNone: 'Žádné značky k dispozici',
    brandLoading: 'Načítám značky...',
    labelProducts: 'Produkty',
    productSpecPlaceholder: 'Specifikace produktu (např. Panel XYZ 400W)',
    productQtyPlaceholder: 'Ks',
    addProduct: '+ Přidat další produkt stejné značky',
    sectionDelivery: 'Dodání',
    labelDeliveryDate: 'Požadovaný termín dodání DDP',
    deliveryHint: 'Nejdříve za týden od dneška',
    labelAuctionTime: 'Kolik času mají obchodníci na zpracování nabídky včetně ověření dopravy na místo zakázky?',
    auction3: 'Tři pracovní dny',
    auction5: 'Pět pracovních dnů',
    auction7: 'Sedm pracovních dnů',
    sectionContact: 'Kontaktní údaje',
    labelCompany: 'Název společnosti',
    companyPlaceholder: 'Název vaší společnosti',
    labelIco: 'IČO',
    icoPlaceholder: '12345678',
    labelDeliveryAddress: 'Adresa místa dodání',
    deliveryAddressPlaceholder: 'Ulice, město, PSČ',
    deliveryAddressHint: 'Vyplňte pouze pokud je adresa dodání jiná než adresa společnosti',
    labelName: 'Jméno a příjmení',
    namePlaceholder: 'Jan Novák',
    labelEmail: 'Email',
    emailPlaceholder: 'jan.novak@email.cz',
    labelPhone: 'Telefon',
    phonePlaceholder: '+420 123 456 789',
    labelNote: 'Poznámka',
    noteHint: 'Maximálně 500 znaků',
    submitBtn: 'Odeslat poptávku',
    submitting: 'Odesílám...',
    formFooter: 'Odesláním poptávky souhlasíte se zpracováním osobních údajů.',
    optional: '(volitelné)',
    required: '*',
    notePlaceholder: 'Doplňující informace k poptávce...',
    errorTitle: 'Chyba',
    closeAlert: 'Zavřít',
    submitAriaLabel: 'Odeslat poptávku',
    loadingBrands: 'Načítám značky...',
    labelMistoDodani: 'Místo dodání',
    mistoDodaniPlaceholder: 'Např. Praha, Brno, adresa skladu...',
    mistoDodaniHint: 'Místo, kam má být zásilka doručena',
    submitAnother: 'Poptat další značku',
    successTitle: 'Poptávka odeslána!',
    successBrand: 'Poptávka pro značku "{brand}" byla úspěšně odeslána. Ozveme se vám s nabídkou.',
    successBrandN: 'Poptávka pro značku "{brand}" byla odeslána ({n}. poptávka v této relaci).',
    successNoBrand: 'Poptávka byla úspěšně odeslána. Ozveme se vám s nabídkou.',
    successNoBrandN: 'Poptávka byla odeslána ({n}. poptávka v této relaci).',
    // Validation
    errBrandInvalid: 'Vyberte platnou značku ze seznamu',
    errProductEmpty: 'Zadejte alespoň jeden produkt',
    errProductSpec: 'Vyplňte specifikaci u všech produktů',
    errProductQty: 'Zadejte počet kusů u všech produktů',
    errAuction: 'Vyberte termín ukončení aukce',
    errCompanyMin: 'Název společnosti musí obsahovat alespoň 2 znaky',
    errCompanyMax: 'Název společnosti může obsahovat maximálně 200 znaků',
    errIcoRequired: 'IČO je povinné',
    errIcoFormat: 'IČO musí obsahovat přesně 8 číslic',
    errNameMin: 'Jméno musí obsahovat alespoň 2 znaky',
    errNameMax: 'Jméno může obsahovat maximálně 100 znaků',
    errNameChars: 'Jméno může obsahovat pouze písmena a mezery',
    errRequired: 'Toto pole je povinné',
    errEmailInvalid: 'Zadejte platnou emailovou adresu',
    errPhoneInvalid: 'Zadejte platné telefonní číslo ve formátu +420 123 456 789',
    errPhonePrefix: 'Telefonní číslo musí začínat +420',
    errDateMin: 'Vyberte datum nejdříve za týden od dneška',
    errDateMax: 'Datum může být maximálně {n} dní od dneška',
    errNoteMax: 'Poznámka může obsahovat max 500 znaků',
    errMaxProducts: 'Maximální počet produktů je {n}',
    errConfig: 'Chyba konfigurace: Make.com webhook URL není nastaven. Kontaktujte administrátora.',
    errTimeout: 'Požadavek trval příliš dlouho. Zkuste to znovu.',
    errNetwork: 'Nepodařilo se odeslat formulář. Zkontrolujte připojení.',
    errServer: 'Došlo k chybě na serveru. Kontaktujte nás na +420 608 887 277',
    errGeneral: 'Nastala chyba při odesílání. Zkuste to prosím znovu.'
};

const EN = {
    pageTitle: 'Request a Quote',
    pageSubtitle: 'Select a brand, specify products and we will send you the best offer from our suppliers',
    sectionProduct: 'Product',
    labelBrand: 'Brand',
    brandHint: 'Optional – select a brand from the list or start typing to search',
    brandPlaceholder: 'Start typing a brand name...',
    brandNotFound: 'Brand not found',
    brandNone: 'No brands available',
    brandLoading: 'Loading brands...',
    labelProducts: 'Products',
    productSpecPlaceholder: 'Product specification (e.g. Panel XYZ 400W)',
    productQtyPlaceholder: 'Qty',
    addProduct: '+ Add another product of the same brand',
    sectionDelivery: 'Delivery',
    labelDeliveryDate: 'Required DDP delivery date',
    deliveryHint: 'At least one week from today',
    labelAuctionTime: 'How much time do suppliers have to prepare the offer including delivery verification?',
    auction3: 'Three business days',
    auction5: 'Five business days',
    auction7: 'Seven business days',
    sectionContact: 'Contact details',
    labelCompany: 'Company name',
    companyPlaceholder: 'Your company name',
    labelIco: 'Company ID',
    icoPlaceholder: '12345678',
    labelDeliveryAddress: 'Delivery address',
    deliveryAddressPlaceholder: 'Street, city, ZIP',
    deliveryAddressHint: 'Fill in only if the delivery address differs from the company address',
    labelName: 'Full name',
    namePlaceholder: 'John Doe',
    labelEmail: 'Email',
    emailPlaceholder: 'john.doe@email.com',
    labelPhone: 'Phone',
    phonePlaceholder: '+420 123 456 789',
    labelNote: 'Note',
    noteHint: 'Maximum 500 characters',
    submitBtn: 'Submit request',
    submitting: 'Submitting...',
    formFooter: 'By submitting a request you agree to the processing of personal data.',
    optional: '(optional)',
    required: '*',
    notePlaceholder: 'Additional information about the request...',
    errorTitle: 'Error',
    closeAlert: 'Close',
    submitAriaLabel: 'Submit request',
    loadingBrands: 'Loading brands...',
    labelMistoDodani: 'Delivery location',
    mistoDodaniPlaceholder: 'E.g. Prague, Brno, warehouse address...',
    mistoDodaniHint: 'Location where the shipment should be delivered',
    submitAnother: 'Request another brand',
    successTitle: 'Request sent!',
    successBrand: 'Request for brand "{brand}" was successfully sent. We will get back to you with an offer.',
    successBrandN: 'Request for brand "{brand}" was sent ({n}th request in this session).',
    successNoBrand: 'Request was successfully sent. We will get back to you with an offer.',
    successNoBrandN: 'Request was sent ({n}th request in this session).',
    // Validation
    errBrandInvalid: 'Select a valid brand from the list',
    errProductEmpty: 'Enter at least one product',
    errProductSpec: 'Fill in the specification for all products',
    errProductQty: 'Enter the quantity for all products',
    errAuction: 'Select the auction deadline',
    errCompanyMin: 'Company name must contain at least 2 characters',
    errCompanyMax: 'Company name can contain a maximum of 200 characters',
    errIcoRequired: 'Company ID is required',
    errIcoFormat: 'Company ID must contain exactly 8 digits',
    errNameMin: 'Name must contain at least 2 characters',
    errNameMax: 'Name can contain a maximum of 100 characters',
    errNameChars: 'Name can only contain letters and spaces',
    errRequired: 'This field is required',
    errEmailInvalid: 'Enter a valid email address',
    errPhoneInvalid: 'Enter a valid phone number in +420 123 456 789 format',
    errPhonePrefix: 'Phone number must start with +420',
    errDateMin: 'Select a date at least one week from today',
    errDateMax: 'Date can be maximum {n} days from today',
    errNoteMax: 'Note can contain a maximum of 500 characters',
    errMaxProducts: 'Maximum number of products is {n}',
    errConfig: 'Configuration error: Make.com webhook URL is not set. Contact the administrator.',
    errTimeout: 'Request took too long. Please try again.',
    errNetwork: 'Failed to submit the form. Check your connection.',
    errServer: 'A server error occurred. Contact us at +420 608 887 277',
    errGeneral: 'An error occurred while submitting. Please try again.'
};

const t = isCzech ? CS : EN;

// ============================================
// STAV APLIKACE
// ============================================
let brands = [];
let highlightedIndex = -1;
let selectedBrand = '';
let submissionCount = 0;
let produktCounter = 1; // počítadlo pro unikátní indexy produktů

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
    termin: document.getElementById('pozadovany_termin'),
    spolecnost: document.getElementById('nazev_spolecnosti'),
    ico: document.getElementById('ico'),
    jmeno: document.getElementById('zakaznik_jmeno'),
    email: document.getElementById('zakaznik_email'),
    telefon: document.getElementById('zakaznik_telefon'),
    adresaDodani: document.getElementById('adresa_dodani'),
    poznamka: document.getElementById('poznamka')
};

// Dropdown elements
const znackaDropdown = document.getElementById('znackaDropdown');
const znackaList = document.getElementById('znacka-list');
const znackaLoading = document.getElementById('znacka-loading');

// Produkty elements
const produktyList = document.getElementById('produkty-list');
const addProduktBtn = document.getElementById('addProduktBtn');

// Error elements
const errorElements = {
    znacka: document.getElementById('znacka-error'),
    produkty: document.getElementById('produkty-error'),
    termin: document.getElementById('termin-error'),
    aukce: document.getElementById('aukce-error'),
    spolecnost: document.getElementById('spolecnost-error'),
    ico: document.getElementById('ico-error'),
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
        const group = errorEl.closest('.form-group');
        if (group) group.classList.add('field-error');
    }

    let input;
    if (fieldName === 'znacka') {
        input = inputs.znackaInput;
    } else if (fieldName === 'produkty' || fieldName === 'aukce') {
        // No single input to highlight
        return;
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
        const group = errorEl.closest('.form-group');
        if (group) group.classList.remove('field-error');
    }

    let input;
    if (fieldName === 'znacka') {
        input = inputs.znackaInput;
    } else if (fieldName === 'produkty' || fieldName === 'aukce') {
        return;
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
    if (!CONFIG.BRANDS_API_URL) {
        brands = ['Bez značky'].concat(CONFIG.FALLBACK_BRANDS.slice().sort());
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

        if (Array.isArray(data)) {
            brands = ['Bez značky'].concat(data.map(item =>
                typeof item === 'string' ? item : (item.name || item.Name || item.znacka || '')
            ).filter(Boolean).sort());
        } else if (data.brands && Array.isArray(data.brands)) {
            brands = ['Bez značky'].concat(data.brands.filter(Boolean).sort());
        } else if (data.records && Array.isArray(data.records)) {
            brands = ['Bez značky'].concat(data.records.map(r =>
                r.fields ? (r.fields.name || r.fields.Name || r.fields.znacka || '') : ''
            ).filter(Boolean).sort());
        } else {
            throw new Error('Neočekávaný formát dat');
        }

        log('Načteno značek z API:', brands.length);
    } catch (error) {
        log('Chyba při načítání značek:', error);
        brands = ['Bez značky'].concat(CONFIG.FALLBACK_BRANDS.slice().sort());
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
        empty.textContent = query ? t.brandNotFound : t.brandNone;
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
    // Focus first product spec field
    const firstSpec = produktyList.querySelector('.produkt-spec');
    if (firstSpec) firstSpec.focus();
}

function navigateDropdown(direction) {
    const items = znackaList.querySelectorAll('li[role="option"]');
    if (items.length === 0) return;

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
    setTimeout(() => {
        const typed = inputs.znackaInput.value.trim();
        if (typed && !selectedBrand) {
            const match = brands.find(b => b.toLowerCase() === typed.toLowerCase());
            if (match) {
                selectBrand(match);
            }
        }
        closeDropdown();

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

document.addEventListener('click', (e) => {
    if (!znackaDropdown.contains(e.target)) {
        closeDropdown();
    }
});

// ============================================
// DYNAMICKÉ PRODUKTY
// ============================================

function addProduktRow() {
    const rows = produktyList.querySelectorAll('.produkt-row');
    if (rows.length >= CONFIG.MAX_PRODUCTS) {
        showErrorAlert(t.errMaxProducts.replace('{n}', CONFIG.MAX_PRODUCTS));
        return;
    }

    produktCounter++;
    const newRow = document.createElement('div');
    newRow.className = 'produkt-row';
    newRow.setAttribute('data-index', produktCounter);
    newRow.innerHTML =
        '<div class="produkt-fields">' +
            '<input type="text" class="form-input produkt-spec" ' +
                'placeholder="' + t.productSpecPlaceholder + '" ' +
                'required maxlength="500" ' +
                'aria-label="' + (isCzech ? 'Specifikace produktu ' : 'Product specification ') + (produktCounter + 1) + '">' +
            '<div class="input-wrapper produkt-qty-wrapper">' +
                '<input type="number" class="form-input produkt-qty" ' +
                    'placeholder="' + t.productQtyPlaceholder + '" required min="1" step="1" ' +
                    'aria-label="' + (isCzech ? 'Počet kusů produktu ' : 'Quantity for product ') + (produktCounter + 1) + '">' +
                '<span class="input-suffix">' + (isCzech ? 'ks' : 'pcs') + '</span>' +
            '</div>' +
        '</div>' +
        '<button type="button" class="produkt-remove-btn" aria-label="' + (isCzech ? 'Odebrat produkt' : 'Remove product') + '" title="' + (isCzech ? 'Odebrat produkt' : 'Remove product') + '">×</button>';

    produktyList.appendChild(newRow);
    updateRemoveButtons();
    clearFieldError('produkty');

    // Focus new row's spec input
    const newSpec = newRow.querySelector('.produkt-spec');
    if (newSpec) newSpec.focus();

    log('Přidán produkt, celkem:', produktyList.querySelectorAll('.produkt-row').length);
}

function removeProduktRow(row) {
    row.remove();
    updateRemoveButtons();
    log('Odebrán produkt, celkem:', produktyList.querySelectorAll('.produkt-row').length);
}

function updateRemoveButtons() {
    const rows = produktyList.querySelectorAll('.produkt-row');
    rows.forEach(row => {
        const btn = row.querySelector('.produkt-remove-btn');
        if (btn) {
            // Show remove button only if there are 2+ rows
            btn.style.display = rows.length > 1 ? 'flex' : 'none';
        }
    });
}

function getProductsData() {
    const rows = Array.from(produktyList.querySelectorAll('.produkt-row'));
    log('getProductsData: nalezeno řádků:', rows.length);
    const products = [];
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const specEl = row.querySelector('.produkt-spec');
        const qtyEl = row.querySelector('.produkt-qty');
        if (!specEl || !qtyEl) {
            log('getProductsData: řádek', i, 'nemá spec/qty element, přeskakuji');
            continue;
        }
        const spec = specEl.value.trim();
        const qty = qtyEl.value;
        if (spec || qty) {
            products.push({
                specifikace: spec,
                pocet_kusu: qty ? parseInt(qty, 10) : 0
            });
        }
    }
    log('getProductsData: celkem produktů:', products.length);
    return products;
}

// Event delegation for remove buttons
produktyList.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.produkt-remove-btn');
    if (removeBtn) {
        const row = removeBtn.closest('.produkt-row');
        removeProduktRow(row);
    }
});

// Add product button
addProduktBtn.addEventListener('click', () => {
    addProduktRow();
});

// ============================================
// TERMÍN UKONČENÍ AUKCE - VÝPOČET DEADLINE
// ============================================

function addBusinessDays(startDate, numDays) {
    const result = new Date(startDate);
    let added = 0;
    while (added < numDays) {
        result.setDate(result.getDate() + 1);
        const dayOfWeek = result.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            added++;
        }
    }
    return result;
}

function getSelectedAukceDays() {
    const selected = document.querySelector('input[name="termin_aukce"]:checked');
    return selected ? parseInt(selected.value, 10) : null;
}

function calculateAukceDeadline() {
    const days = getSelectedAukceDays();
    if (!days) return null;
    const deadline = addBusinessDays(new Date(), days);
    deadline.setHours(12, 0, 0, 0); // deadline do 12:00
    return deadline.toISOString().split('T')[0]; // YYYY-MM-DD
}

// ============================================
// VALIDAČNÍ FUNKCE
// ============================================

function validateZnacka() {
    const value = inputs.znacka.value || inputs.znackaInput.value.trim();
    if (!value) {
        return null;
    }
    const isValid = brands.some(b => b.toLowerCase() === value.toLowerCase());
    if (!isValid) {
        return t.errBrandInvalid;
    }
    return null;
}

function validateProdukty() {
    const rows = produktyList.querySelectorAll('.produkt-row');
    let hasValidProduct = false;
    let hasError = false;
    let errorMsg = '';

    rows.forEach((row, index) => {
        const specInput = row.querySelector('.produkt-spec');
        const qtyInput = row.querySelector('.produkt-qty');
        const spec = specInput.value.trim();
        const qty = qtyInput.value;

        specInput.classList.remove('input-error');
        specInput.style.borderColor = '';
        qtyInput.classList.remove('input-error');
        qtyInput.style.borderColor = '';

        if (!spec && !qty) {
            if (rows.length === 1) {
                specInput.classList.add('input-error');
                qtyInput.classList.add('input-error');
                hasError = true;
                errorMsg = t.errProductEmpty;
            }
            return;
        }

        if (!spec) {
            specInput.classList.add('input-error');
            hasError = true;
            errorMsg = t.errProductSpec;
            return;
        }

        if (!qty || parseInt(qty, 10) < 1) {
            qtyInput.classList.add('input-error');
            hasError = true;
            errorMsg = t.errProductQty;
            return;
        }

        hasValidProduct = true;
    });

    if (!hasValidProduct && !hasError) {
        hasError = true;
        errorMsg = t.errProductEmpty;
    }

    return hasError ? errorMsg : null;
}

function validateAukce() {
    const selected = getSelectedAukceDays();
    if (!selected) {
        return t.errAuction;
    }
    return null;
}

function validateSpolecnost(value) {
    if (!value || value.trim().length < 2) {
        return t.errCompanyMin;
    }
    if (value.length > 200) {
        return t.errCompanyMax;
    }
    return null;
}

function validateIco(value) {
    if (!value) {
        return t.errIcoRequired;
    }
    if (!/^[0-9]{8}$/.test(value.trim())) {
        return t.errIcoFormat;
    }
    return null;
}

function validateJmeno(value) {
    if (!value || value.trim().length < 2) {
        return t.errNameMin;
    }
    if (value.length > 100) {
        return t.errNameMax;
    }
    if (!/^[A-Za-zÁáČčĎďÉéĚěÍíŇňÓóŘřŠšŤťÚúŮůÝýŽž\s]+$/.test(value)) {
        return t.errNameChars;
    }
    return null;
}

function validateEmail(value) {
    if (!value) {
        return t.errRequired;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        return t.errEmailInvalid;
    }
    return null;
}

function validateTelefon(value) {
    if (!value) {
        return t.errRequired;
    }
    const digits = value.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 13) {
        return t.errPhoneInvalid;
    }
    if (!digits.startsWith('420') && digits.length === 9) {
        return t.errPhonePrefix;
    }
    return null;
}

function validateTermin(value) {
    if (!value) {
        return t.errRequired;
    }
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDate = new Date(today);
    minDate.setDate(today.getDate() + CONFIG.MIN_DATE_OFFSET);

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + CONFIG.MAX_DATE_OFFSET);

    if (selectedDate < minDate) {
        return t.errDateMin;
    }
    if (selectedDate > maxDate) {
        return t.errDateMax.replace('{n}', CONFIG.MAX_DATE_OFFSET);
    }
    return null;
}

function validatePoznamka(value) {
    if (value && value.length > 500) {
        return t.errNoteMax;
    }
    return null;
}

function validateForm() {
    clearAllErrors();

    const errors = {
        znacka: validateZnacka(),
        produkty: validateProdukty(),
        termin: validateTermin(inputs.termin.value),
        aukce: validateAukce(),
        spolecnost: validateSpolecnost(inputs.spolecnost.value.trim()),
        ico: validateIco(inputs.ico.value),
        jmeno: validateJmeno(inputs.jmeno.value.trim()),
        email: validateEmail(inputs.email.value.trim()),
        telefon: validateTelefon(inputs.telefon.value)
    };

    let hasErrors = false;
    let firstErrorElement = null;

    log('Validace:', errors);

    Object.keys(errors).forEach(key => {
        if (errors[key]) {
            showFieldError(key, errors[key]);
            hasErrors = true;
            if (!firstErrorElement) {
                if (key === 'znacka') {
                    firstErrorElement = inputs.znackaInput;
                } else if (key === 'produkty') {
                    firstErrorElement = produktyList.querySelector('.produkt-spec');
                } else if (key === 'aukce') {
                    firstErrorElement = document.getElementById('aukceRadioGroup');
                } else if (key === 'spolecnost') {
                    firstErrorElement = inputs.spolecnost;
                } else if (key === 'ico') {
                    firstErrorElement = inputs.ico;
                } else {
                    firstErrorElement = inputs[key];
                }
            }
        }
    });

    if (hasErrors && firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (firstErrorElement.focus) firstErrorElement.focus();
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

function preprocessData() {
    const rawProducts = getProductsData();

    // Map all collected products to the final format
    const products = rawProducts.map(p => ({
        specification: p.specifikace,
        quantity: p.pocet_kusu
    }));

    log('preprocessData: odesílám', products.length, 'produktů:', JSON.stringify(products));

    // Calculate auction deadline
    const aukceDays = getSelectedAukceDays();
    const uzaverka = calculateAukceDeadline();

    return {
        brand: inputs.znacka.value || inputs.znackaInput.value.trim(),
        products: products,
        requested_delivery_date: inputs.termin.value,
        deadline_type: aukceDays,
        deadline_date: uzaverka,
        nazev_spolecnosti: inputs.spolecnost.value.trim(),
        ico: inputs.ico.value.trim(),
        customer_name: inputs.jmeno.value.trim(),
        customer_email: inputs.email.value.trim(),
        customer_phone: inputs.telefon.value.replace(/\D/g, ''),
        adresa_dodani: inputs.adresaDodani.value.trim() || '',
        note: inputs.poznamka.value.trim() || '',
        timestamp: new Date().toISOString()
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

        // Disable all form inputs
        form.querySelectorAll('input, textarea, button[type="button"]').forEach(el => {
            el.disabled = true;
        });
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';

        form.querySelectorAll('input, textarea, button[type="button"]').forEach(el => {
            el.disabled = false;
        });
    }
}

// ============================================
// KONTAKTNÍ ÚDAJE - ULOŽENÍ/OBNOVENÍ
// ============================================

function saveContactInfo() {
    try {
        const contact = {
            spolecnost: inputs.spolecnost.value.trim(),
            ico: inputs.ico.value.trim(),
            jmeno: inputs.jmeno.value.trim(),
            email: inputs.email.value.trim(),
            telefon: inputs.telefon.value,
            adresaDodani: inputs.adresaDodani.value.trim()
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
            if (contact.spolecnost) inputs.spolecnost.value = contact.spolecnost;
            if (contact.ico) inputs.ico.value = contact.ico;
            if (contact.jmeno) inputs.jmeno.value = contact.jmeno;
            if (contact.email) inputs.email.value = contact.email;
            if (contact.telefon) inputs.telefon.value = contact.telefon;
            if (contact.adresaDodani) inputs.adresaDodani.value = contact.adresaDodani;
        }
    } catch (e) {
        // sessionStorage not available
    }
}

// ============================================
// ODESLÁNÍ FORMULÁŘE
// ============================================

async function submitForm() {
    // Před validací: zkusit nastavit značku z typed inputu (řeší race condition s blur)
    if (!inputs.znacka.value && inputs.znackaInput.value.trim()) {
        const typed = inputs.znackaInput.value.trim();
        const match = brands.find(b => b.toLowerCase() === typed.toLowerCase());
        if (match) {
            selectedBrand = match;
            inputs.znacka.value = match;
            inputs.znackaInput.value = match;
        }
    }

    if (!validateForm()) {
        return;
    }

    if (!CONFIG.WEBHOOK_URL || CONFIG.WEBHOOK_URL.includes('XXXXX')) {
        showErrorAlert(t.errConfig);
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

        saveContactInfo();
        submissionCount++;
        showInlineSuccess(data.brand);

    } catch (error) {
        log('Error:', error);

        let errorMsg = t.errGeneral;

        if (error.name === 'AbortError') {
            errorMsg = t.errTimeout;
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMsg = t.errNetwork;
        } else if (error.message.includes('Server error')) {
            errorMsg = t.errServer;
        }

        showErrorAlert(errorMsg);
        setLoadingState(false);
    }
}

// ============================================
// INLINE ÚSPĚCH + POPTAT DALŠÍ ZNAČKU
// ============================================

function showInlineSuccess(brandName) {
    formCard.style.display = 'none';

    const successMsg = document.getElementById('successMessage');
    if (brandName) {
        if (submissionCount > 1) {
            successMsg.textContent = t.successBrandN.replace('{brand}', brandName).replace('{n}', submissionCount);
        } else {
            successMsg.textContent = t.successBrand.replace('{brand}', brandName);
        }
    } else {
        if (submissionCount > 1) {
            successMsg.textContent = t.successNoBrandN.replace('{n}', submissionCount);
        } else {
            successMsg.textContent = t.successNoBrand;
        }
    }

    successAlert.style.display = 'flex';
    successAlert.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setLoadingState(false);
}

function resetForNewBrand() {
    successAlert.style.display = 'none';
    formCard.style.display = 'block';

    // Reset brand
    selectedBrand = '';
    inputs.znackaInput.value = '';
    inputs.znacka.value = '';

    // Reset products - keep only one empty row
    produktyList.innerHTML = '';
    produktCounter = 0;
    const initialRow = document.createElement('div');
    initialRow.className = 'produkt-row';
    initialRow.setAttribute('data-index', '0');
    initialRow.innerHTML =
        '<div class="produkt-fields">' +
            '<input type="text" class="form-input produkt-spec" ' +
                'placeholder="' + t.productSpecPlaceholder + '" ' +
                'required maxlength="500" ' +
                'aria-label="' + (isCzech ? 'Specifikace produktu 1' : 'Product specification 1') + '">' +
            '<div class="input-wrapper produkt-qty-wrapper">' +
                '<input type="number" class="form-input produkt-qty" ' +
                    'placeholder="' + t.productQtyPlaceholder + '" required min="1" step="1" ' +
                    'aria-label="' + (isCzech ? 'Počet kusů produktu 1' : 'Quantity for product 1') + '">' +
                '<span class="input-suffix">' + (isCzech ? 'ks' : 'pcs') + '</span>' +
            '</div>' +
        '</div>' +
        '<button type="button" class="produkt-remove-btn" aria-label="' + (isCzech ? 'Odebrat produkt' : 'Remove product') + '" title="' + (isCzech ? 'Odebrat produkt' : 'Remove product') + '" style="display: none;">×</button>';
    produktyList.appendChild(initialRow);

    // Reset delivery fields
    inputs.termin.value = '';
    const radios = document.querySelectorAll('input[name="termin_aukce"]');
    radios.forEach(r => { r.checked = false; });

    // Reset note
    inputs.poznamka.value = '';

    // Restore contact info
    restoreContactInfo();

    // Update counters
    updatePoznamkaCounter();

    // Clear errors
    clearAllErrors();

    // Update date picker
    setupDatePicker();

    // Focus brand
    inputs.znackaInput.focus();
    formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// EVENT LISTENERS
// ============================================

// Form submit
form.addEventListener('submit', (e) => {
    e.preventDefault();
    log('Form submit triggered');
    submitForm();
});

// Fallback: click listener na submit button
submitBtn.addEventListener('click', (e) => {
    if (e.target.closest('form') && !submitBtn.disabled) {
        log('Submit button clicked');
    }
});

// Poptat další značku
submitAnotherBtn.addEventListener('click', () => {
    resetForNewBrand();
});

// Real-time validace při blur
inputs.spolecnost.addEventListener('blur', () => {
    const error = validateSpolecnost(inputs.spolecnost.value.trim());
    if (error) showFieldError('spolecnost', error);
    else clearFieldError('spolecnost');
});

inputs.ico.addEventListener('blur', () => {
    const error = validateIco(inputs.ico.value);
    if (error) showFieldError('ico', error);
    else clearFieldError('ico');
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

inputs.termin.addEventListener('blur', () => {
    const error = validateTermin(inputs.termin.value);
    if (error) showFieldError('termin', error);
    else clearFieldError('termin');
});

inputs.poznamka.addEventListener('blur', () => {
    const error = validatePoznamka(inputs.poznamka.value);
    if (error) showErrorAlert(error);
});

// Auto-formátování telefonu
inputs.telefon.addEventListener('input', (e) => {
    e.target.value = formatTelefon(e.target.value);
    clearFieldError('telefon');
});

// Počítadla znaků
inputs.poznamka.addEventListener('input', () => {
    updatePoznamkaCounter();
});

// Clear error při psaní
['spolecnost', 'ico', 'jmeno', 'email'].forEach(key => {
    inputs[key].addEventListener('input', () => {
        clearFieldError(key);
    });
});

// Radio button clear error
document.querySelectorAll('input[name="termin_aukce"]').forEach(radio => {
    radio.addEventListener('change', () => {
        clearFieldError('aukce');
    });
});

// ============================================
// PŘEKLAD UI
// ============================================

function applyTranslations() {
    if (isCzech) return; // HTML is already in Czech

    document.documentElement.lang = 'en';
    document.title = t.pageTitle + ' - Yes.cz RFQ';
    document.querySelector('meta[name="description"]').setAttribute('content', t.pageTitle + ' - Yes.cz RFQ');

    const title = document.querySelector('.form-title');
    if (title) title.textContent = t.pageTitle;
    const subtitle = document.querySelector('.form-subtitle');
    if (subtitle) subtitle.textContent = t.pageSubtitle;

    // Section legends
    const legends = document.querySelectorAll('.form-section-title');
    if (legends[0]) legends[0].textContent = t.sectionProduct;
    if (legends[1]) legends[1].textContent = t.sectionDelivery;
    if (legends[2]) legends[2].textContent = t.sectionContact;

    // Brand
    var brandLabel = document.querySelector('label[for="znacka-input"]');
    if (brandLabel) brandLabel.textContent = t.labelBrand;
    inputs.znackaInput.placeholder = t.brandPlaceholder;
    var brandHint = document.getElementById('znacka-hint');
    if (brandHint) brandHint.textContent = t.brandHint;

    // Products
    var prodLabel = document.querySelector('.produkty-list')?.closest('.form-group')?.querySelector('.form-label');
    if (prodLabel) prodLabel.innerHTML = t.labelProducts + ' <span class="required">' + t.required + '</span>';
    addProduktBtn.textContent = t.addProduct;
    document.querySelectorAll('.produkt-spec').forEach(function(el) { el.placeholder = t.productSpecPlaceholder; });
    document.querySelectorAll('.produkt-qty').forEach(function(el) { el.placeholder = t.productQtyPlaceholder; });
    document.querySelectorAll('.produkt-qty-wrapper .input-suffix').forEach(function(el) { el.textContent = 'pcs'; });
    document.querySelectorAll('.produkt-remove-btn').forEach(function(el) {
        el.setAttribute('aria-label', 'Remove product');
        el.setAttribute('title', 'Remove product');
    });

    // Delivery date
    var terminLabel = document.querySelector('label[for="pozadovany_termin"]');
    if (terminLabel) terminLabel.innerHTML = t.labelDeliveryDate + ' <span class="required">' + t.required + '</span>';
    var terminHint = document.getElementById('termin-hint');
    if (terminHint) terminHint.textContent = t.deliveryHint;

    // Auction time
    var aukceLabel = document.getElementById('aukceRadioGroup')?.closest('.form-group')?.querySelector('.form-label');
    if (aukceLabel) aukceLabel.innerHTML = t.labelAuctionTime + ' <span class="required">' + t.required + '</span>';
    var radioLabels = document.querySelectorAll('.radio-label');
    if (radioLabels[0]) radioLabels[0].textContent = t.auction3;
    if (radioLabels[1]) radioLabels[1].textContent = t.auction5;
    if (radioLabels[2]) radioLabels[2].textContent = t.auction7;

    // Contact fields
    var companyLabel = document.querySelector('label[for="nazev_spolecnosti"]');
    if (companyLabel) companyLabel.innerHTML = t.labelCompany + ' <span class="required">' + t.required + '</span>';
    inputs.spolecnost.placeholder = t.companyPlaceholder;

    var icoLabel = document.querySelector('label[for="ico"]');
    if (icoLabel) icoLabel.innerHTML = t.labelIco + ' <span class="required">' + t.required + '</span>';
    inputs.ico.placeholder = t.icoPlaceholder;

    var addrLabel = document.querySelector('label[for="adresa_dodani"]');
    if (addrLabel) addrLabel.innerHTML = t.labelDeliveryAddress + ' <span class="optional">' + t.optional + '</span>';
    inputs.adresaDodani.placeholder = t.deliveryAddressPlaceholder;
    var addrHint = document.getElementById('adresa-dodani-hint');
    if (addrHint) addrHint.textContent = t.deliveryAddressHint;

    var nameLabel = document.querySelector('label[for="zakaznik_jmeno"]');
    if (nameLabel) nameLabel.innerHTML = t.labelName + ' <span class="required">' + t.required + '</span>';
    inputs.jmeno.placeholder = t.namePlaceholder;

    var emailLabel = document.querySelector('label[for="zakaznik_email"]');
    if (emailLabel) emailLabel.innerHTML = t.labelEmail + ' <span class="required">' + t.required + '</span>';
    inputs.email.placeholder = t.emailPlaceholder;

    var phoneLabel = document.querySelector('label[for="zakaznik_telefon"]');
    if (phoneLabel) phoneLabel.innerHTML = t.labelPhone + ' <span class="required">' + t.required + '</span>';
    inputs.telefon.placeholder = t.phonePlaceholder;

    // Místo dodání (samostatné pole)
    var mistoLabel = document.querySelector('label[for="misto_dodani"]');
    if (mistoLabel) mistoLabel.innerHTML = t.labelMistoDodani + ' <span class="optional">' + t.optional + '</span>';
    var mistoInput = document.getElementById('misto_dodani');
    if (mistoInput) mistoInput.placeholder = t.mistoDodaniPlaceholder;
    var mistoHint = document.getElementById('misto-dodani-hint');
    if (mistoHint) mistoHint.textContent = t.mistoDodaniHint;

    // Note
    var noteLabel = document.querySelector('label[for="poznamka"]');
    if (noteLabel) noteLabel.innerHTML = t.labelNote + ' <span class="optional">' + t.optional + '</span>';
    var noteHint = document.getElementById('poznamka-hint');
    if (noteHint) noteHint.textContent = t.noteHint;
    inputs.poznamka.placeholder = t.notePlaceholder;

    // Loading brands
    var loadingBrandsEl = document.getElementById('znacka-loading');
    if (loadingBrandsEl) {
        loadingBrandsEl.innerHTML = '<span class="spinner-sm"></span> ' + t.loadingBrands;
    }

    // Error alert
    var errorStrong = errorAlert.querySelector('strong');
    if (errorStrong) errorStrong.textContent = t.errorTitle;
    var closeBtn = errorAlert.querySelector('.alert-close');
    if (closeBtn) closeBtn.setAttribute('aria-label', t.closeAlert);

    // Submit
    if (btnText) btnText.textContent = t.submitBtn;
    submitBtn.setAttribute('aria-label', t.submitAriaLabel);
    var loaderText = submitBtn.querySelector('.btn-loader');
    if (loaderText) loaderText.innerHTML = '<span class="spinner"></span> ' + t.submitting;
    var footer = document.querySelector('.form-footer');
    if (footer) footer.textContent = t.formFooter;

    // Success alert
    var successStrong = successAlert.querySelector('strong');
    if (successStrong) successStrong.textContent = t.successTitle;
    var successMsg = document.getElementById('successMessage');
    if (successMsg) successMsg.textContent = t.successNoBrand;
    if (submitAnotherBtn) {
        submitAnotherBtn.textContent = t.submitAnother;
        submitAnotherBtn.setAttribute('aria-label', t.submitAnother);
    }
}

// ============================================
// INICIALIZACE
// ============================================

function setupLangSwitcher() {
    const buttons = document.querySelectorAll('.lang-btn');
    buttons.forEach(function (btn) {
        const lang = btn.getAttribute('data-lang');
        if ((isCzech && lang === 'cs') || (!isCzech && lang === 'en')) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.setAttribute('aria-pressed', 'false');
        }
        btn.addEventListener('click', function () {
            if (btn.classList.contains('active')) return;
            const url = new URL(window.location.href);
            url.searchParams.set('lang', lang);
            window.location.href = url.toString();
        });
    });
}

async function init() {
    log('Initializing RFQ form...');

    applyTranslations();
    setupLangSwitcher();
    setupDatePicker();
    updatePoznamkaCounter();
    restoreContactInfo();
    await loadBrands();
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
