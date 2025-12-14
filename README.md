# F1 Data Scraper 🏎️

**Production-ready TypeScript scraper per dati Formula 1 usando OpenF1 API**

Sviluppato da **EAR LAB - Digital Solutions & AI Research**

---

## 🎯 Features

- ✅ **TypeScript completo** con types sicuri
- ✅ **Error handling robusto** con retry automatico
- ✅ **Rate limiting** e timeout management
- ✅ **Modular architecture** facilmente integrabile
- ✅ **Zero dipendenze esterne** (solo dev dependencies)
- ✅ **Production-ready** con logging e monitoring
- ✅ **OpenF1 API** - dati gratuiti e completi

---

## 📦 Installazione

```bash
# Installa dipendenze
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev
```

---

## 🚀 Quick Start

### Test delle API

```bash
npm run test
```

Questo comando esegue una suite di test che:
- Verifica connessione alle API OpenF1
- Recupera l'ultimo Gran Premio
- Mostra tutti i meetings 2025
- Visualizza risultati e classifiche

### Scraping Base

```bash
npm run scrape
```

Esegue lo scraper con configurazione di default:
- Ultimo Gran Premio
- Solo dati gara
- Output in `/data`

---

## 💻 Utilizzo come Modulo

### Esempio 1: Ultimo Gran Premio (Solo Risultati)

```typescript
import { F1Scraper } from './scraper.js';
import { FileUtils } from './utils.js';

const scraper = new F1Scraper();

const result = await scraper.scrapeLatestGrandPrix({
  sessionTypes: ['Race'],
  includeLaps: false,
  includeStints: false,
  includePits: false,
});

if (result.success) {
  await FileUtils.saveJson(result.data, './data/latest-gp.json');
  console.log('✅ Dati salvati!');
}
```

### Esempio 2: Dati Completi con Telemetria

```typescript
const result = await scraper.scrapeLatestGrandPrix({
  sessionTypes: ['Qualifying', 'Race'],
  includeLaps: true,        // Tutti i giri con tempi settore
  includeStints: true,      // Strategie gomme
  includePits: true,        // Pit stop
  includeRaceControl: true, // Messaggi direzione gara
});
```

### Esempio 3: Gran Premio Specifico

```typescript
const result = await scraper.scrapeGrandPrix(1257, {
  year: 2025,
  sessionTypes: ['Race'],
});
```

### Esempio 4: Stagione Completa

```typescript
const result = await scraper.scrapeSeason(2025, {
  sessionTypes: ['Qualifying', 'Race'],
  includeLaps: false,
});

// Salva tutti i GP in file separati
if (result.success) {
  for (const gp of result.data) {
    const filename = FileUtils.generateGPFilename(
      gp.meeting.meeting_name,
      gp.meeting.year
    );
    await FileUtils.saveJson(gp, `./data/${filename}`);
  }
}
```

---

## 🏗️ Architettura

```
src/
├── types.ts          # TypeScript types & interfaces
├── client.ts         # HTTP client con retry & error handling
├── service.ts        # Service layer per API calls
├── scraper.ts        # Orchestratore principale
├── utils.ts          # File utilities
├── index.ts          # Entry point & examples
└── test.ts           # Test suite
```

### Layers

1. **Client Layer** (`client.ts`)
   - HTTP requests con timeout
   - Retry automatico (3 tentativi)
   - Error handling completo
   - Rate limiting safe

2. **Service Layer** (`service.ts`)
   - Business logic
   - Data validation
   - API endpoint wrappers
   - Result formatting

3. **Scraper Layer** (`scraper.ts`)
   - Orchestrazione chiamate
   - Data aggregation
   - Configuration management

4. **Utils** (`utils.ts`)
   - File I/O
   - JSON formatting
   - Naming conventions

---

## 📊 Struttura Dati Output

```typescript
{
  "meeting": {
    "meeting_key": 1257,
    "meeting_name": "Abu Dhabi Grand Prix",
    "location": "Yas Marina",
    "country_name": "United Arab Emirates",
    "year": 2025,
    // ... altri campi
  },
  "sessions": {
    "race": {
      "session": { /* session info */ },
      "drivers": [ /* array piloti */ ],
      "results": [ /* classifica finale */ ],
      "laps": [ /* tutti i giri */ ],
      "stints": [ /* strategie gomme */ ],
      "pits": [ /* pit stops */ ],
      "starting_grid": [ /* griglia partenza */ ]
    },
    "qualifying": { /* ... */ }
  },
  "metadata": {
    "scraped_at": "2025-12-14T10:30:00Z",
    "season": 2025,
    "round": 24
  }
}
```

---

## ⚙️ Configurazione

### ScraperConfig

```typescript
interface ScraperConfig {
  year?: number;                    // Anno stagione
  meetingKey?: number | 'latest';   // Meeting specifico
  sessionTypes?: SessionType[];     // Quali sessioni scaricare
  includeLaps?: boolean;            // Include giri (pesante!)
  includeStints?: boolean;          // Include stint gomme
  includePits?: boolean;            // Include pit stops
  includeRaceControl?: boolean;     // Include messaggi gara
  outputPath?: string;              // Path output custom
}
```

### Session Types

```typescript
type SessionType = 
  | 'Practice 1' 
  | 'Practice 2' 
  | 'Practice 3' 
  | 'Qualifying' 
  | 'Sprint' 
  | 'Race';
```

---

## 🛡️ Error Handling

Tutti i metodi restituiscono `ScraperResult<T>`:

```typescript
interface ScraperResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}
```

### Error Codes

- `BAD_REQUEST` - Parametri non validi
- `NOT_FOUND` - Risorsa non trovata
- `RATE_LIMIT` - Troppe richieste
- `TIMEOUT` - Timeout richiesta
- `NETWORK_ERROR` - Errore connessione
- `SERVER_ERROR` - Errore server OpenF1
- `NO_DATA` - Nessun dato disponibile

### Esempio Error Handling

```typescript
const result = await scraper.scrapeLatestGrandPrix();

if (result.success) {
  console.log('✅ Dati:', result.data);
} else {
  switch (result.error.code) {
    case 'NOT_FOUND':
      console.log('Nessun GP recente');
      break;
    case 'NETWORK_ERROR':
      console.log('Problema di connessione');
      break;
    default:
      console.error('Errore:', result.error.message);
  }
}
```

---

## 🔄 Integrazione PWA React

### Setup

```typescript
// api/scraper.ts
import { F1Scraper, FileUtils } from 'f1-data-scraper';

export async function getLatestGP() {
  const scraper = new F1Scraper();
  return await scraper.scrapeLatestGrandPrix({
    sessionTypes: ['Race'],
  });
}
```

### React Hook Example

```typescript
// hooks/useF1Data.ts
import { useState, useEffect } from 'react';

export function useF1Data() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/latest-gp.json')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  return { data, loading };
}
```

---

## 📝 Best Practices

### Performance

- ✅ **Usa `includeLaps: false`** se non servono dati dettagliati giri
- ✅ **Filtra `sessionTypes`** per ridurre chiamate API
- ✅ **Cache dei risultati** in localStorage
- ✅ **Batch requests** per stagioni complete

### Production

- ✅ **Gestisci sempre errori** con try-catch
- ✅ **Valida risultati** prima di usarli
- ✅ **Log appropriati** per debugging
- ✅ **Rate limiting** se usi in loop

---

## 🔮 Roadmap Integration

Questo scraper è pronto per:

- ✅ **GitHub Actions** - Scheduling automatico
- ✅ **Vercel Functions** - Serverless deployment
- ✅ **Cloudflare Workers** - Edge computing
- ✅ **React PWA** - Frontend integration

---

## 📄 License

MIT - EAR LAB

---

## 🙏 Credits

- **OpenF1 API** - https://openf1.org
- **EAR LAB** - Digital Solutions & AI Research

---

## 🆘 Support

Per problemi o domande:
1. Controlla gli esempi in `src/index.ts`
2. Esegui `npm run test` per diagnostica
3. Verifica error codes nel result

---

**Made with ❤️ by EAR LAB**
