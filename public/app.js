// ========================================
// CONFIGURAZIONE
// ========================================
const DATA_URL = '../data/latest-gp.json';

// ========================================
// ELEMENTI DOM
// ========================================
const elements = {
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  errorMessage: document.getElementById('error-message'),
  content: document.getElementById('content'),
  gpName: document.getElementById('gp-name'),
  gpLocation: document.getElementById('gp-location'),
  gpDate: document.getElementById('gp-date'),
  gpCircuit: document.getElementById('gp-circuit'),
  raceResults: document.getElementById('race-results'),
  statsGrid: document.getElementById('stats-grid'),
  jsonData: document.getElementById('json-data'),
  lastUpdate: document.getElementById('last-update'),
  teamFilter: document.getElementById('team-filter'),
  viewFilter: document.getElementById('view-filter'),
};

// ========================================
// STATE
// ========================================
let currentData = null;
let allDrivers = [];
let allResults = [];

// ========================================
// MAIN: CARICA DATI
// ========================================
async function loadData() {
  try {
    const response = await fetch(DATA_URL);
    
    if (!response.ok) {
      throw new Error('Dati non disponibili. Esegui lo scraper su GitHub Actions!');
    }

    currentData = await response.json();
    
    // Nascondi loading, mostra content
    elements.loading.style.display = 'none';
    elements.content.style.display = 'block';

    // Render UI
    displayMeetingInfo(currentData);
    
    if (currentData.sessions.race) {
      allDrivers = currentData.sessions.race.drivers;
      allResults = currentData.sessions.race.results;
      
      populateFilters(allDrivers);
      displayRaceResults(allResults, allDrivers);
      displayStatistics(currentData);
    } else {
      elements.raceResults.innerHTML = '<p class="no-data">⚠️ Nessun risultato gara disponibile</p>';
    }

    // JSON raw
    elements.jsonData.textContent = JSON.stringify(currentData, null, 2);

    // Last update
    const updateDate = new Date(currentData.metadata.scraped_at);
    elements.lastUpdate.textContent = updateDate.toLocaleString('it-IT', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

  } catch (error) {
    console.error('Error loading data:', error);
    showError(error.message);
  }
}

// ========================================
// UI: MOSTRA ERRORE
// ========================================
function showError(message) {
  elements.loading.style.display = 'none';
  elements.error.style.display = 'block';
  elements.errorMessage.textContent = message;
}

// ========================================
// UI: MEETING INFO
// ========================================
function displayMeetingInfo(data) {
  const meeting = data.meeting;
  
  elements.gpName.textContent = meeting.meeting_name;
  elements.gpLocation.textContent = `📍 ${meeting.location}, ${meeting.country_name}`;
  elements.gpCircuit.textContent = `🏁 ${meeting.circuit_short_name}`;
  
  const date = new Date(meeting.date_start);
  elements.gpDate.textContent = `📅 ${date.toLocaleDateString('it-IT', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`;
}

// ========================================
// UI: POPOLA FILTRI
// ========================================
function populateFilters(drivers) {
  const teams = [...new Set(drivers.map(d => d.team_name))].sort();
  
  elements.teamFilter.innerHTML = '<option value="">Tutti i team</option>' +
    teams.map(team => `<option value="${team}">${team}</option>`).join('');
}

// ========================================
// UI: RISULTATI GARA
// ========================================
function displayRaceResults(results, drivers, filters = {}) {
  let filteredResults = [...results].sort((a, b) => a.position - b.position);

  // Filtro per team
  if (filters.team) {
    filteredResults = filteredResults.filter(r => {
      const driver = drivers.find(d => d.driver_number === r.driver_number);
      return driver?.team_name === filters.team;
    });
  }

  // Filtro per vista
  if (filters.view === 'podium') {
    filteredResults = filteredResults.filter(r => r.position <= 3);
  } else if (filters.view === 'points') {
    filteredResults = filteredResults.filter(r => r.position <= 10);
  }

  // Render
  elements.raceResults.innerHTML = filteredResults.map(result => {
    const driver = drivers.find(d => d.driver_number === result.driver_number);
    
    const gap = result.position === 1 
      ? 'Winner'
      : typeof result.gap_to_leader === 'number' 
        ? `+${result.gap_to_leader.toFixed(3)}s`
        : result.gap_to_leader;

    const podiumClass = result.position <= 3 ? `podium-${result.position}` : '';
    const dnfClass = result.dnf ? 'dnf' : '';

    return `
      <div class="result-row ${podiumClass} ${dnfClass}">
        <div class="position">${result.position}</div>
        <div class="driver-info">
          <div class="driver-name">${driver?.full_name || `Pilota #${result.driver_number}`}</div>
          <div class="driver-number">#${result.driver_number} ${driver?.name_acronym || ''}</div>
        </div>
        <div class="team-name">${driver?.team_name || 'N/A'}</div>
        <div class="gap">${result.dnf ? 'DNF' : gap}</div>
      </div>
    `;
  }).join('');
}

// ========================================
// UI: STATISTICHE
// ========================================
function displayStatistics(data) {
  const race = data.sessions.race;
  if (!race) return;

  const stats = {
    totalDrivers: race.drivers.length,
    dnfCount: race.results.filter(r => r.dnf).length,
    finishers: race.results.filter(r => !r.dnf && !r.dns).length,
    totalLaps: Math.max(...race.results.map(r => r.number_of_laps)),
  };

  elements.statsGrid.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Piloti in Gara</div>
      <div class="stat-value">${stats.totalDrivers}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Giri Completati</div>
      <div class="stat-value">${stats.totalLaps}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Arrivati al Traguardo</div>
      <div class="stat-value">${stats.finishers}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Ritiri (DNF)</div>
      <div class="stat-value">${stats.dnfCount}</div>
    </div>
  `;
}

// ========================================
// EVENT LISTENERS: FILTRI
// ========================================
elements.teamFilter.addEventListener('change', applyFilters);
elements.viewFilter.addEventListener('change', applyFilters);

function applyFilters() {
  const filters = {
    team: elements.teamFilter.value,
    view: elements.viewFilter.value,
  };
  
  displayRaceResults(allResults, allDrivers, filters);
}

// ========================================
// INIT
// ========================================
loadData();
