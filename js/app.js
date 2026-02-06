// ==================== CSV PARSING ====================
function parseCSV(content, filename) {
    const lines = content.split('\n').filter(line => line.trim());
    
    // Erkenne Zeugnistyp (Halbjahresinformation vs Halbjahreszeugnis)
    let zeugnisTyp = 'Halbjahresinformation';
    for (const line of lines) {
        if (line.toLowerCase().includes('halbjahreszeugnis')) {
            zeugnisTyp = 'Halbjahreszeugnis';
            break;
        }
    }
    
    // Finde Klassenbezeichnung
    let klassenName = 'Unbekannte Klasse';
    let klassenstufe = 0;
    for (const line of lines) {
        let match = line.match(/(?:Klasse(?:ngruppe)?|Klassengr\.?)\s*[:;]?\s*(\d+)([a-zA-Z0-9_-]*)/i);
        if (match) {
            klassenstufe = parseInt(match[1]);
            klassenName = `Klasse ${match[1]}${match[2]}`;
            console.log(`Klasse erkannt: ${klassenName} aus Zeile: ${line.substring(0, 50)}`);
            break;
        }
    }
    
    if (klassenName === 'Unbekannte Klasse') {
        console.warn('Keine Klasse gefunden. Erste 10 Zeilen:', lines.slice(0, 10));
    }

    // Finde Header-Zeile
    let headerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(';D;') && lines[i].includes(';E;') && lines[i].includes(';M;')) {
            headerIndex = i;
            break;
        }
    }

    if (headerIndex === -1) {
        console.error(`Keine Header-Zeile gefunden in ${filename}`);
        return null;
    }

    const headerLine = lines[headerIndex];
    const columns = headerLine.split(';').map(c => c.trim());

    // Finde Fachspalten
    const fachSpalten = {};
    const gefundeneFaecher = [];
    
    for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        if (FACH_MAPPING[col]) {
            fachSpalten[col] = i;
            if (!gefundeneFaecher.includes(col)) {
                gefundeneFaecher.push(col);
            }
        }
    }

    // Finde Durchschnitt-Spalte
    let durchschnittIndex = -1;
    for (let i = 0; i < columns.length; i++) {
        if (columns[i].includes('Ø') || columns[i].includes('Durchschnitt')) {
            durchschnittIndex = i;
            break;
        }
    }

    // Finde Niveau-Spalte
    let niveauIndex = -1;
    for (let i = 0; i < columns.length; i++) {
        if (columns[i].toLowerCase() === 'niveau') {
            niveauIndex = i;
            break;
        }
    }
    
    // Erkenne Klassen-Niveau aus Klassenname
    let klassenNiveau = null;
    if (klassenName.includes('_G') || klassenName.toLowerCase().includes('gruppe') && klassenName.includes('G')) {
        klassenNiveau = 'G';
    } else if (klassenName.includes('_M')) {
        klassenNiveau = 'M';
    }

    // Finde Name-Spalte
    let nameIndex = 1;
    for (let i = 0; i < columns.length; i++) {
        if (columns[i].toLowerCase().includes('name')) {
            nameIndex = i;
            break;
        }
    }

    // Parse Schüler
    const schueler = [];
    for (let i = headerIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.toLowerCase().includes('fachdurchschnitt') || 
            line.includes('**') || 
            line.toLowerCase().includes('stand:')) {
            break;
        }

        const rowCols = line.split(';').map(c => c.trim());
        const name = rowCols[nameIndex] || '';
        
        if (!name || name === '') continue;

        // Durchschnitt aus Datei
        let durchschnittAusDatei = null;
        if (durchschnittIndex >= 0 && rowCols[durchschnittIndex]) {
            const dStr = rowCols[durchschnittIndex].replace(',', '.');
            const d = parseFloat(dStr);
            if (!isNaN(d)) {
                durchschnittAusDatei = d;
            }
        }

        // Niveau des Schülers
        let niveau = 'M';
        if (niveauIndex >= 0 && rowCols[niveauIndex]) {
            const niv = rowCols[niveauIndex].trim().toUpperCase();
            if (niv === 'G' || niv === 'M') {
                niveau = niv;
            }
        } else if (klassenNiveau) {
            niveau = klassenNiveau;
        }

        // Noten extrahieren
        const noten = {};
        const notenAnzeige = {};
        let hatNoten = false;

        for (const [fach, spalte] of Object.entries(fachSpalten)) {
            if (spalte < rowCols.length) {
                const noteStr = rowCols[spalte];
                const note = konvertiereNote(noteStr);
                if (note !== null) {
                    noten[fach] = note;
                    const anzeige = konvertiereNoteAnzeige(noteStr, zeugnisTyp);
                    if (anzeige !== null) {
                        notenAnzeige[fach] = anzeige;
                    }
                    hatNoten = true;
                }
            }
        }

        if (hatNoten) {
            const hauptfachSchnitt = berechneHauptfachSchnitt(noten);
            
            schueler.push({
                name,
                noten,
                notenAnzeige,
                niveau,
                durchschnittAusDatei,
                hauptfachSchnitt,
                status: pruefeGefaehrdung(noten, niveau)
            });
        }
    }

    // Sortiere Fächer nach Reihenfolge
    gefundeneFaecher.sort((a, b) => {
        const indexA = FACH_REIHENFOLGE.indexOf(a);
        const indexB = FACH_REIHENFOLGE.indexOf(b);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    return {
        klassenName,
        klassenstufe,
        zeugnisTyp,
        faecher: gefundeneFaecher,
        schueler,
        filename
    };
}

// ==================== FILE HANDLING ====================
function processFiles(files) {
    for (const file of files) {
        if (geladeneFiles.has(file.name)) continue;

        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const parsed = parseCSV(content, file.name);

            if (parsed && parsed.schueler.length > 0) {
                alleKlassen[parsed.klassenName] = parsed;
                geladeneFiles.add(file.name);
                updateFileList();
                renderAlles();
            }
        };
        reader.readAsText(file, 'UTF-8');
    }
}

function handleFileSelect(event) {
    const files = event.target.files;
    processFiles(files);
}

function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('csvFiles');

    if (!uploadArea || !fileInput) return;

    uploadArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (event) => {
        event.preventDefault();
        uploadArea.classList.remove('dragover');
        if (event.dataTransfer && event.dataTransfer.files) {
            processFiles(event.dataTransfer.files);
        }
    });
}

function updateFileList() {
    const container = document.getElementById('fileList');
    container.innerHTML = '';
    
    for (const filename of geladeneFiles) {
        const tag = document.createElement('div');
        tag.className = 'file-tag';
        tag.innerHTML = `
            📄 ${filename}
            <span class="remove" onclick="removeFile('${filename}')">×</span>
        `;
        container.appendChild(tag);
    }
}

function removeFile(filename) {
    geladeneFiles.delete(filename);
    
    for (const [klasse, data] of Object.entries(alleKlassen)) {
        if (data.filename === filename) {
            delete alleKlassen[klasse];
        }
    }
    
    updateFileList();
    renderAlles();
}

document.addEventListener('DOMContentLoaded', setupDragAndDrop);

// ==================== RENDERING ====================
let filterAktiv = false;

function toggleFilter() {
    filterAktiv = !filterAktiv;
    const btn = document.getElementById('filterBtn');
    const container = document.getElementById('klassenContainer');
    
    if (filterAktiv) {
        btn.classList.add('active');
        btn.innerHTML = '✅ Alle Schüler anzeigen';
        container.classList.add('hide-ok');
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '⚠️ Nur problematische Schüler anzeigen';
        container.classList.remove('hide-ok');
    }
}

function renderAlles() {
    const container = document.getElementById('klassenContainer');
    const noData = document.getElementById('noData');
    const summary = document.getElementById('summary');
    const filterSection = document.getElementById('filterSection');
    
    const klassenListe = Object.keys(alleKlassen).sort();
    
    if (klassenListe.length === 0) {
        container.innerHTML = '';
        noData.style.display = 'block';
        summary.style.display = 'none';
        filterSection.style.display = 'none';
        return;
    }

    noData.style.display = 'none';
    summary.style.display = 'block';
    filterSection.style.display = 'flex';

    // Gesamtstatistik
    let gesamtSchueler = 0;
    let gesamtNichtVersetzt = 0;
    let gesamtGefaehrdet = 0;
    let gesamtMNiveau = 0;
    let gesamtGNiveau = 0;
    
    for (const klasse of klassenListe) {
        const data = alleKlassen[klasse];
        gesamtSchueler += data.schueler.length;
        gesamtNichtVersetzt += data.schueler.filter(s => s.status === 'nicht-versetzt').length;
        gesamtGefaehrdet += data.schueler.filter(s => s.status === 'gefaehrdet').length;
        gesamtMNiveau += data.schueler.filter(s => s.niveau === 'M').length;
        gesamtGNiveau += data.schueler.filter(s => s.niveau === 'G').length;
    }

    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${klassenListe.length}</div>
            <div class="stat-label">Klassen</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${gesamtSchueler}</div>
            <div class="stat-label">Schüler gesamt</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" style="color: #667eea;">${gesamtMNiveau}</div>
            <div class="stat-label">M-Niveau</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" style="color: #ff9800;">${gesamtGNiveau}</div>
            <div class="stat-label">G-Niveau</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" style="color: #f44336;">${gesamtNichtVersetzt}</div>
            <div class="stat-label">Nicht versetzt</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" style="color: #ff9800;">${gesamtGefaehrdet}</div>
            <div class="stat-label">Gefährdet</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" style="color: #4CAF50;">${gesamtSchueler - gesamtNichtVersetzt - gesamtGefaehrdet}</div>
            <div class="stat-label">Versetzt</div>
        </div>
    `;

    // Klassen rendern
    let html = '';
    for (const klasse of klassenListe) {
        html += renderKlasse(klasse, alleKlassen[klasse]);
    }
    container.innerHTML = html;
}

function renderKlasse(klassenName, data) {
    const nichtVersetztCount = data.schueler.filter(s => s.status === 'nicht-versetzt').length;
    const gefaehrdeteCount = data.schueler.filter(s => s.status === 'gefaehrdet').length;
    const zeugnisInfo = data.zeugnisTyp || 'Halbjahresinformation';
    
    const niveaus = [...new Set(data.schueler.map(s => s.niveau))];
    let klassenNiveau = 'M';
    let headerClass = '';
    let niveauBadge = '';
    
    if (niveaus.length === 1) {
        klassenNiveau = niveaus[0];
        if (klassenNiveau === 'G') {
            headerClass = 'g-niveau';
            niveauBadge = '<span class="niveau-badge g-niveau">G</span>';
        } else {
            niveauBadge = '<span class="niveau-badge m-niveau">M</span>';
        }
    } else {
        headerClass = 'gemischt';
        niveauBadge = '<span class="niveau-badge m-niveau">M</span><span class="niveau-badge g-niveau">G</span>';
    }
    
    const hatGemischteNiveaus = niveaus.length > 1;
    
    let html = `
        <div class="klasse-container">
            <div class="klasse-header ${headerClass}">
                <h2>📚 ${klassenName} ${niveauBadge}</h2>
                <div class="klasse-stats">
                    <span>📄 ${zeugnisInfo}</span>
                    <span>👥 ${data.schueler.length} Schüler</span>
                    <span style="background: ${nichtVersetztCount > 0 ? 'rgba(244,67,54,0.3)' : gefaehrdeteCount > 0 ? 'rgba(255,152,0,0.3)' : 'rgba(76,175,80,0.3)'};">
                        ❌ ${nichtVersetztCount} n.v. • ⚠️ ${gefaehrdeteCount} gef.
                    </span>
                </div>
            </div>
            <div class="noten-tabelle-container">
                <table class="noten-tabelle">
                    <thead>
                        <tr>
                            <th class="name-col">Name</th>
                            ${hatGemischteNiveaus ? '<th class="niveau-col">Niv.</th>' : ''}
    `;

    // Fach-Header
    for (const fach of data.faecher) {
        const istHauptfach = KERNFAECHER.includes(fach) || WAHLPFLICHTFAECHER.includes(fach);
        const istNurPositiv = WAHLFACH_NUR_POSITIV.includes(fach);
        let cssClass = istHauptfach ? 'hauptfach' : '';
        let title = FACH_MAPPING[fach] || fach;
        if (istNurPositiv) {
            title += ' (zählt nur positiv)';
        }
        html += `<th class="${cssClass}" title="${title}">${fach}</th>`;
    }

    html += `
                            <th class="durchschnitt">Ø Alle</th>
                            <th class="durchschnitt">Ø HF</th>
                            <th>Status</th>
                            <th>Prüfung</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    // Schüler-Zeilen
    for (const schueler of data.schueler) {
        const rowClass = schueler.status === 'nicht-versetzt' ? 'nicht-versetzt' : (schueler.status === 'gefaehrdet' ? 'gefaehrdet' : '');
        const niveauClass = schueler.niveau === 'G' ? 'g-niveau' : 'm-niveau';
        
        html += `<tr class="${rowClass}">`;
        html += `<td class="name-col">${schueler.name}</td>`;
        
        if (hatGemischteNiveaus) {
            html += `<td><span class="niveau-badge ${niveauClass}">${schueler.niveau}</span></td>`;
        }

        // Noten
        for (const fach of data.faecher) {
            const note = schueler.noten[fach];
            if (note !== undefined) {
                let noteClass = `note note-${note}`;
                if (WAHLFACH_NUR_POSITIV.includes(fach) && note >= 5) {
                    noteClass = 'note note-inf-ignoriert';
                }
                const noteAnzeige = (schueler.notenAnzeige && schueler.notenAnzeige[fach])
                    ? schueler.notenAnzeige[fach]
                    : String(note);
                html += `<td><span class="${noteClass}">${noteAnzeige}</span></td>`;
            } else {
                html += `<td><span class="note leer">-</span></td>`;
            }
        }

        // Durchschnitt
        if (schueler.durchschnittAusDatei !== null) {
            const dClass = getDurchschnittClass(schueler.durchschnittAusDatei);
            html += `<td><span class="durchschnitt ${dClass}">${schueler.durchschnittAusDatei.toFixed(1)}</span></td>`;
        } else {
            html += `<td>-</td>`;
        }

        // Hauptfachschnitt
        if (schueler.hauptfachSchnitt !== null) {
            const hfClass = getDurchschnittClass(parseFloat(schueler.hauptfachSchnitt));
            html += `<td><span class="durchschnitt ${hfClass}">${schueler.hauptfachSchnitt}</span></td>`;
        } else {
            html += `<td>-</td>`;
        }

        // Status
        if (schueler.status === 'nicht-versetzt') {
            html += `<td><span class="status-badge nicht-versetzt">❌ Nicht versetzt</span></td>`;
        } else if (schueler.status === 'gefaehrdet') {
            html += `<td><span class="status-badge gefaehrdet">⚠️ Gefährdet</span></td>`;
        } else {
            html += `<td><span class="status-badge versetzt">✓ Versetzt</span></td>`;
        }

        // Prüfen-Button für M-Niveau und G-Niveau
        html += `<td><button class="btn-pruefen" onclick="openRegelModal('${klassenName}', ${data.schueler.indexOf(schueler)})">Regeln prüfen</button></td>`;

        html += `</tr>`;
    }

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    return html;
}

function getDurchschnittClass(d) {
    if (d <= 2.5) return 'gut';
    if (d <= 3.5) return 'ok';
    return 'kritisch';
}
