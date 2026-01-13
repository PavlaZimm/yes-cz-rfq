# RFQ Systém - Yes.cz

Systém pro RFQ (Request for Quote) - aukce nejnižší ceny pro web yes.cz.

## 🚀 Technologie

- **Next.js 14+** (App Router) + TypeScript
- **Tailwind CSS** s design systémem yes.cz
- **Airtable** jako databáze
- **Make.com** pro automatizaci
- **Vercel** pro hosting

## 📦 Instalace

```bash
npm install
```

## 🔧 Setup

1. Zkopírujte `.env.example` na `.env.local`
2. Vyplňte Airtable API klíče a Base ID
3. Nastavte Make.com webhook URL

## 🏃 Spuštění

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## 📁 Struktura projektu

```
/app              # Next.js App Router
  /api            # API routes
  /(customer)     # Zákaznické stránky
  /(supplier)     # Dodavatelský portál
/lib              # Utility funkce (Airtable, Make.com)
/components       # React komponenty
```

## 🎨 Design systém

Barvy yes.cz:
- Hlavní modrá: `#1e3a8a`
- Akcentní oranžová: `#f97316`
- Text šedá: `#64748b`
- Tmavá: `#1e293b`

## 📚 Dokumentace

Více informací najdete v [SUMMARY.md](./SUMMARY.md)

## 📝 License

ISC
