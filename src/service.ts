/**
 * OpenF1 Service
 * 
 * Service layer che gestisce la logica di business per il recupero dati F1
 */

import { OpenF1Client } from './client.js';
import type {
  Meeting,
  Session,
  Driver,
  SessionResult,
  Lap,
  Stint,
  Pit,
  RaceControl,
  StartingGrid,
  SessionData,
  GrandPrixData,
  ScraperResult,
} from './types.js';

export class OpenF1Service {
  private client: OpenF1Client;

  constructor() {
    this.client = new OpenF1Client();
  }

  /**
   * Recupera tutti i meeting di una stagione
   */
  async getMeetings(year: number): Promise<ScraperResult<Meeting[]>> {
    try {
      console.log(`📅 Recupero meetings per la stagione ${year}...`);
      
      const data = await this.client.get<Meeting[]>('meetings', { year });
      const meetings = this.client.validateArrayResponse<Meeting>(data, 'meetings');

      if (this.client.isEmptyResponse(meetings)) {
        return {
          success: false,
          error: {
            code: 'NO_DATA',
            message: `Nessun meeting trovato per l'anno ${year}`,
          },
          timestamp: new Date().toISOString(),
        };
      }

      console.log(`✅ Trovati ${meetings.length} meetings`);
      
      return {
        success: true,
        data: meetings,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return this.handleServiceError(error, 'getMeetings');
    }
  }

  /**
   * Recupera l'ultimo meeting (latest)
   */
  async getLatestMeeting(): Promise<ScraperResult<Meeting>> {
    try {
      console.log('📅 Recupero ultimo meeting...');
      
      const data = await this.client.get<Meeting[]>('meetings', { 
        meeting_key: 'latest' 
      });
      const meetings = this.client.validateArrayResponse<Meeting>(data, 'latest meeting');

      if (this.client.isEmptyResponse(meetings)) {
        return {
          success: false,
          error: {
            code: 'NO_DATA',
            message: 'Nessun meeting recente trovato',
          },
          timestamp: new Date().toISOString(),
        };
      }

      const latestMeeting = meetings[0];
      console.log(`✅ Meeting: ${latestMeeting.meeting_name}`);
      
      return {
        success: true,
        data: latestMeeting,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return this.handleServiceError(error, 'getLatestMeeting');
    }
  }

  /**
   * Recupera tutte le sessioni di un meeting
   */
  async getSessions(meetingKey: number): Promise<ScraperResult<Session[]>> {
    try {
      console.log(`🏁 Recupero sessioni per meeting ${meetingKey}...`);
      
      const data = await this.client.get<Session[]>('sessions', { 
        meeting_key: meetingKey 
      });
      const sessions = this.client.validateArrayResponse<Session>(data, 'sessions');

      if (this.client.isEmptyResponse(sessions)) {
        return {
          success: false,
          error: {
            code: 'NO_DATA',
            message: `Nessuna sessione trovata per meeting ${meetingKey}`,
          },
          timestamp: new Date().toISOString(),
        };
      }

      console.log(`✅ Trovate ${sessions.length} sessioni`);
      
      return {
        success: true,
        data: sessions,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return this.handleServiceError(error, 'getSessions');
    }
  }

  /**
   * Recupera i piloti di una sessione
   */
  async getDrivers(sessionKey: number): Promise<ScraperResult<Driver[]>> {
    try {
      const data = await this.client.get<Driver[]>('drivers', { 
        session_key: sessionKey 
      });
      const drivers = this.client.validateArrayResponse<Driver>(data, 'drivers');

      return {
        success: true,
        data: drivers,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return this.handleServiceError(error, 'getDrivers');
    }
  }

  /**
   * Recupera i risultati di una sessione
   */
  async getSessionResults(sessionKey: number): Promise<ScraperResult<SessionResult[]>> {
    try {
      const data = await this.client.get<SessionResult[]>('session_result', { 
        session_key: sessionKey 
      });
      const results = this.client.validateArrayResponse<SessionResult>(data, 'session_result');

      return {
        success: true,
        data: results,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return this.handleServiceError(error, 'getSessionResults');
    }
  }

  /**
   * Recupera tutti i giri di una sessione
   */
  async getLaps(sessionKey: number): Promise<ScraperResult<Lap[]>> {
    try {
      console.log(`   📊 Recupero giri...`);
      const data = await this.client.get<Lap[]>('laps', { 
        session_key: sessionKey 
      });
      const laps = this.client.validateArrayResponse<Lap>(data, 'laps');

      return {
        success: true,
        data: laps,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return this.handleServiceError(error, 'getLaps');
    }
  }

  /**
   * Recupera gli stint di una sessione
   */
  async getStints(sessionKey: number): Promise<ScraperResult<Stint[]>> {
    try {
      console.log(`   🔧 Recupero stint...`);
      const data = await this.client.get<Stint[]>('stints', { 
        session_key: sessionKey 
      });
      const stints = this.client.validateArrayResponse<Stint>(data, 'stints');

      return {
        success: true,
        data: stints,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return this.handleServiceError(error, 'getStints');
    }
  }

  /**
   * Recupera i pit stop di una sessione
   */
  async getPits(sessionKey: number): Promise<ScraperResult<Pit[]>> {
    try {
      console.log(`   🏎️  Recupero pit stop...`);
      const data = await this.client.get<Pit[]>('pit', { 
        session_key: sessionKey 
      });
      const pits = this.client.validateArrayResponse<Pit>(data, 'pits');

      return {
        success: true,
        data: pits,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return this.handleServiceError(error, 'getPits');
    }
  }

  /**
   * Recupera i messaggi race control di una sessione
   */
  async getRaceControl(sessionKey: number): Promise<ScraperResult<RaceControl[]>> {
    try {
      console.log(`   🚦 Recupero race control...`);
      const data = await this.client.get<RaceControl[]>('race_control', { 
        session_key: sessionKey 
      });
      const raceControl = this.client.validateArrayResponse<RaceControl>(data, 'race_control');

      return {
        success: true,
        data: raceControl,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return this.handleServiceError(error, 'getRaceControl');
    }
  }

  /**
   * Recupera la starting grid di una sessione
   */
  async getStartingGrid(sessionKey: number): Promise<ScraperResult<StartingGrid[]>> {
    try {
      console.log(`   🏁 Recupero starting grid...`);
      const data = await this.client.get<StartingGrid[]>('starting_grid', { 
        session_key: sessionKey 
      });
      const grid = this.client.validateArrayResponse<StartingGrid>(data, 'starting_grid');

      return {
        success: true,
        data: grid,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return this.handleServiceError(error, 'getStartingGrid');
    }
  }

  /**
   * Recupera dati completi di una sessione
   */
  async getCompleteSessionData(
    session: Session,
    options: {
      includeLaps?: boolean;
      includeStints?: boolean;
      includePits?: boolean;
      includeRaceControl?: boolean;
      includeStartingGrid?: boolean;
    } = {}
  ): Promise<ScraperResult<SessionData>> {
    try {
      console.log(`\n🏁 Elaboro sessione: ${session.session_name}`);

      const [driversResult, resultsResult] = await Promise.all([
        this.getDrivers(session.session_key),
        this.getSessionResults(session.session_key),
      ]);

      if (!driversResult.success || !resultsResult.success) {
        return {
          success: false,
          error: driversResult.error || resultsResult.error,
          timestamp: new Date().toISOString(),
        };
      }

      const sessionData: SessionData = {
        session,
        drivers: driversResult.data!,
        results: resultsResult.data!,
      };

      // Dati opzionali
      if (options.includeLaps) {
        const lapsResult = await this.getLaps(session.session_key);
        if (lapsResult.success) {
          sessionData.laps = lapsResult.data;
        }
      }

      if (options.includeStints) {
        const stintsResult = await this.getStints(session.session_key);
        if (stintsResult.success) {
          sessionData.stints = stintsResult.data;
        }
      }

      if (options.includePits) {
        const pitsResult = await this.getPits(session.session_key);
        if (pitsResult.success) {
          sessionData.pits = pitsResult.data;
        }
      }

      if (options.includeRaceControl) {
        const rcResult = await this.getRaceControl(session.session_key);
        if (rcResult.success) {
          sessionData.race_control = rcResult.data;
        }
      }

      if (options.includeStartingGrid) {
        const gridResult = await this.getStartingGrid(session.session_key);
        if (gridResult.success) {
          sessionData.starting_grid = gridResult.data;
        }
      }

      console.log(`✅ Sessione completata: ${session.session_name}`);

      return {
        success: true,
        data: sessionData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return this.handleServiceError(error, 'getCompleteSessionData');
    }
  }

  /**
   * Gestisce errori del service layer
   */
  private handleServiceError(error: unknown, context: string): ScraperResult<never> {
    console.error(`❌ Errore in ${context}:`, error);

    if (typeof error === 'object' && error !== null && 'code' in error) {
      return {
        success: false,
        error: error as any,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: false,
      error: {
        code: 'SERVICE_ERROR',
        message: error instanceof Error ? error.message : 'Errore sconosciuto',
        details: { context },
      },
      timestamp: new Date().toISOString(),
    };
  }
}
