/**
 * Test Script
 * 
 * Script per testare rapidamente le API OpenF1
 */

import { OpenF1Service } from './service.js';

async function runTests() {
  console.log('\n🧪 F1 DATA SCRAPER - TEST SUITE\n');
  console.log('━'.repeat(50));

  const service = new OpenF1Service();

  // Test 1: Ultimo meeting
  console.log('\n📍 TEST 1: Recupero ultimo meeting');
  console.log('─'.repeat(50));
  
  const meetingResult = await service.getLatestMeeting();
  
  if (meetingResult.success && meetingResult.data) {
    const meeting = meetingResult.data;
    console.log('✅ SUCCESSO');
    console.log(`   Meeting: ${meeting.meeting_name}`);
    console.log(`   Location: ${meeting.location}, ${meeting.country_name}`);
    console.log(`   Anno: ${meeting.year}`);
    console.log(`   Meeting Key: ${meeting.meeting_key}`);
    console.log(`   Data: ${new Date(meeting.date_start).toLocaleDateString('it-IT')}`);
  } else {
    console.log('❌ FALLITO');
    console.log('   Errore:', meetingResult.error);
  }

  // Test 2: Meetings stagione 2025
  console.log('\n\n📅 TEST 2: Tutti i meetings 2025');
  console.log('─'.repeat(50));
  
  const meetings2025Result = await service.getMeetings(2025);
  
  if (meetings2025Result.success && meetings2025Result.data) {
    const meetings = meetings2025Result.data;
    console.log(`✅ SUCCESSO - Trovati ${meetings.length} meetings`);
    
    console.log('\n   Lista Gran Premi 2025:');
    meetings.forEach((m, index) => {
      const date = new Date(m.date_start).toLocaleDateString('it-IT', { 
        month: 'short', 
        day: 'numeric' 
      });
      console.log(`   ${(index + 1).toString().padStart(2)}. ${date} - ${m.meeting_name} (${m.location})`);
    });
  } else {
    console.log('❌ FALLITO');
    console.log('   Errore:', meetings2025Result.error);
  }

  // Test 3: Sessioni dell'ultimo meeting
  if (meetingResult.success && meetingResult.data) {
    console.log('\n\n🏁 TEST 3: Sessioni ultimo meeting');
    console.log('─'.repeat(50));
    
    const sessionsResult = await service.getSessions(meetingResult.data.meeting_key);
    
    if (sessionsResult.success && sessionsResult.data) {
      const sessions = sessionsResult.data;
      console.log(`✅ SUCCESSO - Trovate ${sessions.length} sessioni`);
      
      console.log('\n   Sessioni:');
      sessions.forEach(s => {
        const date = new Date(s.date_start).toLocaleDateString('it-IT', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        console.log(`   • ${s.session_name} (${s.session_type}) - ${date}`);
        console.log(`     Session Key: ${s.session_key}`);
      });

      // Test 4: Risultati gara (se disponibile)
      const raceSession = sessions.find(s => s.session_type === 'Race');
      
      if (raceSession) {
        console.log('\n\n🏆 TEST 4: Risultati gara');
        console.log('─'.repeat(50));
        
        const resultsResult = await service.getSessionResults(raceSession.session_key);
        
        if (resultsResult.success && resultsResult.data) {
          const results = resultsResult.data;
          console.log(`✅ SUCCESSO - ${results.length} piloti classificati`);
          
          // Ordina per posizione
          const sortedResults = [...results].sort((a, b) => a.position - b.position);
          
          console.log('\n   Top 10:');
          sortedResults.slice(0, 10).forEach(r => {
            const gap = typeof r.gap_to_leader === 'number' 
              ? `+${r.gap_to_leader.toFixed(3)}s`
              : r.gap_to_leader;
            
            console.log(`   ${r.position.toString().padStart(2)}. Pilota #${r.driver_number.toString().padStart(2)} - ${gap}`);
          });
        } else {
          console.log('❌ Risultati non disponibili');
        }

        // Test 5: Piloti
        console.log('\n\n👨‍✈️ TEST 5: Info piloti');
        console.log('─'.repeat(50));
        
        const driversResult = await service.getDrivers(raceSession.session_key);
        
        if (driversResult.success && driversResult.data) {
          const drivers = driversResult.data;
          console.log(`✅ SUCCESSO - ${drivers.length} piloti`);
          
          console.log('\n   Piloti (primi 10):');
          drivers.slice(0, 10).forEach(d => {
            console.log(`   #${d.driver_number.toString().padStart(2)} ${d.full_name.padEnd(25)} - ${d.team_name}`);
          });
        } else {
          console.log('❌ Info piloti non disponibili');
        }
      }
    } else {
      console.log('❌ FALLITO');
      console.log('   Errore:', sessionsResult.error);
    }
  }

  console.log('\n\n━'.repeat(50));
  console.log('🏁 Test completati!\n');
}

// Esegui test
runTests().catch(error => {
  console.error('\n💥 Errore durante i test:', error);
  process.exit(1);
});
