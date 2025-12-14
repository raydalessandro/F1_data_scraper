/**
 * OpenF1 API Types
 * 
 * Definizioni TypeScript complete per tutte le risposte dell'API OpenF1
 * Basato sulla documentazione ufficiale: https://openf1.org
 */

export interface Meeting {
  circuit_key: number;
  circuit_short_name: string;
  country_code: string;
  country_key: number;
  country_name: string;
  date_start: string;
  gmt_offset: string;
  location: string;
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  year: number;
}

export interface Session {
  circuit_key: number;
  circuit_short_name: string;
  country_code: string;
  country_key: number;
  country_name: string;
  date_end: string;
  date_start: string;
  gmt_offset: string;
  location: string;
  meeting_key: number;
  session_key: number;
  session_name: string;
  session_type: string;
  year: number;
}

export interface Driver {
  broadcast_name: string;
  country_code: string;
  driver_number: number;
  first_name: string;
  full_name: string;
  headshot_url: string | null;
  last_name: string;
  meeting_key: number;
  name_acronym: string;
  session_key: number;
  team_colour: string;
  team_name: string;
}

export interface SessionResult {
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
  driver_number: number;
  duration: number | number[]; // Array per qualifiche (Q1, Q2, Q3)
  gap_to_leader: number | string | number[]; // può essere "+N LAP(S)" o array
  number_of_laps: number;
  meeting_key: number;
  position: number;
  session_key: number;
}

export interface Lap {
  date_start: string;
  driver_number: number;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  i1_speed: number | null;
  i2_speed: number | null;
  is_pit_out_lap: boolean;
  lap_duration: number | null;
  lap_number: number;
  meeting_key: number;
  segments_sector_1: number[] | null;
  segments_sector_2: number[] | null;
  segments_sector_3: number[] | null;
  session_key: number;
  st_speed: number | null;
}

export interface Stint {
  compound: string;
  driver_number: number;
  lap_end: number;
  lap_start: number;
  meeting_key: number;
  session_key: number;
  stint_number: number;
  tyre_age_at_start: number;
}

export interface Pit {
  date: string;
  driver_number: number;
  lap_number: number;
  meeting_key: number;
  pit_duration: number;
  session_key: number;
}

export interface RaceControl {
  category: string;
  date: string;
  driver_number: number | null;
  flag: string | null;
  lap_number: number | null;
  meeting_key: number;
  message: string;
  scope: string;
  sector: number | null;
  session_key: number;
}

export interface StartingGrid {
  position: number;
  driver_number: number;
  lap_duration: number;
  meeting_key: number;
  session_key: number;
}

/**
 * Dati aggregati per un Gran Premio completo
 */
export interface GrandPrixData {
  meeting: Meeting;
  sessions: {
    practice1?: SessionData;
    practice2?: SessionData;
    practice3?: SessionData;
    qualifying?: SessionData;
    sprint?: SessionData;
    race?: SessionData;
  };
  metadata: {
    scraped_at: string;
    season: number;
    round: number;
  };
}

export interface SessionData {
  session: Session;
  drivers: Driver[];
  results: SessionResult[];
  laps?: Lap[];
  stints?: Stint[];
  pits?: Pit[];
  race_control?: RaceControl[];
  starting_grid?: StartingGrid[];
}

/**
 * Configurazione per il scraper
 */
export interface ScraperConfig {
  year?: number;
  meetingKey?: number | 'latest';
  sessionTypes?: SessionType[];
  includeLaps?: boolean;
  includeStints?: boolean;
  includePits?: boolean;
  includeRaceControl?: boolean;
  outputPath?: string;
}

export type SessionType = 
  | 'Practice 1' 
  | 'Practice 2' 
  | 'Practice 3' 
  | 'Qualifying' 
  | 'Sprint' 
  | 'Race';

/**
 * Risultato dell'operazione di scraping
 */
export interface ScraperResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: ScraperError;
  timestamp: string;
}

export interface ScraperError {
  code: string;
  message: string;
  details?: unknown;
}
