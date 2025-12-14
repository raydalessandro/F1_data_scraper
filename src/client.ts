/**
 * HTTP Client per OpenF1 API
 * 
 * Client robusto con retry logic, rate limiting e error handling
 */

import type { ScraperError } from './types.js';

export class OpenF1Client {
  private readonly baseUrl = 'https://api.openf1.org/v1';
  private readonly defaultTimeout = 30000; // 30 secondi
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 secondo

  /**
   * Esegue una richiesta GET con retry automatico
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, this.defaultTimeout);
        
        if (!response.ok) {
          throw this.createHttpError(response.status, response.statusText);
        }

        const data = await response.json();
        return data as T;
        
      } catch (error) {
        const isLastAttempt = attempt === this.maxRetries;
        
        if (isLastAttempt) {
          throw this.handleError(error, endpoint);
        }

        // Retry con exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        console.warn(`Tentativo ${attempt} fallito per ${endpoint}. Riprovo tra ${delay}ms...`);
        await this.sleep(delay);
      }
    }

    throw this.createError('MAX_RETRIES_EXCEEDED', 'Raggiunto numero massimo di tentativi');
  }

  /**
   * Fetch con timeout
   */
  private async fetchWithTimeout(url: string, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'F1-Data-Scraper/1.0 (EAR-LAB)',
        },
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Costruisce URL con query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Crea errore HTTP strutturato
   */
  private createHttpError(status: number, statusText: string): ScraperError {
    const errorMap: Record<number, { code: string; message: string }> = {
      400: { code: 'BAD_REQUEST', message: 'Richiesta non valida' },
      404: { code: 'NOT_FOUND', message: 'Risorsa non trovata' },
      429: { code: 'RATE_LIMIT', message: 'Troppi tentativi. Riprova più tardi' },
      500: { code: 'SERVER_ERROR', message: 'Errore del server OpenF1' },
      503: { code: 'SERVICE_UNAVAILABLE', message: 'Servizio temporaneamente non disponibile' },
    };

    const error = errorMap[status] || {
      code: 'HTTP_ERROR',
      message: `Errore HTTP ${status}: ${statusText}`,
    };

    return { ...error, details: { status, statusText } };
  }

  /**
   * Gestisce errori generici
   */
  private handleError(error: unknown, context: string): ScraperError {
    if (this.isScraperError(error)) {
      return error;
    }

    if (error instanceof Error) {
      // Network errors
      if (error.name === 'AbortError') {
        return this.createError('TIMEOUT', 'Timeout della richiesta', { context });
      }
      
      if (error.message.includes('fetch')) {
        return this.createError('NETWORK_ERROR', 'Errore di rete', { 
          context, 
          originalError: error.message 
        });
      }

      return this.createError('UNKNOWN_ERROR', error.message, { context });
    }

    return this.createError('UNKNOWN_ERROR', 'Errore sconosciuto', { context, error });
  }

  /**
   * Type guard per ScraperError
   */
  private isScraperError(error: unknown): error is ScraperError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error
    );
  }

  /**
   * Crea errore personalizzato
   */
  private createError(code: string, message: string, details?: unknown): ScraperError {
    return { code, message, details };
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Valida la risposta array (OpenF1 restituisce sempre array)
   */
  validateArrayResponse<T>(data: unknown, context: string): T[] {
    if (!Array.isArray(data)) {
      throw this.createError(
        'INVALID_RESPONSE',
        `Risposta non valida per ${context}: atteso array`,
        { receivedType: typeof data }
      );
    }
    return data as T[];
  }

  /**
   * Controlla se la risposta è vuota
   */
  isEmptyResponse(data: unknown[]): boolean {
    return data.length === 0;
  }
}
