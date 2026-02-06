/**
 * Parser für Notenprogramm CSV-Export
 * Erkennt automatisch Fächerspalten und konvertiert Notenwerte
 */

const fs = require('fs');
const { VersetzungsPruefer } = require('./versetzungspruefung.js');

/**
 * Konvertiert Notenwerte aus dem Notenprogramm in Ganzzahlen
 * Behandelt Formate wie: "2-3", "3+", "4-5", "--", "X", "1-2"
 */
function konvertiereNote(noteStr) {
    if (!noteStr || noteStr.trim() === '' || noteStr === '--' || noteStr.toLowerCase() === 'x') {
        return null; // Keine Note vorhanden
    }

    const cleaned = noteStr.trim();

    // Exakte Noten: "1", "2", "3", "4", "5", "6"
    if (/^[1-6]$/.test(cleaned)) {
        return parseInt(cleaned);
    }

    // Tendenz-Noten: "2+", "3-", "2-3", "1-2", "4-5"
    // Strategie: 
    // - "2+" oder "2-" → 2
    // - "2-3" → Durchschnitt 2.5 → aufrunden zu 3
    // - "1-2" → Durchschnitt 1.5 → aufrunden zu 2

    // Format: "X-Y" (z.B. "2-3", "4-5")
    const rangeMatch = cleaned.match(/^([1-6])-([1-6])$/);
    if (rangeMatch) {
        const note1 = parseInt(rangeMatch[1]);
        const note2 = parseInt(rangeMatch[2]);
        const durchschnitt = (note1 + note2) / 2;
        return Math.round(durchschnitt); // Aufrunden/Abrunden zum nächsten Ganzzahl
    }

    // Format: "X+" oder "X-" (z.B. "2+", "3-")
    const tendenzMatch = cleaned.match(/^([1-6])[-+]$/);
    if (tendenzMatch) {
        return parseInt(tendenzMatch[1]); // Tendenz ignorieren, nur Hauptnote zählt
    }

    // Wenn nichts passt, versuche als Zahl zu parsen
    const parsed = parseInt(cleaned);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 6) {
        return parsed;
    }

    console.warn(`Warnung: Konnte Note "${noteStr}" nicht interpretieren`);
    return null;
}

/**
 * Findet die Header-Zeile mit Fächern
 */
function findeHeaderZeile(lines) {
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Header enthält typischerweise "D;E;M" (Kernfächer)
        if (line.includes(';D;') && line.includes(';E;') && line.includes(';M;')) {
            return i;
        }
    }
    throw new Error('Konnte Header-Zeile mit Fächern nicht finden (D, E, M erwartet)');
}

/**
 * Extrahiert Fächerspalten aus dem Header
 */
function extrahiereFaecher(headerLine) {
    const columns = headerLine.split(';').map(c => c.trim());
    
    // Mapping: Kurzform → Langform
    const fachMapping = {
        'D': 'Deutsch',
        'E': 'Englisch',
        'M': 'Mathematik',
        'GEO': 'Geographie',
        'MUS': 'Musik',
        'BK': 'Bildende Kunst',
        'SPO': 'Sport',
        'BIO': 'Biologie',
        'IuM': 'Informatik',
        'ETH': 'Ethik',
        'RRK': 'Katholische Religion',
        'REV': 'Evangelische Religion',
        'PHY': 'Physik',
        'CH': 'Chemie',
        'GES': 'Geschichte',
        'EK': 'Erdkunde',
        'WBS': 'Wirtschaft',
        'AES': 'AES',
        'T': 'Technik',
        'F': 'Französisch'
    };

    const faecher = [];
    
    for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        
        // Prüfe ob es ein bekanntes Fach ist
        if (fachMapping[col]) {
            faecher.push({
                index: i,
                kurzform: col,
                langform: fachMapping[col]
            });
        }
    }

    if (faecher.length === 0) {
        throw new Error('Keine Fachspalten gefunden');
    }

    // Prüfe ob Kernfächer vorhanden sind
    const hatDeutsch = faecher.some(f => f.kurzform === 'D');
    const hatEnglisch = faecher.some(f => f.kurzform === 'E');
    const hatMathe = faecher.some(f => f.kurzform === 'M');

    if (!hatDeutsch || !hatEnglisch || !hatMathe) {
        throw new Error('Kernfächer (D, E, M) müssen vorhanden sein');
    }

    return faecher;
}

/**
 * Parst eine Schülerzeile
 */
function parseSchuelerZeile(line, faecher, nameIndex) {
    const columns = line.split(';').map(c => c.trim());
    
    // Name extrahieren (typischerweise in Spalte 1: "Nachname, Vorname")
    const name = columns[nameIndex] || '';
    if (!name || name === '' || name.toLowerCase().includes('fachdurchschnitt')) {
        return null; // Leere Zeile oder Zusammenfassungszeile
    }

    // Noten extrahieren
    const noten = {};
    let hatNoten = false;

    for (const fach of faecher) {
        if (fach.index < columns.length) {
            const noteStr = columns[fach.index];
            const note = konvertiereNote(noteStr);
            
            if (note !== null) {
                noten[fach.langform] = note;
                hatNoten = true;
            }
        }
    }

    if (!hatNoten) {
        return null; // Keine Noten vorhanden
    }

    return {
        name,
        noten
    };
}

/**
 * Liest und parst die CSV-Datei aus dem Notenprogramm
 */
function leseNotenprogrammCSV(filePath) {
    try {
        console.log(`\n📖 Lese CSV-Datei: ${filePath}`);
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            throw new Error('CSV-Datei zu kurz');
        }

        // 1. Finde Header-Zeile
        const headerIndex = findeHeaderZeile(lines);
        console.log(`✓ Header-Zeile gefunden: Zeile ${headerIndex + 1}`);
        
        const headerLine = lines[headerIndex];
        
        // 2. Extrahiere Fächer
        const faecher = extrahiereFaecher(headerLine);
        console.log(`✓ ${faecher.length} Fächer erkannt:`);
        console.log(`  Kernfächer: ${faecher.filter(f => ['D', 'E', 'M'].includes(f.kurzform)).map(f => f.langform).join(', ')}`);
        console.log(`  Weitere: ${faecher.filter(f => !['D', 'E', 'M'].includes(f.kurzform)).map(f => f.kurzform).join(', ')}`);
        
        // 3. Finde Name-Spalte (typischerweise Index 1)
        const headerColumns = headerLine.split(';');
        const nameIndex = headerColumns.findIndex(c => 
            c.toLowerCase().includes('name') || c.toLowerCase().includes('vorname')
        );
        
        if (nameIndex === -1) {
            throw new Error('Konnte Name-Spalte nicht finden');
        }

        // 4. Parse Schülerzeilen (ab Header+1 bis Ende oder bis Zusammenfassung)
        const schueler = [];
        for (let i = headerIndex + 1; i < lines.length; i++) {
            const line = lines[i];
            
            // Stoppe bei Zusammenfassungszeilen
            if (line.includes('Fachdurchschnitt') || line.includes('**') || line.includes('Stand:')) {
                break;
            }

            const schuelerData = parseSchuelerZeile(line, faecher, nameIndex);
            if (schuelerData) {
                schueler.push(schuelerData);
            }
        }

        console.log(`✓ ${schueler.length} Schüler mit Noten gefunden\n`);
        
        return {
            schueler,
            faecher: faecher.map(f => f.langform)
        };

    } catch (error) {
        console.error(`❌ Fehler beim Parsen der CSV: ${error.message}`);
        throw error;
    }
}

/**
 * Prüft alle Schüler und gibt Ergebnisse aus
 */
function pruefeAlleSchueler(schueler) {
    const pruefer = new VersetzungsPruefer();
    
    console.log('='.repeat(80));
    console.log('🎓 VERSETZUNGSPRÜFUNG M-NIVEAU - BATCH-VERARBEITUNG');
    console.log('='.repeat(80) + '\n');

    let anzahlVersetzt = 0;
    let anzahlNichtVersetzt = 0;
    let fehler = 0;
    let kritischeFaelle = [];

    const ergebnisse = [];

    for (let i = 0; i < schueler.length; i++) {
        const { name, noten } = schueler[i];
        
        console.log(`\n📝 Schüler ${i + 1}/${schueler.length}: ${name}`);
        console.log('-'.repeat(80));

        // Zeige Noten
        const kernfaecher = ['Deutsch', 'Mathematik', 'Englisch'];
        console.log('Kernfächer:');
        for (const fach of kernfaecher) {
            if (noten[fach] !== undefined) {
                console.log(`  ${fach}: ${noten[fach]}`);
            }
        }
        
        const andereFaecher = Object.keys(noten).filter(f => !kernfaecher.includes(f));
        if (andereFaecher.length > 0) {
            console.log('Weitere Fächer:');
            for (const fach of andereFaecher) {
                console.log(`  ${fach}: ${noten[fach]}`);
            }
        }

        // Prüfe Versetzung
        const ergebnis = pruefer.pruefeVersetzung(noten);

        // Ausgabe
        if (ergebnis.versetzt === null) {
            console.log(`⚠️  FEHLER: ${ergebnis.grund}`);
            fehler++;
        } else {
            const symbol = ergebnis.versetzt ? '✅' : '❌';
            const status = ergebnis.versetzt ? 'VERSETZT' : 'NICHT VERSETZT';
            console.log(`\n${symbol} ${status}`);
            console.log(`Grund: ${ergebnis.grund}`);
            
            if (ergebnis.details) {
                console.log(`Ø Alle Fächer: ${ergebnis.details.durchschnitt_alle} | Ø Kernfächer: ${ergebnis.details.durchschnitt_kernfaecher}`);
                console.log(`Noten unter 4: ${ergebnis.details.anzahl_unter_4} (5en: ${ergebnis.details.anzahl_5}, 6en: ${ergebnis.details.anzahl_6})`);
            }

            if (ergebnis.versetzt) {
                anzahlVersetzt++;
                
                // Kritische Fälle: Versetzt aber knapp
                if (ergebnis.details.anzahl_unter_4 > 0) {
                    kritischeFaelle.push({
                        name,
                        grund: ergebnis.grund,
                        anzahl_unter_4: ergebnis.details.anzahl_unter_4
                    });
                }
            } else {
                anzahlNichtVersetzt++;
            }
        }

        ergebnisse.push({
            name,
            versetzt: ergebnis.versetzt,
            grund: ergebnis.grund,
            durchschnitt_alle: ergebnis.details?.durchschnitt_alle,
            durchschnitt_kf: ergebnis.details?.durchschnitt_kernfaecher,
            anzahl_unter_4: ergebnis.details?.anzahl_unter_4
        });
    }

    // Zusammenfassung
    console.log('\n' + '='.repeat(80));
    console.log('📊 ZUSAMMENFASSUNG');
    console.log('='.repeat(80));
    console.log(`Geprüfte Schüler: ${schueler.length}`);
    console.log(`✅ Versetzt: ${anzahlVersetzt} (${((anzahlVersetzt / schueler.length) * 100).toFixed(1)}%)`);
    console.log(`❌ Nicht versetzt: ${anzahlNichtVersetzt} (${((anzahlNichtVersetzt / schueler.length) * 100).toFixed(1)}%)`);
    
    if (fehler > 0) {
        console.log(`⚠️  Fehler: ${fehler}`);
    }

    // Kritische Fälle
    if (kritischeFaelle.length > 0) {
        console.log(`\n⚠️  Kritische Fälle (versetzt mit mangelhaften Noten): ${kritischeFaelle.length}`);
        for (const fall of kritischeFaelle) {
            console.log(`  - ${fall.name}: ${fall.anzahl_unter_4}x unter 4`);
        }
    }
    
    console.log('='.repeat(80) + '\n');

    return ergebnisse;
}

/**
 * Exportiert Ergebnisse als CSV
 */
function exportiereErgebnisse(ergebnisse, outputPath) {
    try {
        let csv = 'Name;Status;Grund;Durchschnitt_Alle;Durchschnitt_Kernfaecher;Noten_unter_4\n';
        
        for (const e of ergebnisse) {
            const status = e.versetzt === null ? 'FEHLER' : (e.versetzt ? 'VERSETZT' : 'NICHT_VERSETZT');
            const grund = (e.grund || '').replace(/;/g, ',').replace(/"/g, ''); // Semikolons und Quotes entfernen
            const oa = e.durchschnitt_alle || '-';
            const ok = e.durchschnitt_kf || '-';
            const nu4 = e.anzahl_unter_4 !== undefined ? e.anzahl_unter_4 : '-';
            
            csv += `"${e.name}";${status};"${grund}";${oa};${ok};${nu4}\n`;
        }

        fs.writeFileSync(outputPath, csv, 'utf-8');
        console.log(`✅ Ergebnisse exportiert nach: ${outputPath}\n`);
    } catch (error) {
        console.error(`❌ Fehler beim Exportieren: ${error.message}`);
    }
}

// Hauptprogramm
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('\n🎓 Versetzungsprüfung - CSV-Import aus Notenprogramm\n');
        console.log('Verwendung: node notenprogramm_import.js <csv-datei> [<ausgabe-datei>]\n');
        console.log('Beispiel: node notenprogramm_import.js TestNoten.CSV versetzung_ergebnisse.csv\n');
        console.log('Unterstützt werden:');
        console.log('  - Automatische Facherkennung (beliebige Reihenfolge)');
        console.log('  - Notenformate: 1-6, 2-3, 3+, 4-, --');
        console.log('  - Kernfächer: D (Deutsch), E (Englisch), M (Mathematik)');
        console.log('  - Weitere Fächer werden automatisch erkannt\n');
        process.exit(1);
    }

    const inputFile = args[0];
    const outputFile = args[1] || 'versetzung_ergebnisse.csv';

    try {
        const { schueler } = leseNotenprogrammCSV(inputFile);
        const ergebnisse = pruefeAlleSchueler(schueler);
        exportiereErgebnisse(ergebnisse, outputFile);
    } catch (error) {
        console.error(`\n❌ Fehler: ${error.message}\n`);
        process.exit(1);
    }
}

module.exports = { leseNotenprogrammCSV, konvertiereNote, pruefeAlleSchueler, exportiereErgebnisse };
