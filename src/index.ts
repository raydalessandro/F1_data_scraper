/**
 * F1 Data Scraper - Main Entry Point
 * 
 * Esempio di utilizzo del scraper
 */

import { F1Scraper } from './scraper.js';
import { FileUtils } from './utils.js';
import { resolve } from 'path';

async function main() {
  const scraper = new F1Scraper();

  // ==================================================
  // ESEMPIO 1: Ultimo Gran Premio (configurazione base)
  // ==================================================
  console.log('🔹 ESEMPIO 1: Ultimo Gran Premio - Solo risultati\n');
  
  const latestGPResult = await scraper.scrapeLatestGrandPrix({
    sessionTypes: ['Race'], // Solo la gara
    includeLaps: false,
    includeStints: false,
    includePits: false,
    includeRaceControl: false,
  });

  if (latestGPResult.success && latestGPResult.data) {
    const outputPath = resolve(process.cwd(), 'data', 'latest-gp-simple.json');
    await FileUtils.saveJson(latestGPResult.data, outputPath);

    const stats = FileUtils.getJsonStats(latestGPResult.data);
    console.log(`\n📊 Statistiche file:`);
    console.log(`   Dimensione: ${stats.sizeFormatted}`);
    console.log(`   Keys: ${stats.keys}`);
  } else {
    console.error('❌ Errore:', latestGPResult.error);
  }

  // ==================================================
  // ESEMPIO 2: Ultimo Gran Premio (dati completi)
  // ==================================================
  console.log('\n\n🔹 ESEMPIO 2: Ultimo Gran Premio - Dati completi\n');
  
  const completeGPResult = await scraper.scrapeLatestGrandPrix({
    sessionTypes: ['Qualifying', 'Race'],
    includeLaps: true,
    includeStints: true,
    includePits: true,
    includeRaceControl: true,
  });

  if (completeGPResult.success && completeGPResult.data) {
    const outputPath = resolve(process.cwd(), 'data', 'latest-gp-complete.json');
    await FileUtils.saveJson(completeGPResult.data, outputPath);

    const meeting = completeGPResult.data.meeting;
    const filename = FileUtils.generateGPFilename(
      meeting.meeting_name,
      meeting.year
    );
    const namedOutputPath = resolve(process.cwd(), 'data', filename);
    await FileUtils.saveJson(completeGPResult.data, namedOutputPath);

    const stats = FileUtils.getJsonStats(completeGPResult.data);
    console.log(`\n📊 Statistiche file completo:`);
    console.log(`   Dimensione: ${stats.sizeFormatted}`);
    console.log(`   Keys: ${stats.keys}`);
    console.log(`   Profondità: ${stats.depth}`);
  }

  // ==================================================
  // ESEMPIO 3: Gran Premio specifico (per testing)
  // ==================================================
  // Decommentare per usare
  /*
  console.log('\n\n🔹 ESEMPIO 3: Gran Premio Specifico\n');
  
  const specificGPResult = await scraper.scrapeGrandPrix(1257, {
    sessionTypes: ['Race'],
    year: 2025,
  });

  if (specificGPResult.success && specificGPResult.data) {
    const outputPath = resolve(process.cwd(), 'data', 'specific-gp.json');
    await FileUtils.saveJson(specificGPResult.data, outputPath);
  }
  */

  // ==================================================
  // ESEMPIO 4: Intera stagione (ATTENZIONE: operazione lunga!)
  // ==================================================
  // Decommentare per usare
  /*
  console.log('\n\n🔹 ESEMPIO 4: Stagione completa 2025\n');
  
  const seasonResult = await scraper.scrapeSeason(2025, {
    sessionTypes: ['Race'],
    includeLaps: false,
    includeStints: false,
  });

  if (seasonResult.success && seasonResult.data) {
    const outputPath = resolve(process.cwd(), 'data', 'season-2025.json');
    await FileUtils.saveJson(seasonResult.data, outputPath);
    
    console.log(`\n✅ Salvati ${seasonResult.data.length} Gran Premi`);
  }
  */

  console.log('\n━'.repeat(50));
  console.log('🏁 Processo completato!\n');
}

// Esegui main con error handling
main().catch(error => {
  console.error('\n💥 Errore fatale:', error);
  process.exit(1);
});

// Export per uso come modulo
export { F1Scraper } from './scraper.js';
export { OpenF1Service } from './service.js';
export { OpenF1Client } from './client.js';
export { FileUtils } from './utils.js';
export * from './types.js';
