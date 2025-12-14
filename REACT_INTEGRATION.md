# Integrazione React PWA

Guida passo-passo per integrare F1 Data Scraper nella tua PWA React.

## Architettura Consigliata

```
GitHub Repository
├── /scraper (questo modulo)
├── /pwa (React app)
├── /data
│   └── latest-gp.json (aggiornato da GitHub Actions)
└── .github/workflows/scrape.yml
```

---

## Setup 1: Repository Structure

```bash
# Struttura finale
your-f1-app/
├── scraper/           # Modulo scraper (questa cartella)
├── pwa/              # React PWA
│   ├── src/
│   ├── public/
│   └── package.json
├── data/             # Dati F1 (generati da scraper)
└── .github/workflows/
```

---

## Setup 2: React Hooks

### `hooks/useF1Data.ts`

```typescript
import { useState, useEffect } from 'react';
import type { GrandPrixData } from '../types/f1';

export function useF1Data() {
  const [data, setData] = useState<GrandPrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch da GitHub raw o dal tuo CDN
    const dataUrl = '/data/latest-gp.json';
    
    fetch(dataUrl)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setData(data);
        
        // Cache in localStorage
        localStorage.setItem('f1-data', JSON.stringify(data));
        localStorage.setItem('f1-data-timestamp', Date.now().toString());
      })
      .catch(err => {
        setError(err.message);
        
        // Fallback a cache
        const cached = localStorage.getItem('f1-data');
        if (cached) {
          setData(JSON.parse(cached));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
```

---

## Setup 3: Componenti React

### `components/RaceResults.tsx`

```typescript
import { useF1Data } from '../hooks/useF1Data';

export function RaceResults() {
  const { data, loading, error } = useF1Data();

  if (loading) return <div>Caricamento...</div>;
  if (error) return <div>Errore: {error}</div>;
  if (!data) return <div>Nessun dato</div>;

  const race = data.sessions.race;
  if (!race) return <div>Gara non disponibile</div>;

  // Ordina risultati per posizione
  const results = [...race.results].sort((a, b) => a.position - b.position);

  return (
    <div>
      <h1>{data.meeting.meeting_name}</h1>
      <h2>{data.meeting.location}, {data.meeting.country_name}</h2>
      
      <div className="results">
        {results.map(result => {
          const driver = race.drivers.find(
            d => d.driver_number === result.driver_number
          );
          
          return (
            <div key={result.driver_number} className="result-row">
              <span className="position">{result.position}</span>
              <span className="driver">{driver?.full_name}</span>
              <span className="team">{driver?.team_name}</span>
              <span className="gap">
                {typeof result.gap_to_leader === 'number' 
                  ? `+${result.gap_to_leader.toFixed(3)}s`
                  : result.gap_to_leader
                }
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### `components/RaceFilters.tsx`

```typescript
import { useState } from 'react';
import type { GrandPrixData } from '../types/f1';

interface Props {
  data: GrandPrixData;
}

export function RaceFilters({ data }: Props) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const race = data.sessions.race;
  if (!race) return null;

  // Estrai team unici
  const teams = [...new Set(race.drivers.map(d => d.team_name))];

  // Filtra risultati
  const filteredResults = selectedTeam
    ? race.results.filter(r => {
        const driver = race.drivers.find(d => d.driver_number === r.driver_number);
        return driver?.team_name === selectedTeam;
      })
    : race.results;

  return (
    <div>
      <select onChange={(e) => setSelectedTeam(e.target.value || null)}>
        <option value="">Tutti i team</option>
        {teams.map(team => (
          <option key={team} value={team}>{team}</option>
        ))}
      </select>

      {/* Mostra risultati filtrati */}
      <div>
        {filteredResults.map(/* ... */)}
      </div>
    </div>
  );
}
```

---

## Setup 4: Deploy Workflow

### Vercel / Netlify

1. **Build command**: `cd pwa && npm run build`
2. **Output directory**: `pwa/dist`
3. **Auto-deploy**: Ogni push su `main`

Il workflow GitHub Actions aggiornerà automaticamente i dati, Vercel/Netlify rebuilderà la PWA.

---

## Setup 5: Caching Strategy

### Service Worker (PWA)

```typescript
// pwa/src/sw.ts
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Cache F1 data per 1 ora
  if (url.pathname.includes('/data/latest-gp.json')) {
    event.respondWith(
      caches.open('f1-data-v1').then(cache => {
        return cache.match(event.request).then(cached => {
          const fetchPromise = fetch(event.request).then(response => {
            cache.put(event.request, response.clone());
            return response;
          });
          
          return cached || fetchPromise;
        });
      })
    );
  }
});
```

---

## Setup 6: Real-time Updates (Opzionale)

Se vuoi check automatici per nuovi dati:

```typescript
// hooks/useAutoRefresh.ts
export function useAutoRefresh(intervalMs = 60000) {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const cached = localStorage.getItem('f1-data-timestamp');
      if (cached && Date.now() - parseInt(cached) > intervalMs) {
        // Trigger re-fetch
        setLastUpdate(Date.now());
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return lastUpdate;
}
```

---

## Best Practices

✅ **Cache localStorage** - Fallback se fetch fallisce
✅ **Service Worker** - Offline support
✅ **Auto-refresh** - Check periodico nuovi dati
✅ **Error boundaries** - Gestione errori React
✅ **Loading states** - UX durante fetch
✅ **TypeScript** - Type safety con i dati F1

---

## Esempio Completo App

```typescript
// App.tsx
import { RaceResults } from './components/RaceResults';
import { RaceFilters } from './components/RaceFilters';
import { useF1Data } from './hooks/useF1Data';

export function App() {
  const { data, loading, error } = useF1Data();

  if (loading) return <Loader />;
  if (error) return <Error message={error} />;
  if (!data) return <NoData />;

  return (
    <div className="app">
      <header>
        <h1>🏎️ F1 Live Results</h1>
      </header>
      
      <main>
        <RaceResults />
        <RaceFilters data={data} />
      </main>
    </div>
  );
}
```

---

**Fatto!** Ora hai un sistema completo:
- Scraper automatico (GitHub Actions)
- Dati salvati (GitHub repo)
- PWA React che li mostra
- Cache e offline support
