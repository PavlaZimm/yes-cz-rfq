# RFQ Systém - Dokumentace a poznámky

## 📋 Přehled projektu

Systém pro RFQ (Request for Quote) - aukce nejnižší ceny pro web yes.cz.

**Technologie:**
- Next.js 14+ (App Router) + TypeScript
- Airtable jako databáze
- Make.com pro automatizaci
- Vercel pro hosting
- GitHub pro verzování

**Design:** Konzistentní s webem yes.cz

---

## 🎯 Postup implementace

### FÁZE 1: Setup a základní formulář
- [ ] Inicializace Next.js projektu
- [ ] Extrakce barev z yes.cz
- [ ] Setup Tailwind s yes.cz designem
- [ ] Airtable struktura
- [ ] Formulář "Poptat cenu"
- [ ] API endpointy

### FÁZE 2: Make.com integrace
- [ ] Webhooky
- [ ] E-mailové notifikace
- [ ] Magic linky

### FÁZE 3: Dodavatelský portál
- [ ] Magic link stránka
- [ ] Formulář pro nabídky

### FÁZE 4: Uzávěrka a výběr vítěze
- [ ] Cron job pro uzávěrku
- [ ] Logika výběru nejnižší ceny

### FÁZE 5: Zákaznický portál
- [ ] Sekce "Moje poptávky"
- [ ] Akceptace/odmítnutí nabídky

### FÁZE 6: Administrace
- [ ] Admin rozhraní
- [ ] Export do CSV

---

## 🎨 Design systém yes.cz

### Analýza webu yes.cz
- **URL:** https://www.yes.cz/cs/
- **Typ:** E-shop s fotovoltaickými panely a příslušenstvím
- **Téma:** Solární energie
- **Společnost:** Sparkinvest s.r.o. (česká společnost)
- **Důležité:** Na webu je již funkce "Aukční poptávka" - náš RFQ systém bude rozšířením této funkcionality

### Barvy (extrahováno ze screenshotu)

**Primární barvy:**
- **Hlavní modrá (Primary Brand Blue):** `#1e3a8a` nebo podobná tmavá modrá
  - Použití: Logo "yes.", hlavní nadpisy, tlačítka (např. "Prohlédnout produkty")
- **Akcentní oranžová (Accent Orange):** `#f97316` nebo podobná teplá oranžová
  - Použití: Logo ".cz", checkmark ikony, odkaz "Aukční poptávka", šipky, zvýraznění
- **Sekundární text/modrá-šedá:** `#64748b` nebo podobná světle modro-šedá
  - Použití: Slogan "your energy stock", sekundární text

**Neutrální barvy:**
- **Pozadí:** `#ffffff` (bílá)
- **Tmavá modrá/šedá (header bar):** `#1e293b` nebo podobná tmavá
  - Použití: Horní kontaktní lišta
- **Světle šedá:** `#f1f5f9` nebo podobná
  - Použití: Search bar pozadí, mapy

**Poznámka:** Přesné hex kódy budou upřesněny po extrakci z CSS nebo design manuálu. Výše uvedené jsou odhady na základě vizuální analýzy.

### Tailwind Config
- Custom barvy definované v `tailwind.config.ts`
- CSS variables v `app/globals.css`
- Konzistentní s yes.cz brandingem

---

## 🗄️ Airtable struktura

### Tabulky

1. **RFQ Requests** - Poptávky od zákazníků
2. **Products** - Produkty
3. **Suppliers** - Dodavatelé
4. **Product Suppliers** - Přiřazení dodavatelů k produktům
5. **Offers** - Nabídky od dodavatelů

*(Detailní struktura bude doplněna)*

---

## 🔗 Make.com scénáře

### Scénář 1: Nová poptávka
- Trigger: Webhook z Next.js
- Akce: 
  - Generování magic linků pro dodavatele
  - Odeslání e-mailů dodavatelům

### Scénář 2: Uzávěrka poptávky
- Trigger: Cron / naplánovaný
- Akce:
  - Výběr nejnižší ceny
  - Notifikace zákazníka a administrátora

### Scénář 3: Akceptace nabídky
- Trigger: Webhook z Next.js
- Akce:
  - Notifikace obchodníkovi

*(Detailní popis scénářů bude doplněn)*

---

## 📝 Rozhodnutí a poznámky

### 13.1.2025 - Úvodní setup a implementace
- ✅ Projekt inicializován (Next.js 16, TypeScript, Tailwind CSS)
- ✅ Design systém yes.cz integrován (barvy: modrá #1e3a8a, oranžová #f97316)
- ✅ Airtable API klient implementován (`lib/airtable.ts`)
- ✅ Make.com webhook helper vytvořen (`lib/make-webhook.ts`)
- ✅ Formulář "Poptat cenu" vytvořen (`components/forms/RequestQuoteForm.tsx`)
- ✅ API endpoint `/api/rfq` pro vytvoření poptávky
- ✅ Stránka produktu s formulářem (`app/products/[id]/page.tsx`)
- ✅ TypeScript typy definovány (`lib/types.ts`)

**Technické rozhodnutí:**
- Použití Next.js App Router pro moderní strukturu
- Airtable jako databáze (flexibilní, snadná správa)
- Make.com pro automatizaci e-mailů a workflow
- Tailwind CSS s custom barvami yes.cz

---

## 🐛 Known Issues

*(Bude doplňováno během vývoje)*

---

## ✅ TODO

- [x] Extrahovat barvy z yes.cz
- [ ] Vytvořit Airtable base s tabulkami
- [ ] Nastavit Make.com scénáře
- [x] Implementovat formuláře
- [ ] Dodavatelský portál (magic linky)
- [ ] Zákaznický portál (moje poptávky)
- [ ] Uzávěrka poptávek a výběr vítěze
- [ ] Testování

---

## 📚 API Endpoints

### `/api/rfq`
- `POST /api/rfq` - Vytvoření nové poptávky
  - Body: `RequestQuoteFormData`
  - Vrací: `{ success: true, request_number: string, rfq_id: string }`
  - Automaticky spouští Make.com webhook pro e-maily dodavatelům a zákazníkovi

### `/api/offers`
- `POST /api/offers` - Vytvoření/aktualizace nabídky (bude implementováno)
- `GET /api/offers?token=xxx` - Získání nabídky podle magic link tokenu (bude implementováno)

### `/api/webhooks`
- `POST /api/webhooks/make` - Webhook pro Make.com (bude implementováno)

---

## 🔐 Environment Variables

```env
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
MAKE_WEBHOOK_URL=
NEXT_PUBLIC_APP_URL=
```

---

*Tento soubor bude průběžně aktualizován během vývoje.*
