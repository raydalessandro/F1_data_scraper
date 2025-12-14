/**
 * File Utils
 * 
 * Utility per gestire il salvataggio dei dati
 */

import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

export class FileUtils {
  /**
   * Salva dati in JSON con formatting
   */
  static async saveJson(
    data: unknown,
    filepath: string,
    options: {
      pretty?: boolean;
      ensureDir?: boolean;
    } = {}
  ): Promise<void> {
    const { pretty = true, ensureDir = true } = options;

    try {
      // Crea directory se non esiste
      if (ensureDir) {
        const dir = dirname(filepath);
        await mkdir(dir, { recursive: true });
      }

      // Converti in JSON
      const jsonString = pretty 
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);

      // Scrivi file
      await writeFile(filepath, jsonString, 'utf-8');
      
      console.log(`💾 File salvato: ${filepath}`);
    } catch (error) {
      console.error(`❌ Errore nel salvare ${filepath}:`, error);
      throw error;
    }
  }

  /**
   * Genera filename con timestamp
   */
  static generateFilename(
    prefix: string,
    extension: string = 'json',
    includeTimestamp: boolean = true
  ): string {
    if (!includeTimestamp) {
      return `${prefix}.${extension}`;
    }

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `${prefix}_${timestamp}.${extension}`;
  }

  /**
   * Genera nome file per Gran Premio
   */
  static generateGPFilename(
    gpName: string,
    year: number,
    extension: string = 'json'
  ): string {
    const normalized = gpName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    return `${year}_${normalized}.${extension}`;
  }

  /**
   * Formatta dimensione file
   */
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Ottieni statistiche su oggetto JSON
   */
  static getJsonStats(data: unknown): {
    size: number;
    sizeFormatted: string;
    keys?: number;
    depth?: number;
  } {
    const jsonString = JSON.stringify(data);
    const size = new TextEncoder().encode(jsonString).length;

    const stats: any = {
      size,
      sizeFormatted: this.formatFileSize(size),
    };

    if (typeof data === 'object' && data !== null) {
      stats.keys = Object.keys(data).length;
      stats.depth = this.getObjectDepth(data);
    }

    return stats;
  }

  /**
   * Calcola profondità oggetto
   */
  private static getObjectDepth(obj: any, depth: number = 0): number {
    if (typeof obj !== 'object' || obj === null) {
      return depth;
    }

    const depths = Object.values(obj).map(value => 
      this.getObjectDepth(value, depth + 1)
    );

    return depths.length > 0 ? Math.max(...depths) : depth;
  }
}
