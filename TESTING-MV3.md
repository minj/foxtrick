# Testing Foxtrick Manifest V3

## Quick Test - Extension Caricabile in Chrome

### Pre-requisiti
- ✅ npm dependencies installate (`npm install`)
- ✅ Bundle generato (`npm run build:background`)
- ✅ Chrome 88+ installato

### Passi per il Test

#### 1. Verifica File Bundle
```bash
# Verifica che il bundle esista
ls -lh content/background-bundle.js

# Output atteso: ~1.2MB file
```

#### 2. Carica Extension in Chrome

1. Apri Chrome e vai su: `chrome://extensions/`
2. Abilita **"Developer mode"** (angolo in alto a destra)
3. Click su **"Load unpacked"**
4. Seleziona la directory: `/Users/carlogiuseppesergi/Projects/foxtrick/`
5. Assicurati che Chrome carichi `manifest-v3.json` (non `manifest.json`)

#### 3. Verifica Caricamento Extension

**Indicatori di Successo**:
- ✅ Extension appare nella lista con icona Foxtrick
- ✅ Nessun errore rosso visibile
- ✅ Stato: **Enabled**
- ✅ Version: **0.17.9**

**Se Vedi Errori**:
- Click su "Errors" per dettagli
- Controlla console service worker

#### 4. Verifica Service Worker

1. Nella card Foxtrick, cerca link **"service worker"**
2. Click sul link → si apre DevTools per service worker
3. Nella console, verifica:
   - Nessun errore rosso
   - Possibili warning gialli (ok per ora)
   - Messaggi di log Foxtrick (se presenti)

**Console Output Atteso**:
```
Foxtrick.loader.background.browserLoad
Inizializzazione moduli...
[possibili warning su alcuni moduli]
```

#### 5. Test Funzionalità Base

**Test 1: Icona Extension**
- L'icona Foxtrick dovrebbe apparire nella toolbar
- Click sull'icona → dovrebbe aprire popup (se configurato)

**Test 2: Context Menu** (su pagina Hattrick)
- Vai su https://www.hattrick.org
- Right-click su pagina
- Verifica se appaiono voci menu Foxtrick

**Test 3: Content Scripts**
- Apri DevTools su tab Hattrick
- Console dovrebbe mostrare log Foxtrick (se abilitati)

## Test Avanzati

### Test Service Worker Lifecycle

#### Test Termination/Restart
1. In `chrome://serviceworker-internals/`
2. Trova il service worker Foxtrick
3. Click **"Stop"**
4. Ricarica pagina Hattrick
5. Verifica che service worker si riattivi automaticamente

**Comportamento Atteso**:
- Service worker si riavvia
- Extension continua a funzionare
- Nessun errore in console

### Test Storage API

```javascript
// In service worker console
chrome.storage.local.get(null, (items) => {
  console.log('Storage items:', items);
});
```

**Verifica**:
- Nessun errore
- Items contiene preferenze Foxtrick
- No localStorage references (MV3 compliant)

### Test Messaging

```javascript
// In content script (tab Hattrick console)
chrome.runtime.sendMessage({req: 'pageLoad'}, (response) => {
  console.log('Response:', response);
});
```

**Comportamento Atteso**:
- Risposta ricevuta dal service worker
- Contiene dati: prefsChromeDefault, prefsChromeUser, etc.

## Problemi Comuni e Soluzioni

### Errore: "Service worker registration failed"

**Causa**: Errore di syntax nel bundle

**Debug**:
```bash
# Rebuild bundle in dev mode (più readable)
npm run build:background:dev

# Controlla errori nel file generato
```

**Soluzione**:
- Verifica errori in console
- Controlla source maps
- Potrebbe servire fix in file specifico

### Errore: "Module not found"

**Causa**: Path import sbagliato in background-entry.js

**Verifica**:
```bash
# Controlla che tutti i file esistano
ls content/env.js content/core.js content/background.js
```

**Soluzione**:
- Verifica paths in `background-entry.js`
- Rebuild: `npm run build:background`

### Warning: "Bundle size exceeded"

**Causa**: Bundle 1.2MB > limite 1MB raccomandato

**Stato**: ⚠️ OK per ora (warning, non errore)

**Ottimizzazione Futura**:
- Code splitting
- Tree shaking più aggressivo
- Rimuovere moduli inutilizzati

### Extension Non Si Carica

**Checklist**:
1. ✅ Chrome 88+ ?
2. ✅ Developer mode abilitato?
3. ✅ File `manifest-v3.json` esiste?
4. ✅ Bundle `content/background-bundle.js` esiste?
5. ✅ Nessun errore syntax in manifest?

**Debug**:
```bash
# Valida JSON manifest
cat manifest-v3.json | jq .

# Se comando non trovato, installa jq:
# brew install jq
```

### Service Worker Non Si Attiva

**Cause Possibili**:
1. Errore JavaScript nel bundle
2. Listener non registrati at top-level
3. Uso API non disponibili in service worker

**Debug Steps**:
1. Apri `chrome://serviceworker-internals/`
2. Cerca Foxtrick
3. Leggi messaggio errore
4. Fix issue specifico
5. Reload extension

## Test su Hattrick Live

### Pre-requisiti
- Account Hattrick attivo
- Extension caricata e funzionante

### Test Plan

#### 1. Login Hattrick
- Vai su https://www.hattrick.org
- Login con account
- Verifica che extension si attivi

#### 2. Verifica Moduli Caricati
```javascript
// Console tab Hattrick
console.log('Foxtrick modules:', Foxtrick.modules);
console.log('Foxtrick version:', Foxtrick.version);
```

#### 3. Test Feature Specifiche

**Test Link Enhancement**:
- Apri pagina giocatore
- Verifica link esterni aggiunti da Foxtrick

**Test Forum Features**:
- Apri forum Hattrick
- Verifica features Foxtrick (templates, preview, etc.)

**Test Match Analysis**:
- Apri report partita
- Verifica statistiche aggiuntive Foxtrick

## Performance Testing

### Misura Tempo Caricamento

```javascript
// In service worker console
console.time('Module init');
// Reload extension
console.timeEnd('Module init');
```

**Target**: <2 secondi per init completa

### Memory Usage

1. Apri `chrome://extensions/`
2. Click "Details" su Foxtrick
3. Scroll → "Inspect views: service worker"
4. DevTools → Memory tab
5. Take snapshot
6. Verifica memory usage

**Target**: <50MB per service worker

## Checklist Completa MV3

### Manifest V3 Compliance
- ✅ `manifest_version: 3`
- ✅ `background.service_worker` defined
- ✅ `action` API (non `page_action`)
- ✅ `web_accessible_resources` formato oggetto
- ✅ `host_permissions` separato da `permissions`

### Service Worker Compatibility
- ✅ No `document` o `window` references
- ✅ No `localStorage` usage
- ✅ OffscreenCanvas per canvas operations
- ✅ chrome.storage.local per storage
- ✅ Event listeners at top-level

### API Migrations
- ✅ `chrome.action` (non `pageAction`)
- ✅ Context menus con eventi (non `onclick`)
- ✅ Callbacks → Promises dove possibile

## Prossimi Passi

### Immediate
1. ✅ Test caricamento extension
2. ⏳ Fix errori critici (se presenti)
3. ⏳ Test su pagine Hattrick reali
4. ⏳ Verifica tutti i 150+ moduli

### Short Term
1. Performance optimization
2. Bundle size reduction
3. Error handling improvement
4. User feedback collection

### Long Term
1. Automated testing suite
2. CI/CD per build MV3
3. Release beta per utenti
4. Migration plan per utenti MV2

## Reporting Issues

Se trovi problemi durante il testing:

1. **Documenta**:
   - Chrome version
   - Errore completo (screenshot)
   - Steps to reproduce
   - Console logs

2. **Debug**:
   - Source maps in DevTools
   - Network tab per API calls
   - Service worker internals

3. **Report**:
   - GitHub issue
   - Include info punto 1
   - Label: `mv3-migration`

## Success Criteria

Extension considerata **funzionante** quando:
- ✅ Si carica senza errori
- ✅ Service worker si attiva
- ✅ Icona appare in toolbar
- ✅ Funzionalità base funzionano su Hattrick
- ✅ No errori console critici
- ✅ Storage operations funzionano
- ✅ Messaging background ↔ content funziona

---

**Ultima Build**: 11 Novembre 2025
**Bundle Size**: 1.2MB
**Chrome Minimo**: 88
**Status**: Ready for Testing 🚀
