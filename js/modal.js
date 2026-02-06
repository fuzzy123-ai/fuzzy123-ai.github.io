// ==================== MODAL FUNKTIONEN ====================
// Öffnet das Modal-Fenster mit der Step-by-Step Regelprüfung für einen Schüler

function openRegelModal(klassenName, schuelerIndex) {
    const klasse = alleKlassen[klassenName];
    if (!klasse) return;
    
    const schueler = klasse.schueler[schuelerIndex];
    if (!schueler) return;
    
    // Je nach Niveau die passende Detail-Funktion aufrufen
    const istGNiveau = schueler.niveau === 'G';
    const ergebnis = istGNiveau
        ? pruefeVersetzungGNiveauDetail(schueler.noten)
        : pruefeVersetzungMNiveauDetail(schueler.noten);
    
    // Modal-Header anpassen
    const modalHeader = document.querySelector('#regelModal .modal-header h3');
    modalHeader.textContent = istGNiveau
        ? '📋 Versetzungsprüfung G-Niveau'
        : '📋 Versetzungsprüfung M-Niveau';
    
    // Modal befüllen
    const modal = document.getElementById('regelModal');
    document.getElementById('modalSchuelerName').textContent = schueler.name;
    
    const gesamtSchnitt = berechneGesamtSchnitt(schueler.noten);
    const kernfachSchnitt = berechneHauptfachSchnitt(schueler.noten);
    
    if (istGNiveau) {
        // G-Niveau: Nur Gesamtschnitt anzeigen (keine Haupt/Nebenfach-Trennung)
        document.getElementById('modalSchnitteInfo').innerHTML = `
            <span class="schnitt-item">Ø Gesamt: <strong>${gesamtSchnitt || '-'}</strong></span>
            <span class="schnitt-item" style="background: #fff3e0; border-color: #ff9800;">G-Niveau</span>
        `;
    } else {
        document.getElementById('modalSchnitteInfo').innerHTML = `
            <span class="schnitt-item">Ø Gesamt: <strong>${gesamtSchnitt || '-'}</strong></span>
            <span class="schnitt-item">Ø Kernfach: <strong>${kernfachSchnitt || '-'}</strong></span>
        `;
    }
    
    // Noten-Übersicht mit Chips
    let notenHtml = '';
    const HAUPTFAECHER = [...KERNFAECHER, ...WAHLPFLICHTFAECHER];
    for (const fach of FACH_REIHENFOLGE) {
        if (schueler.noten[fach] !== undefined) {
            const note = schueler.noten[fach];
            const noteAnzeige = (schueler.notenAnzeige && schueler.notenAnzeige[fach])
                ? schueler.notenAnzeige[fach]
                : String(note);
            const istSchlecht = note >= 5;
            let chipClass;
            if (istGNiveau) {
                // G-Niveau: Alle Fächer sind maßgebend, kein Haupt/Nebenfach
                chipClass = 'nebenfach';
            } else {
                chipClass = HAUPTFAECHER.includes(fach) ? 'kernfach' : 'nebenfach';
            }
            if (istSchlecht) chipClass += ' schlecht';
            notenHtml += `<span class="noten-chip ${chipClass}">${fach}: ${noteAnzeige}</span>`;
        }
    }
    document.getElementById('modalNotenUebersicht').innerHTML = notenHtml;
    
    // Schritte rendern
    let schritteHtml = '';
    for (const schritt of ergebnis.schritte) {
        const icon = schritt.status === 'bestanden' ? '✓' : 
                    schritt.status === 'nicht-bestanden' ? '✗' :
                    schritt.status === 'ausgleich-noetig' ? '⚠' : '○';
        
        schritteHtml += `
            <li class="regel-schritt ${schritt.status}">
                <div class="regel-nummer">${schritt.nummer}</div>
                <div class="regel-inhalt">
                    <div class="regel-titel">${schritt.titel}</div>
                    <div class="regel-details">${schritt.details}</div>
                </div>
                <div class="regel-icon">${icon}</div>
            </li>
        `;
    }
    document.getElementById('modalRegelListe').innerHTML = schritteHtml;
    
    // Ergebnis-Box
    const ergebnisBox = document.getElementById('modalErgebnis');
    if (ergebnis.versetzt) {
        ergebnisBox.className = 'ergebnis-box versetzt';
        if (ergebnis.mukuAngewendet) {
            ergebnisBox.innerHTML = '✓ VERSETZT (MuKu-Beschluss)';
        } else {
            ergebnisBox.innerHTML = '✓ VERSETZT';
        }
    } else {
        ergebnisBox.className = 'ergebnis-box nicht-versetzt';
        ergebnisBox.innerHTML = `✗ NICHT VERSETZT (Regel ${ergebnis.stopBeiSchritt})`;
    }
    
    modal.classList.add('active');
}

function closeRegelModal() {
    document.getElementById('regelModal').classList.remove('active');
}

// Schließen bei Klick außerhalb des Modals
document.addEventListener('click', function(e) {
    const modal = document.getElementById('regelModal');
    if (e.target === modal) {
        closeRegelModal();
    }
});

// Schließen mit Escape-Taste
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeRegelModal();
    }
});
