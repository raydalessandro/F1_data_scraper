/**
 * F1 Data Scraper
 * 
 * Orchestratore principale per il recupero dati F1
 */

import { OpenF1Service } from './service.js';
import type {
  ScraperConfig,
  GrandPrixData,
  ScraperResult,
  SessionData,
} from './types.js';

export class F1Scraper {
  private service: OpenF1Service;

  constructor() {
    this.service = new OpenF1Service();
  }

  /**
   * Recupera i dati dell'ultimo Gran Premio
   */
  async scrapeLatestGrandPrix(
    config: Omit<ScraperConfig, 'year' | 'meetingKey'> = {}
  ): Promise<ScraperResult<GrandPrixData>> {
    try {
      console.log('\n🏎️  F1 DATA SCRAPER - Ultimo Gran Premio\n');
      console.log('━'.repeat(50));

      // 1. Ottieni ultimo meeting
      const meetingResult = await this.service.getLatestMeeting();
      if (!meetingResult.success) {
        return {
          success: false,
          error: meetingResult.error,
          timestamp: new Date().toISOString(),
        };
      }

      const meeting = meetingResult.data!;
      console.log(`\n📍 ${meeting.meeting_name}`);
      console.log(`   ${meeting.location}, ${meeting.country_name}`);
      console.log(`   ${new Date(meeting.date_start).toLocaleDateString('it-IT')}`);

      // 2. Ottieni tutte le sessioni
      const sessionsResult = await this.service.getSessions(meeting.meeting_key);
      if (!sessionsResult.success) {
        return {
          success: false,
          error: sessionsResult.error,
          timestamp: new Date().toISOString(),
        };
      }

      const allSessions = sessionsResult.data!;
      
      // 3. Filtra sessioni se richiesto
      const sessionsToScrape = config.sessionTypes
        ? allSessions.filter(s => config.sessionTypes!.includes(s.session_name as any))
        : allSessions;

      console.log(`\n🔍 Sessioni da elaborare: ${sessionsToScrape.length}`);

      // 4. Recupera dati per ogni sessione
      const sessionsData: Record<string, SessionData> = {};
      
      for (const session of sessionsToScrape) {
        const sessionDataResult = await this.service.getCompleteSessionData(session, {
          includeLaps: config.includeLaps ?? false,
          includeStints: config.includeStints ?? false,
          includePits: config.includePits ?? false,
          includeRaceControl: config.includeRaceControl ?? false,
          includeStartingGrid: session.session_type === 'Race',
        });

        if (sessionDataResult.success) {
          const key = this.normalizeSessionName(session.session_name);
          sessionsData[key] = sessionDataResult.data!;
        }
      }

      // 5. Costruisci risultato finale
      const grandPrixData: GrandPrixData = {
        meeting,
        sessions: sessionsData as any,
        metadata: {
          scraped_at: new Date().toISOString(),
          season: meeting.year,
          round: this.calculateRound(meeting, allSessions),
        },
      };

      console.log('\n━'.repeat(50));
      console.log('✅ Scraping completato con successo!\n');

      return {
        success: true,
        data: grandPrixData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Errore durante lo scraping:', error);
      return {
        success: false,
        error: {
          code: 'SCRAPER_ERROR',
          message: error instanceof Error ? error.message : 'Errore sconosciuto',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Recupera i dati di un Gran Premio specifico
   */
  async scrapeGrandPrix(
    meetingKey: number,
    config: Omit<ScraperConfig, 'meetingKey'> = {}
  ): Promise<ScraperResult<GrandPrixData>> {
    try {
      console.log('\n🏎️  F1 DATA SCRAPER - Gran Premio Specifico\n');
      console.log('━'.repeat(50));

      // 1. Ottieni meeting
      const meetingsResult = await this.service.getMeetings(config.year ?? new Date().getFullYear());
      if (!meetingsResult.success) {
        return {
          success: false,
          error: meetingsResult.error,
          timestamp: new Date().toISOString(),
        };
      }

      const meeting = meetingsResult.data!.find(m => m.meeting_key === meetingKey);
      if (!meeting) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Meeting ${meetingKey} non trovato`,
          },
          timestamp: new Date().toISOString(),
        };
      }

      console.log(`\n📍 ${meeting.meeting_name}`);
      console.log(`   ${meeting.location}, ${meeting.country_name}`);

      // 2. Recupera sessioni (stesso processo di scrapeLatestGrandPrix)
      const sessionsResult = await this.service.getSessions(meeting.meeting_key);
      if (!sessionsResult.success) {
        return {
          success: false,
          error: sessionsResult.error,
          timestamp: new Date().toISOString(),
        };
      }

      const allSessions = sessionsResult.data!;
      const sessionsToScrape = config.sessionTypes
        ? allSessions.filter(s => config.sessionTypes!.includes(s.session_name as any))
        : allSessions;

      const sessionsData: Record<string, SessionData> = {};
      
      for (const session of sessionsToScrape) {
        const sessionDataResult = await this.service.getCompleteSessionData(session, {
          includeLaps: config.includeLaps ?? false,
          includeStints: config.includeStints ?? false,
          includePits: config.includePits ?? false,
          includeRaceControl: config.includeRaceControl ?? false,
          includeStartingGrid: session.session_type === 'Race',
        });

        if (sessionDataResult.success) {
          const key = this.normalizeSessionName(session.session_name);
          sessionsData[key] = sessionDataResult.data!;
        }
      }

      const grandPrixData: GrandPrixData = {
        meeting,
        sessions: sessionsData as any,
        metadata: {
          scraped_at: new Date().toISOString(),
          season: meeting.year,
          round: this.calculateRound(meeting, allSessions),
        },
      };

      console.log('\n━'.repeat(50));
      console.log('✅ Scraping completato!\n');

      return {
        success: true,
        data: grandPrixData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SCRAPER_ERROR',
          message: error instanceof Error ? error.message : 'Errore sconosciuto',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Recupera tutti i Gran Premi di una stagione
   */
  async scrapeSeason(
    year: number,
    config: Omit<ScraperConfig, 'year'> = {}
  ): Promise<ScraperResult<GrandPrixData[]>> {
    try {
      console.log(`\n🏎️  F1 DATA SCRAPER - Stagione ${year}\n`);
      console.log('━'.repeat(50));

      const meetingsResult = await this.service.getMeetings(year);
      if (!meetingsResult.success) {
        return {
          success: false,
          error: meetingsResult.error,
          timestamp: new Date().toISOString(),
        };
      }

      const meetings = meetingsResult.data!;
      console.log(`\n📅 Trovati ${meetings.length} Gran Premi\n`);

      const allGrandsPrix: GrandPrixData[] = [];

      for (const meeting of meetings) {
        const gpResult = await this.scrapeGrandPrix(meeting.meeting_key, config);
        
        if (gpResult.success && gpResult.data) {
          allGrandsPrix.push(gpResult.data);
        }
      }

      console.log('\n━'.repeat(50));
      console.log(`✅ Completato scraping di ${allGrandsPrix.length} Gran Premi!\n`);

      return {
        success: true,
        data: allGrandsPrix,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SCRAPER_ERROR',
          message: error instanceof Error ? error.message : 'Errore sconosciuto',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Normalizza nome sessione per chiavi object
   */
  private normalizeSessionName(sessionName: string): string {
    return sessionName
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  /**
   * Calcola il round number del meeting
   */
  private calculateRound(meeting: any, allSessions: any[]): number {
    // Il round è dedotto dalla posizione del meeting nella stagione
    // OpenF1 non fornisce direttamente il round number
    return meeting.meeting_key % 100;
  }
}
