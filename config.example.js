// ============================================
// KONFIGURAČNÍ SOUBOR PRO RFQ SYSTÉM
// ============================================
// 
// INSTRUKCE:
// 1. Zkopírujte tento soubor jako config.js
// 2. Vyplňte vaše údaje
// 3. V index.html přidejte: <script src="config.js"></script> PŘED script.js
//
// ============================================

// Make.com Webhook URL
// Získejte z Make.com scénáře:
// 1. Otevřete Make.com scénář
// 2. Klikněte na Webhook modul (trigger)
// 3. Zkopírujte "Webhook URL"
const CONFIG = {
    // Make.com Webhook URL pro odesílání poptávek
    MAKE_WEBHOOK_URL: 'https://hook.eu1.make.com/xxxxxxxxxxxxx',
    
    // Volitelné: API URL pro načítání produktů z Airtable
    PRODUCT_API_URL: '', // Nebo '/api/products'
    
    // Volitelné: Google Analytics tracking ID
    GA_TRACKING_ID: '', // Např. 'G-XXXXXXXXXX'
};

// Export pro použití v script.js
if (typeof window !== 'undefined') {
    window.RFQ_CONFIG = CONFIG;
}
