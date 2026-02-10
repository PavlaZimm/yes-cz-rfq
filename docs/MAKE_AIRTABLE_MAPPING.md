# 🗄️ Mapování dat z Make.com do Airtable - Detailní návod

## 📋 Přehled

Tento návod ti ukáže přesně, jak mapovat data z webhooku do Airtable tabulky **POPTÁVKY**.

---

## 🎯 KROK 1: Přidání Airtable modulu

### 1.1 Přidej modul do scénáře

1. V Make.com scénáři klikni **"Add a module"** (za webhookem)
2. Vyber **"Airtable"** → **"Create a record"**
3. Pokud ještě nemáš připojený Airtable:
   - Klikni **"Add a connection"**
   - Přihlas se k Airtable
   - Povol přístup k Base "RFQ Yes.cz"
4. Klikni **"Continue"**

---

## 🗂️ KROK 2: Výběr Base a Table

### 2.1 Nastavení

1. **Base:** Vyber "RFQ Yes.cz" (nebo jak jsi pojmenoval/a Base)
2. **Table:** Vyber "POPTÁVKY"
3. Klikni **"Continue"**

---

## 📝 KROK 3: Mapování polí

### 3.1 Základní pole

V Make.com uvidíš seznam všech polí z tabulky POPTÁVKY. Mapuj je takto:

#### ✅ Pole, která se mapují přímo z webhooku:

| Airtable pole | Make.com hodnota | Poznámka |
|--------------|------------------|----------|
| **Zákazník jméno** | `{{1.zakaznik_jmeno}}` | Text |
| **Zákazník email** | `{{1.zakaznik_email}}` | Email |
| **Zákazník telefon** | `{{1.zakaznik_telefon}}` | Phone (formát: 420123456789) |
| **Množství** | `{{1.mnozstvi}}` | Number |
| **PSČ dodání** | `{{1.psc_dodani}}` | Text (5 číslic, např. "12000") |
| **Požadovaný termín** | `{{1.pozadovany_termin}}` | Date (formát: YYYY-MM-DD) |

#### ⚠️ Pole, která potřebují výpočet:

| Airtable pole | Jak nastavit | Poznámka |
|--------------|--------------|----------|
| **Stav** | `Nová` | Pevná hodnota (text) |
| **Uzávěrka** | *(vypočítat)* | Viz krok 4 níže |

#### ⏭️ Pole, která zatím necháme prázdná:

- **Produkt** (Link) - přidáme později, až budeš mít tabulku PRODUKTY
- **Vítězná nabídka** (Link) - přidáme později
- **ID poptávky** - automatické (Autonumber)
- **Datum vytvoření** - automatické (Created time)

---

## 🧮 KROK 4: Výpočet uzávěrky (+7 dní)

Uzávěrka = Požadovaný termín + 7 dní

### Varianta A: Použít Tools modul (doporučeno)

1. **Před Airtable modulem** přidej modul: **"Tools"** → **"Set variable"**
2. Nastav:
   - **Variable name:** `uzavěrka`
   - **Variable value:** Použij **"Date/Time"** → **"Add time to date"**
     - **Date:** `{{1.pozadovany_termin}}`
     - **Time to add:** `7 days`
3. V Airtable pak použij: `{{uzavěrka}}`

### Varianta B: Použít přímo v Airtable (pokud Make.com podporuje)

V Airtable modulu u pole "Uzávěrka":
- Použij funkci: `{{addDays(1.pozadovany_termin, 7)}}`
- Nebo: `{{1.pozadovany_termin}} + 7 days`

**⚠️ POZOR:** Pokud Make.com nepodporuje přímý výpočet, použij Variantu A.

---

## 📋 KROK 5: Kompletní mapování - Krok za krokem

### 5.1 V Make.com Airtable modulu:

1. **Zákazník jméno:**
   - Klikni na pole
   - Vyber `{{1.zakaznik_jmeno}}` z webhooku
   - Nebo napiš: `{{1.zakaznik_jmeno}}`

2. **Zákazník email:**
   - Klikni na pole
   - Vyber `{{1.zakaznik_email}}`
   - Nebo napiš: `{{1.zakaznik_email}}`

3. **Zákazník telefon:**
   - Klikni na pole
   - Vyber `{{1.zakaznik_telefon}}`
   - Formát už je správný (420123456789)

4. **Množství:**
   - Klikni na pole
   - Vyber `{{1.mnozstvi}}`
   - Ujisti se, že je to číslo (Number)

5. **PSČ dodání:**
   - Klikni na pole
   - Vyber `{{1.psc_dodani}}`
   - Formát už je správný (5 číslic, např. "12000")

6. **Požadovaný termín:**
   - Klikni na pole
   - Vyber `{{1.pozadovany_termin}}`
   - Formát: YYYY-MM-DD (např. "2026-02-15")

7. **Stav:**
   - Klikni na pole
   - Napiš přímo: `Nová`
   - Nebo vyber z dropdownu (pokud máš Single select)

8. **Uzávěrka:**
   - Pokud máš Tools modul s proměnnou `uzavěrka`:
     - Klikni na pole
     - Vyber `{{uzavěrka}}`
   - Nebo použij výpočet přímo (pokud Make.com podporuje)

---

## ✅ KROK 6: Kontrola a uložení

### 6.1 Zkontroluj mapování

- ✅ Všechna pole jsou správně mapovaná
- ✅ Formáty dat odpovídají (Date, Number, Text)
- ✅ Uzávěrka je vypočítaná (+7 dní)

### 6.2 Uložení

1. Klikni **"OK"** nebo **"Save"** v Airtable modulu
2. Klikni **"Save"** v celém scénáři (vpravo nahoře)

---

## 🧪 KROK 7: Testování

### 7.1 Aktivace scénáře

1. Ujisti se, že scénář je **aktivní** (přepínač vpravo nahoře)
2. Pokud není, klikni na **"Inactive"** → **"Active"**

### 7.2 Test formuláře

1. Otevři formulář (lokálně nebo na Vercel)
2. Vyplň všechna pole:
   - Jméno: "Test Uživatel"
   - Email: "test@example.cz"
   - Telefon: "+420 123 456 789"
   - Produkt: "Test produkt"
   - Množství: 10
   - PSČ: "120 00"
   - Termín: zítřejší datum
3. Klikni "Odeslat poptávku"

### 7.3 Kontrola výsledků

1. **V Make.com:**
   - Jdi do **"Execution history"**
   - Měl by se zobrazit nový běh scénáře
   - Klikni na něj a zkontroluj, že Airtable modul proběhl úspěšně

2. **V Airtable:**
   - Otevři Base "RFQ Yes.cz"
   - Otevři tabulku "POPTÁVKY"
   - Měl by se vytvořit nový záznam s:
     - ✅ Zákazník jméno: "Test Uživatel"
     - ✅ Zákazník email: "test@example.cz"
     - ✅ Zákazník telefon: "420123456789"
     - ✅ Množství: 10
     - ✅ PSČ dodání: "12000"
     - ✅ Požadovaný termín: zítřejší datum
     - ✅ Stav: "Nová"
     - ✅ Uzávěrka: požadovaný termín + 7 dní
     - ✅ ID poptávky: automatické číslo
     - ✅ Datum vytvoření: dnešní datum a čas

---

## 🐛 Řešení problémů

### Problém: Data se neukládají do Airtable

**Možné příčiny:**
1. ❌ Špatné mapování polí
   - **Řešení:** Zkontroluj názvy polí - musí přesně odpovídat názvům v Airtable

2. ❌ Špatný formát dat
   - **Řešení:** 
     - Datum musí být YYYY-MM-DD
     - Telefon musí být jen číslice
     - PSČ musí být 5 číslic

3. ❌ Chybějící oprávnění
   - **Řešení:** Zkontroluj, že Make.com má přístup k Airtable Base

4. ❌ Chyba v Make.com
   - **Řešení:** Zkontroluj "Execution history" - uvidíš přesnou chybu

### Problém: Uzávěrka není správně vypočítaná

**Možné příčiny:**
1. ❌ Tools modul není správně nastavený
   - **Řešení:** Zkontroluj, že proměnná `uzavěrka` obsahuje správný výpočet

2. ❌ Špatný formát data
   - **Řešení:** Ujisti se, že `{{1.pozadovany_termin}}` je ve formátu YYYY-MM-DD

### Problém: Některá pole jsou prázdná

**Možné příčiny:**
1. ❌ Webhook neposílá všechna data
   - **Řešení:** Zkontroluj v "Execution history" - jaká data přišla z webhooku

2. ❌ Špatné mapování
   - **Řešení:** Zkontroluj, že používáš správné názvy z webhooku (`{{1.zakaznik_jmeno}}`, atd.)

---

## 📊 Formát dat z webhooku

Formulář odesílá tato data do Make.com:

```json
{
  "timestamp": "2026-01-14T14:30:00.000Z",
  "znacka": "Huawei",
  "specifikace": "Panel XYZ 400W - 50 ks\nPanel ABC 500W - 30 ks\nStřídač DEF 10kW - 5 ks",
  "zakaznik_jmeno": "Jan Novák",
  "zakaznik_email": "jan.novak@email.cz",
  "zakaznik_telefon": "420123456789",
  "mnozstvi": 85,
  "psc_dodani": "12000",
  "pozadovany_termin": "2026-02-15",
  "poznamka": "Preferuji dodání na jednu adresu",
  "formular_url": "https://rfq.yes.cz",
  "user_agent": "Mozilla/5.0..."
}
```

V Make.com k těmto datům přistupujete jako:
- `{{1.znacka}}` - značka (brand) - vybraná z dropdown seznamu
- `{{1.specifikace}}` - specifikace produktů (víceřádkový text)
- `{{1.zakaznik_jmeno}}` - jméno zákazníka
- `{{1.zakaznik_email}}` - email zákazníka
- `{{1.zakaznik_telefon}}` - telefon zákazníka
- `{{1.mnozstvi}}` - celkové množství
- `{{1.psc_dodani}}` - PSČ
- `{{1.pozadovany_termin}}` - termín dodání
- `{{1.poznamka}}` - poznámka (volitelné)

**Poznámka:** Pole `produkt` bylo nahrazeno dvojicí `znacka` + `specifikace`. V Airtable je třeba přidat odpovídající sloupce.

---

## ✅ Checklist před testováním

- [ ] Airtable modul je přidaný do scénáře
- [ ] Base "RFQ Yes.cz" je vybraná
- [ ] Table "POPTÁVKY" je vybraná
- [ ] Všechna pole jsou správně mapovaná
- [ ] Uzávěrka je vypočítaná (+7 dní)
- [ ] Stav je nastaven na "Nová"
- [ ] Scénář je uložený
- [ ] Scénář je aktivní (zapnutý)

---

**Potřebuješ pomoc?** Zkontroluj "Execution history" v Make.com - tam uvidíš přesně, co se stalo a kde je problém.
