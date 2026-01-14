# Použití RFQ formuláře - Příklady

## 🔗 Různé způsoby, jak načíst produkt

Formulář automaticky načte produkt z URL několika způsoby:

### 1. URL parametry (nejjednodušší)

```
index.html?productId=FVE-400W-001&productName=Fotovoltaický panel 400W
```

### 2. Pouze ID produktu

```
index.html?productId=FVE-400W-001
```

Název se buď načte z API, nebo se použije default.

### 3. Z cesty URL

```
/FVE-400W-001
nebo
/product/FVE-400W-001
```

### 4. Z hash (#)

```
index.html#FVE-400W-001
```

### 5. Zkrácené parametry

```
index.html?id=FVE-400W-001&name=Fotovoltaický panel 400W
nebo
index.html?p=FVE-400W-001&n=Fotovoltaický panel 400W
```

## 📝 Příklady použití

### Příklad 1: Základní link s produktem

```html
<a href="index.html?productId=FVE-400W-001&productName=Fotovoltaický panel 400W">
    Poptat cenu pro FVE-400W-001
</a>
```

### Příklad 2: Link z e-shopu

```html
<a href="index.html?productId=<?php echo $product->id; ?>&productName=<?php echo urlencode($product->name); ?>">
    Poptat cenu
</a>
```

### Příklad 3: JavaScript redirect

```javascript
const productId = 'FVE-400W-001';
const productName = 'Fotovoltaický panel 400W';
window.location.href = `index.html?productId=${productId}&productName=${encodeURIComponent(productName)}`;
```

### Příklad 4: Make.com webhook link

Když Make.com pošle e-mail dodavateli, může obsahovat link:

```
https://yes.cz/rfq/index.html?productId=FVE-400W-001&productName=Fotovoltaický panel 400W
```

## 🔄 Automatické načítání z API

Pokud máte API endpoint `/api/products`, formulář automaticky zkusí načíst produkt:

```javascript
// API by mělo vracet:
{
  "success": true,
  "product": {
    "id": "rec123",
    "product_id": "FVE-400W-001",
    "name": "Fotovoltaický panel 400W",
    "description": "Monokrystalický panel s vysokou účinností..."
  }
}
```

## 📊 Tracking

Formulář automaticky loguje načtení produktu do konzole:

```javascript
console.log('📦 Produkt načten:', { id, name, data });
```

Pokud máte Google Analytics, automaticky se pošle event:

```javascript
gtag('event', 'product_view', {
    'product_id': id,
    'product_name': name
});
```

## 🎯 Best Practices

1. **Vždy používejte URL parametry** - nejspolehlivější způsob
2. **Kódujte názvy produktů** - použijte `encodeURIComponent()` pro názvy s mezerami
3. **Použijte productId** - pokud máte, vždy ho předejte
4. **Fallback hodnoty** - formulář má default hodnoty, pokud nic nenajde

## 🔧 Přizpůsobení

Můžete změnit default hodnoty v `src/js/script.js`:

```javascript
// Fallback na default
if (!productId) {
    productId = 'FVE-400W-001'; // Změňte na váš default produkt
}
```
