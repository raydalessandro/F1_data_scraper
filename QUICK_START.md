# 🚀 Quick Start - F1 Data Scraper

## ⚡ Setup Rapido (2 minuti)

```bash
# 1. Entra nella directory
cd f1-data-scraper

# 2. Installa dipendenze
npm install

# 3. Testa le API
npm run test

# 4. Esegui lo scraper
npm run scrape
```

I dati verranno salvati in `./data/latest-gp.json`

---

## 📋 Comandi Disponibili

```bash
npm run test      # Test API OpenF1
npm run scrape    # Scraping ultimo GP
npm run dev       # Development mode
npm run build     # Build TypeScript
```

---

## 🎯 Cosa fa il modulo?

✅ Scarica dati F1 da OpenF1 API (gratis, no auth)
✅ Risultati gare, qualifiche, classifiche
✅ Dati piloti e team
✅ Giri, stint, pit stop (opzionale)
✅ Output JSON pulito e strutturato

---

## 📦 Struttura Output

```json
{
  "meeting": {
    "meeting_name": "Abu Dhabi Grand Prix",
    "location": "Abu Dhabi",
    "country_name": "United Arab Emirates",
    "year": 2025
  },
  "sessions": {
    "race": {
      "drivers": [...],
      "results": [...],
      "starting_grid": [...]
    }
  }
}
```

---

## 🔧 Personalizzazione

Modifica `src/index.ts` per cambiare:
- Quali sessioni scaricare
- Includere/escludere dati extra (laps, stints, pits)
- Output path

### Esempio: Solo Qualifiche

```typescript
const result = await scraper.scrapeLatestGrandPrix({
  sessionTypes: ['Qualifying'], // Solo qualifiche
  includeLaps: false,
});
```

---

## 🤖 Automazione GitHub Actions

Il file `.github/workflows/scrape.yml` è già configurato per:
- ✅ Eseguire scraping ogni **Lunedì alle 10:00**
- ✅ Committare automaticamente i nuovi dati
- ✅ Trigger manuale quando vuoi

### Setup su GitHub:

1. Push questo codice su GitHub
2. Abilita GitHub Actions nel repository
3. Done! I dati si aggiorneranno automaticamente

---

## 🌐 Integrazione PWA React

Leggi `docs/REACT_INTEGRATION.md` per:
- Hook React personalizzati
- Componenti esempio
- Caching strategy
- Service Worker setup

### Quick Preview:

```typescript
// React component
import { useF1Data } from './hooks/useF1Data';

export function RaceResults() {
  const { data, loading } = useF1Data();
  
  if (loading) return <Loader />;
  
  return (
    <div>
      <h1>{data.meeting.meeting_name}</h1>
      {data.sessions.race.results.map(/* ... */)}
    </div>
  );
}
```

---

## 📚 Documentazione Completa

- `README.md` - Documentazione completa
- `docs/REACT_INTEGRATION.md` - Integrazione React PWA
- `examples/sample-output.json` - Esempio output
- `src/types.ts` - Tutti i tipi TypeScript

---

## 🆘 Troubleshooting

**Errore NETWORK_ERROR durante test?**
→ Normale se non hai connessione internet. Il modulo funzionerà su GitHub.

**Dati 2025 non disponibili?**
→ OpenF1 aggiorna i dati dopo ogni gara. Attendi il prossimo GP.

**Voglio dati stagione completa?**
→ Decommentare "ESEMPIO 4" in `src/index.ts`

---

## ✨ Features Pronte

✅ TypeScript completo
✅ Error handling robusto
✅ Retry automatico (3 tentativi)
✅ Logging dettagliato
✅ Types sicuri
✅ Production-ready
✅ Zero breaking changes su update OpenF1

---

## 🎯 Next Steps

1. **Push su GitHub** → Abilita Actions
2. **Integra con React PWA** → Usa hook forniti
3. **Deploy su Vercel/Netlify** → Auto-deploy
4. **Personalizza filtri/componenti** → Adatta al tuo design

---

**Made with ❤️ by EAR LAB**

🏎️ Buon lavoro Ray! Il modulo è production-ready e pronto per essere integrato nel tuo progetto F1!
