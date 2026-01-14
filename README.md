# RFQ Formulář - Yes.cz

Vstupní formulář pro systém aukčních poptávek pro [yes.cz](https://www.yes.cz/cs/) - váš energetický sklad.

## 📋 Přehled projektu

**Účel:** Vstupní formulář pro systém aukčních poptávek  
**Klient:** yes.cz - váš energetický sklad  
**Web:** https://www.yes.cz/cs/  
**Deadline:** 20.1.2026

### Technický stack

- **Frontend:** Vanilla JavaScript (žádné dependencies)
- **Backend:** Make.com (webhook + automatizace)
- **Databáze:** Airtable

---

## 📁 Struktura souborů

```
Yes.cz/
├── index.html          # Hlavní formulář
├── success.html        # Potvrzovací stránka po úspěšném odeslání
├── style.css           # Všechny styly
├── script.js           # Veškerá logika
└── README.md           # Tato dokumentace
```

---

## 🚀 Instalace a nasazení

**Žádná instalace není potřeba!** Formulář je statický HTML soubor.

### Lokální spuštění

1. **Jednoduché otevření:**
   - Otevřete `index.html` přímo v prohlížeči

2. **S lokálním serverem (doporučeno):**
   
   **Python:**
   ```bash
   python3 -m http.server 8000
   ```
   Pak otevřete: `http://localhost:8000`
   
   **Node.js (npx serve):**
   ```bash
   npx serve .
   ```
   
   **PHP:**
   ```bash
   php -S localhost:8000
   ```

### Nasazení na Vercel

**Nejjednodušší způsob:**

1. **Přes Vercel CLI:**
   ```bash
   # Instalace Vercel CLI (pokud ještě nemáte)
   npm i -g vercel
   
   # V projektu
   vercel
   ```
   Vercel automaticky detekuje statické soubory a nasadí je.

2. **Přes GitHub/GitLab:**
   - Pushněte kód do repozitáře
   - Připojte repozitář na [vercel.com](https://vercel.com)
   - Vercel automaticky nasadí při každém pushi

3. **Přes drag & drop:**
   - Jděte na [vercel.com](https://vercel.com)
   - Přihlaste se
   - Drag & drop celou složku projektu
   - Hotovo! 🎉

**Výhody Vercelu:**
- ✅ Rychlé CDN po celém světě
- ✅ HTTPS automaticky
- ✅ Automatické nasazení z Gitu
- ✅ Preview deployments
- ✅ Zdarma pro osobní projekty

**Make.com webhook funguje i z Vercelu** - CORS je automaticky povolený.

---

## ⚙️ Konfigurace

### Nastavení Make.com webhook URL

1. Otevřete `script.js`
2. Najděte konstantu `CONFIG` na začátku souboru:
   ```javascript
   const CONFIG = {
       WEBHOOK_URL: 'https://hook.eu2.make.com/XXXXX', // TODO: Nastavte URL
       ...
   };
   ```
3. Vložte vaši Make.com webhook URL (získáte z Make.com scénáře)

### Jak získat Make.com webhook URL

1. Otevřete Make.com scénář
2. Klikněte na **Webhook modul** (trigger)
3. Zkopírujte **"Webhook URL"**
4. Vložte do `CONFIG.WEBHOOK_URL`

---

## 🎨 Design

### Yes.cz barvy

- **Primární oranžová:** `#FF6B35` (tlačítka, akcenty, odkazy)
- **Tmavě modrá (navy):** `#1E3A5F` (header, nadpisy, hlavní text)
- **Střední modrá:** `#2B4C7E`
- **Zelená (success):** `#10b981`
- **Červená (error):** `#ef4444`
- **Světle šedá (bg):** `#F8F9FA`
- **Bílá:** `#FFFFFF`

### Typografie

- **Font:** Inter (z Google Fonts) nebo system font fallback
- **H1:** 36px (desktop), 28px (mobile)
- **H2:** 24px (desktop), 20px (mobile)
- **Body:** 16px
- **Labels:** 14px, font-weight 500

### Responzivita

- **Mobile-first design**
- **Breakpointy:** 320px (small mobile), 768px (tablet), 1024px (desktop)
- **Touch-friendly:** Všechna tlačítka a inputy min 44x44px

---

## 📝 Formulářová pole

### Povinná pole

1. **Jméno a příjmení** (text, min 2 znaky, max 100 znaků)
2. **Email** (validace emailového formátu)
3. **Telefon** (český formát: +420 XXX XXX XXX)
4. **Název produktu** (text, min 2 znaky, max 200 znaků, může být předvyplněno z URL)
5. **Požadované množství** (číslo, min 1, pouze celá čísla)
6. **PSČ místa dodání** (formát XXX XX, 5 číslic)
7. **Termín dodání** (datum, nejdříve zítřek, max +90 dní)

### Volitelné pole

- **Poznámka** (textarea, max 500 znaků)

---

## 🔧 Funkce

### Validace

- ✅ **Real-time validace** při opuštění pole (blur event)
- ✅ **Validace před odesláním** všech polí najednou
- ✅ **Clear error** když uživatel začne psát do pole s chybou
- ✅ **Scroll k první chybě** při submitu s chybami

### Auto-formátování

- ✅ **Telefon:** Automatické formátování během psaní (`+420 123 456 789`)
- ✅ **PSČ:** Automatické formátování během psaní (`120 00`)
- ✅ **Před odesláním:** Data se předzpracují (telefon jen číslice, PSČ bez mezer)

### Předvyplnění produktu z URL

Formulář podporuje předvyplnění produktu z URL parametru:

```
https://rfq.yes.cz?product=Fotovoltaický panel 400W
```

- Produkt se automaticky předvyplní
- Pole se nastaví jako **readonly**
- Zobrazí se zelený helper text: "✓ Produkt předvyplněn z e-shopu"

### Date picker

- **Min:** Zítřejší datum (dynamicky)
- **Max:** Dnešní datum + 90 dní
- **Disabled:** Všechny minulé dny

---

## 📤 JSON struktura pro webhook

Formulář odesílá tato data do Make.com webhooku:

```json
{
  "timestamp": "2026-01-14T14:30:00.000Z",
  "produkt": "Fotovoltaický panel 400W",
  "zakaznik_jmeno": "Jan Novák",
  "zakaznik_email": "jan.novak@email.cz",
  "zakaznik_telefon": "420123456789",
  "mnozstvi": 100,
  "psc_dodani": "12000",
  "pozadovany_termin": "2026-02-15",
  "poznamka": "Preferuji dodání na jednu adresu",
  "formular_url": "https://rfq.yes.cz",
  "user_agent": "Mozilla/5.0..."
}
```

### Datové typy

- `timestamp`: string (ISO 8601)
- `produkt`: string
- `zakaznik_jmeno`: string
- `zakaznik_email`: string
- `zakaznik_telefon`: string (jen číslice včetně 420)
- `mnozstvi`: number (integer)
- `psc_dodani`: string (5 číslic)
- `pozadovany_termin`: string (YYYY-MM-DD)
- `poznamka`: string (může být prázdný "")
- `formular_url`: string
- `user_agent`: string

---

## 🔗 Integrace s Make.com

### Make.com Scenario 1

Webhook očekává:
- **Method:** POST
- **Content-Type:** application/json
- **Body:** JSON struktura (viz výše)

Make.com Scenario 1 by měl:
1. Přijmout webhook
2. Parsovat JSON
3. Vytvořit record v Airtable tabulce **POPTÁVKY**
4. Automaticky přidat: Datum vytvoření, Uzávěrka (+7 dní), Stav ("Nová")
5. Poslat potvrzovací email zákazníkovi

### CORS

Make.com má automaticky povolený CORS - není potřeba nic nastavovat.

---

## 🎯 Tlačítko pro PrestaShop

### HTML kód pro PrestaShop vývojáře

```html
<a href="https://rfq.yes.cz?product={$product.name|escape:'url'}" 
   class="btn btn-rfq"
   target="_blank"
   rel="noopener">
   Poptat cenu
</a>
```

### CSS styling

```css
.btn-rfq {
  background: #FF6B35;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: all 200ms ease;
}

.btn-rfq:hover {
  background: #E55A2B;
  transform: translateY(-1px);
}
```

**Poznámky:**
- Tlačítko vede na formulář s parametrem produktu
- Žádné databázové propojení s PrestaShop
- Produkt se předvyplní automaticky (readonly)

---

## ♿ Accessibility (A11Y)

### Povinné požadavky

- ✅ **HTML Semantic:** Správné HTML5 elementy
- ✅ **ARIA Attributes:** `aria-required`, `aria-invalid`, `aria-describedby`, `role="alert"`
- ✅ **Keyboard Navigation:** Tab, Enter, Escape
- ✅ **Focus Indicators:** Viditelný focus outline (oranžový, 3px)
- ✅ **Color Contrast:** Min 4.5:1 (WCAG AA)
- ✅ **Screen Readers:** Error zprávy oznámeny, loading stav oznámen

---

## ⚡ Performance

### Cíle

- ✅ **Bundle size:** < 50KB celkem (HTML + CSS + JS)
- ✅ **First Contentful Paint:** < 1.5s
- ✅ **Time to Interactive:** < 3s
- ✅ **Lighthouse Score:** > 90

### Optimalizace

- ✅ Žádné externí dependencies
- ✅ Vanilla JavaScript
- ✅ Optimalizované fonty (font-display: swap)
- ✅ Defer JavaScript

---

## 🧪 Testování

### Funkční testy

- [ ] Všechna pole fungují
- [ ] Validace real-time funguje
- [ ] Validace před submitem funguje
- [ ] Error messages správně
- [ ] Auto-formátování telefonu
- [ ] Auto-formátování PSČ
- [ ] Date picker limituje správně
- [ ] Předvyplnění z URL funguje (readonly)
- [ ] Submit odesílá správný JSON
- [ ] Loading stav funguje
- [ ] Error handling funguje
- [ ] Success redirect funguje

### Responzivita

- [ ] Mobile 320px, 375px
- [ ] Tablet 768px
- [ ] Desktop 1024px+
- [ ] Touch targets min 44x44px

### Browsery

- [ ] Chrome, Firefox, Safari, Edge (aktuální)
- [ ] iOS Safari
- [ ] Chrome mobile (Android)

### Accessibility

- [ ] Keyboard navigation
- [ ] Screen reader test
- [ ] Color contrast check
- [ ] Focus indicators

### Performance

- [ ] PageSpeed Insights > 90
- [ ] Bundle size check
- [ ] No console errors

---

## 🐛 Troubleshooting

### Webhook nefunguje

- Zkontrolujte, že `CONFIG.WEBHOOK_URL` je správně nastaven
- Zkontrolujte konzoli prohlížeče (F12) pro chyby
- Ověřte, že Make.com scénář je aktivní

### Validace nefunguje

- Zkontrolujte, že všechny inputy mají správné `id` atributy
- Ověřte, že `script.js` je správně načten
- Zkontrolujte konzoli prohlížeče pro JavaScript chyby

### Předvyplnění produktu nefunguje

- Zkontrolujte URL parametr: `?product=Název produktu`
- Ověřte URL encoding (české znaky musí být zakódované)
- Zkontrolujte konzoli prohlížeče (logování v DEBUG módu)

### Success redirect nefunguje

- Zkontrolujte, že `success.html` existuje ve stejné složce
- Ověřte, že `CONFIG.SUCCESS_URL` je správně nastaven
- Zkontrolujte sessionStorage v DevTools

---

## 📞 Kontakt

**Yes.cz - váš energetický sklad**

- 📞 Telefon: [+420 608 887 277](tel:+420608887277)
- ✉️ Email: [info@yes.cz](mailto:info@yes.cz)
- 🌐 Web: [https://www.yes.cz](https://www.yes.cz)

---

## 📄 License

ISC

---

**Vytvořeno s ❤️ pro Yes.cz**
