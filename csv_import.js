/**
 * CSV-Import und Batch-Verarbeitung für Versetzungsprüfung
 * Liest CSV-Dateien und prüft alle Schüler auf Versetzung
 */

const fs = require('fs');
const { VersetzungsPruefer } = require('./versetzungspruefung.js');

/**
 * Liest und parst eine CSV-Datei
 * @param {string} filePath - Pfad zur CSV-Datei  
 * @returns {Array} - Array von Schülerobjekten mit Noten
 */
function leseCSV(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            throw new Error('CSV-Datei muss mindestens eine Kopfzeile und eine Datenzeile enthalten');
        }

        // Parse Header
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Finde "Name"-Spalte
        const nameIndex = headers.findIndex(h => h.toLowerCase() === 'name');
        if (nameIndex === -1) {
            throw new Error('CSV-Datei muss eine "Name"-Spalte enthalten');
        }

        // Finde alle Fächerspalten (alles außer Name, Erwartet, Bemerkung)
        const ignoreSpalten = ['name', 'erwartet', 'bemerkung'];
        const fachIndizes = headers
            .map((header, index) => ({header, index}))
            .filter(({header}) => !ignoreSpalten.includes(header.toLowerCase()) && header.trim());

        // Parse Schüler
        const schueler = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            
            const name = values[nameIndex];
            if (!name) continue; // Überspringe leere Zeilen

            const noten = {};
            let hatNoten = false;

            for (const {header, index} of fachIndizes) {
                const noteStr = values[index];
                if (noteStr && noteStr !== '') {
                    const note = parseInt(noteStr);
                    if (!isNaN(note) && note >= 1 && note <= 6) {
                        noten[header] = note;
                        hatNoten = true;
                    }
                }
            }

            if (hatNoten) {
                // Optional: Erwartetes Ergebnis aus CSV
                const erwartetIndex = headers.findIndex(h => h.toLowerCase() === 'erwartet');
                let erwartet = null;
                if (erwartetIndex !== -1 && values[erwartetIndex]) {
                    const erwartetStr = values[erwartetIndex].toUpperCase();
                    if (erwartetStr.includes('VERSETZT')) {
                        erwartet = !erwartetStr.includes('NICHT');
                    }
                }

                schueler.push({
                    name,
                    noten,
                    erwartet
                });
            }
        }

        return schueler;
    } catch (error) {
        console.error(`Fehler beim Lesen der CSV-Datei: ${error.message}`);
        process.exit(1);
    }
}

/**
 * Prüft alle Schüler und gibt Ergebnisse aus
 * @param {Array} schueler - Array von Schülerobjekten
 */
function pruefeAlle(schueler) {
    const pruefer = new VersetzungsPruefer();
    
    console.log('\n' + '='.repeat(80));
    console.log('🎓 VERSETZUNGSPRÜFUNG M-NIVEAU - BATCH-VERARBEITUNG');
    console.log('='.repeat(80) + '\n');

    let anzahlVersetzt = 0;
    let anzahlNichtVersetzt = 0;
    let fehler = 0;

    const ergebnisse = [];

    for (let i = 0; i < schueler.length; i++) {
        const { name, noten, erwartet } = schueler[i];
        
        console.log(`\n📝 Schüler ${i + 1}/${schueler.length}: ${name}`);
        console.log('-'.repeat(80));

        const ergebnis = pruefer.pruefeVersetzung(noten);

        // Ausgabe
        if (ergebnis.versetzt === null) {
            console.log(`⚠️  FEHLER: ${ergebnis.grund}`);
            fehler++;
        } else {
            const symbol = ergebnis.versetzt ? '✅' : '❌';
            const status = ergebnis.versetzt ? 'VERSETZT' : 'NICHT VERSETZT';
            console.log(`${symbol} ${status}`);
            console.log(`Grund: ${ergebnis.grund}`);
            
            if (ergebnis.details) {
                console.log(`Durchschnitt: Alle=${ergebnis.details.durchschnitt_alle}, KF=${ergebnis.details.durchschnitt_kernfaecher}`);
                console.log(`Noten unter 4: ${ergebnis.details.anzahl_unter_4} (5en: ${ergebnis.details.anzahl_5}, 6en: ${ergebnis.details.anzahl_6})`);
            }

            if (ergebnis.versetzt) {
                anzahlVersetzt++;
            } else {
                anzahlNichtVersetzt++;
            }

            // Prüfe gegen erwartetes Ergebnis
            if (erwartet !== null && erwartet !== ergebnis.versetzt) {
                console.log(`⚠️  WARNUNG: Ergebnis weicht vom erwarteten ab!`);
                console.log(`   Erwartet: ${erwartet ? 'VERSETZT' : 'NICHT VERSETZT'}`);
            }
        }

        ergebnisse.push({
            name,
            versetzt: ergebnis.versetzt,
            grund: ergebnis.grund,
            durchschnitt_alle: ergebnis.details?.durchschnitt_alle,
            durchschnitt_kf: ergebnis.details?.durchschnitt_kernfaecher
        });
    }

    // Zusammenfassung
    console.log('\n' + '='.repeat(80));
    console.log('📊 ZUSAMMENFASSUNG');
    console.log('='.repeat(80));
    console.log(`Geprüfte Schüler: ${schueler.length}`);
    console.log(`✅ Versetzt: ${anzahlVersetzt}`);
    console.log(`❌ Nicht versetzt: ${anzahlNichtVersetzt}`);
    if (fehler > 0) {
        console.log(`⚠️  Fehler: ${fehler}`);
    }
    console.log(`Quote: ${((anzahlVersetzt / schueler.length) * 100).toFixed(1)}%`);
    console.log('='.repeat(80) + '\n');

    return ergebnisse;
}

/**
 * Exportiert Ergebnisse als CSV
 * @param {Array} ergebnisse - Array mit Prüfergebnissen
 * @param {string} outputPath - Pfad zur Ausgabedatei
 */
function exportiereErgebnisse(ergebnisse, outputPath) {
    try {
        const header = 'Name,Status,Grund,Durchschnitt_Alle,Durchschnitt_Kernfaecher\n';
        const rows = ergebnisse.map(e => {
            const status = e.versetzt === null ? 'FEHLER' : (e.versetzt ? 'VERSETZT' : 'NICHT_VERSETZT');
            const grund = e.grund.replace(/,/g, ';'); // Kommas in Grund ersetzen
            return `"${e.name}","${status}","${grund}",${e.durchschnitt_alle},${e.durchschnitt_kf}`;
        }).join('\n');

        fs.writeFileSync(outputPath, header + rows, 'utf-8');
        console.log(`✅ Ergebnisse exportiert nach: ${outputPath}\n`);
    } catch (error) {
        console.error(`Fehler beim Exportieren: ${error.message}`);
    }
}

// Hauptprogramm
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Verwendung: node csv_import.js <csv-datei> [<ausgabe-datei>]');
        console.log('\nBeispiel: node csv_import.js test_daten.csv ergebnisse.csv');
        process.exit(1);
    }

    const inputFile = args[0];
    const outputFile = args[1] || 'versetzung_ergebnisse.csv';

    console.log(`Lese CSV-Datei: ${inputFile}...`);
    const schueler = leseCSV(inputFile);
    console.log(`${schueler.length} Schüler gefunden.\n`);

    const ergebnisse = pruefeAlle(schueler);
    
    exportiereErgebnisse(ergebnisse, outputFile);
}

module.exports = { leseCSV, pruefeAlle, exportiereErgebnisse };
