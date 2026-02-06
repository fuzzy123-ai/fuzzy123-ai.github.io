// ==========================================================================
// VERSETZUNGSREGELN M-NIVEAU (Realschul-Niveau)
// Basierend auf: Versetzungsordnung vom 19. April 2016
// Realschule Baden-Württemberg
// ==========================================================================
//
// DIESE REGELN DÜRFEN NUR MIT AUSDRÜCKLICHER GENEHMIGUNG GEÄNDERT WERDEN!
//
// Kernfächer (Hauptfächer): D (Deutsch), M (Mathematik), E (Englisch),
//                           + WPF: T (Technik) ODER F (Französisch) ODER AES
//
// "Schlechter als 4,0" bedeutet: Note 5 oder 6 (also ab 4,1 aufwärts)
// In ganzen Noten: Note >= 5
//
// Reihenfolge der Prüfung:
//   1. Gesamtschnitt aller maßgebenden Fächer ≤ 4,0
//   2. Kernfächerschnitt (D, M, E, WPF) ≤ 4,0
//   3. Keine 6 in Kernfächern
//   4. Maximal 3 Noten schlechter als 4,0
//   5. Maximal 1 Note schlechter als 4,0 → sofort versetzt
//   6. 2-3 Noten unter 4,0 → Ausgleich für ALLE erforderlich:
//      7a. 6 in Nicht-Kernfach → Ausgleich: 1×1 oder 2×2
//      7b. 5 in Nicht-Kernfach → Ausgleich: 1×2 oder 2×3
//      7c. 5 in Kernfach → Ausgleich: 1×2 in Kernfach
// ==========================================================================

/**
 * Prüft ob ein M-Niveau Schüler gefährdet ist (true = gefährdet/nicht versetzt).
 * Nutzt intern die Detail-Funktion und gibt nur das Ergebnis zurück.
 * 
 * @param {Object} noten - Objekt mit Fachkürzeln als Key und Note (1-6) als Wert
 * @returns {boolean} true = gefährdet (nicht versetzt), false = nicht gefährdet (versetzt)
 */
function pruefeGefaehrdungMNiveau(noten) {
    const ergebnis = pruefeVersetzungMNiveauDetail(noten);
    return !ergebnis.versetzt;
}

/**
 * Detaillierte Versetzungsprüfung für M-Niveau.
 * Geht alle Regeln der Reihe nach durch und gibt detaillierte Informationen zurück.
 * Diese Funktion wird sowohl für die Gefährdungsprüfung als auch für das UI-Modal verwendet.
 * 
 * @param {Object} noten - Objekt mit Fachkürzeln als Key und Note (1-6) als Wert
 * @returns {Object} Ergebnis mit:
 *   - versetzt {boolean}: Ob der Schüler versetzt wird
 *   - schritte {Array}: Array mit allen geprüften Regelschritten
 *   - stopBeiSchritt {number|string|null}: Bei welcher Regel gestoppt wurde
 *   - schlechteNotenGesamt {number}: Gesamtanzahl der Noten >= 5
 */
function pruefeVersetzungMNiveauDetail(noten) {
    // Alle Hauptfächer: D, E, M + Wahlpflichtfach (T, F oder AES)
    const HAUPTFAECHER = [...KERNFAECHER, ...WAHLPFLICHTFAECHER];
    
    // Array für die einzelnen Prüfungsschritte (wird im UI angezeigt)
    const schritte = [];
    
    // Ergebnis - wird auf false gesetzt sobald eine Regel nicht bestanden wird
    let versetzt = true;
    
    // Bei welcher Regel wurde gestoppt? null = alle bestanden
    let stopBeiSchritt = null;
    
    // =======================================================================
    // DATEN SAMMELN
    // Bevor die Regeln geprüft werden, sammeln wir alle relevanten Daten
    // =======================================================================
    
    // Schnitte berechnen
    const gesamtSchnitt = parseFloat(berechneGesamtSchnitt(noten)) || 0;
    const kernfachSchnitt = parseFloat(berechneHauptfachSchnitt(noten)) || 0;
    
    // Zähler für schlechte Noten (Note 5 oder 6)
    let schlechteNotenGesamt = 0;       // Alle Fächer zusammen
    let schlechteNotenKernfach = 0;     // Nur in Kernfächern (D, M, E, WPF)
    let schlechteNotenNebenfach = 0;    // Nur in Nebenfächern
    
    // Detaillierte Zähler für 5er und 6er
    let sechserKernfach = 0;            // Anzahl 6er in Kernfächern
    let fuenferKernfach = 0;            // Anzahl 5er in Kernfächern
    let sechserNebenfach = 0;           // Anzahl 6er in Nebenfächern
    let fuenferNebenfach = 0;           // Anzahl 5er in Nebenfächern
    
    // Zähler für Ausgleichsnoten (werden für Regeln 7a-7c benötigt)
    let einserGesamt = 0;               // Note 1 in allen Fächern
    let zweierGesamt = 0;               // Note 2 in allen Fächern
    let dreierGesamt = 0;               // Note 3 in allen Fächern
    let zweierKernfach = 0;             // Note 2 nur in Kernfächern
    
    // Alle Noten durchgehen und Zähler füllen
    for (const [fach, note] of Object.entries(noten)) {
        // Informatik (INF) bei schlechten Noten (>= 4) komplett ignorieren
        // INF zählt NUR POSITIV - schlechte Noten können nicht schaden
        if (WAHLFACH_NUR_POSITIV.includes(fach) && note >= 4) {
            continue;
        }
        
        // Prüfe ob das Fach ein Kernfach/Hauptfach ist
        const istKernfach = KERNFAECHER.includes(fach) || WAHLPFLICHTFAECHER.includes(fach);
        
        // Schlechte Noten zählen (Note 5 oder 6 = schlechter als 4,0)
        if (note >= 5) {
            schlechteNotenGesamt++;
            if (istKernfach) {
                schlechteNotenKernfach++;
                if (note === 6) sechserKernfach++;
                else fuenferKernfach++;
            } else {
                schlechteNotenNebenfach++;
                if (note === 6) sechserNebenfach++;
                else fuenferNebenfach++;
            }
        }
        
        // Ausgleichsnoten zählen (werden für Regeln 7a-7c benötigt)
        if (note === 1) einserGesamt++;
        if (note === 2) {
            zweierGesamt++;
            if (istKernfach) zweierKernfach++;
        }
        if (note === 3) dreierGesamt++;
    }
    
    // =======================================================================
    // REGEL 1: Gesamtschnitt aller maßgebenden Fächer ≤ 4,0
    // Wenn der Gesamtschnitt schlechter als 4,0 ist → NICHT VERSETZT
    // INF wird im Schnitt nur berücksichtigt wenn die Note gut ist (≤ 3)
    // =======================================================================
    const regel1Bestanden = gesamtSchnitt <= 4.0;
    schritte.push({
        nummer: 1,
        titel: 'Gesamtschnitt aller maßgebenden Fächer ≤ 4,0',
        details: `Gesamtschnitt: <span class="wert">${gesamtSchnitt.toFixed(2)}</span> ${regel1Bestanden ? '≤' : '>'} 4,0`,
        wert: gesamtSchnitt,
        bestanden: regel1Bestanden,
        status: regel1Bestanden ? 'bestanden' : 'nicht-bestanden'
    });
    
    if (!regel1Bestanden) {
        versetzt = false;
        stopBeiSchritt = 1;
    }
    
    // =======================================================================
    // REGEL 2: Kernfächerschnitt (D, M, E, WPF) ≤ 4,0
    // Wenn der Schnitt der vier Hauptfächer schlechter als 4,0 ist → NICHT VERSETZT
    // =======================================================================
    const regel2Bestanden = stopBeiSchritt ? null : (kernfachSchnitt <= 4.0);
    schritte.push({
        nummer: 2,
        titel: 'Kernfächerschnitt (D, M, E, WPF) ≤ 4,0',
        details: `Kernfachschnitt: <span class="wert">${kernfachSchnitt.toFixed(2)}</span> ${regel2Bestanden === null ? '' : (regel2Bestanden ? '≤' : '>')} 4,0`,
        wert: kernfachSchnitt,
        bestanden: regel2Bestanden,
        status: stopBeiSchritt ? 'nicht-geprueft' : (regel2Bestanden ? 'bestanden' : 'nicht-bestanden')
    });
    
    if (regel2Bestanden === false) {
        versetzt = false;
        stopBeiSchritt = 2;
    }
    
    // =======================================================================
    // REGEL 3: Keine 6 in Kernfächern (D, M, E, WPF)
    // Eine 6 in einem Hauptfach kann NICHT ausgeglichen werden → NICHT VERSETZT
    // =======================================================================
    const regel3Bestanden = stopBeiSchritt ? null : (sechserKernfach === 0);
    schritte.push({
        nummer: 3,
        titel: 'Keine 6 in Kernfächern (D, M, E, WPF)',
        details: `6er in Kernfächern: <span class="wert ${sechserKernfach > 0 ? 'highlight-schlecht' : 'highlight-gut'}">${sechserKernfach}</span>`,
        wert: sechserKernfach,
        bestanden: regel3Bestanden,
        status: stopBeiSchritt ? 'nicht-geprueft' : (regel3Bestanden ? 'bestanden' : 'nicht-bestanden')
    });
    
    if (regel3Bestanden === false) {
        versetzt = false;
        stopBeiSchritt = 3;
    }
    
    // =======================================================================
    // REGEL 4: Maximal 3 Noten schlechter als 4,0 (Note 5 oder 6)
    // Bei mehr als 3 schlechten Noten gibt es KEINE Ausgleichsmöglichkeit → NICHT VERSETZT
    // =======================================================================
    const regel4Bestanden = stopBeiSchritt ? null : (schlechteNotenGesamt <= 3);
    schritte.push({
        nummer: 4,
        titel: 'Maximal 3 Noten schlechter als 4,0 (Note 5 oder 6)',
        details: `Noten schlechter als 4: <span class="wert ${schlechteNotenGesamt > 3 ? 'highlight-schlecht' : ''}">${schlechteNotenGesamt}</span> (Kernfach: ${schlechteNotenKernfach}, Nebenfach: ${schlechteNotenNebenfach})`,
        wert: schlechteNotenGesamt,
        bestanden: regel4Bestanden,
        status: stopBeiSchritt ? 'nicht-geprueft' : (regel4Bestanden ? 'bestanden' : 'nicht-bestanden')
    });
    
    if (regel4Bestanden === false) {
        versetzt = false;
        stopBeiSchritt = 4;
    }
    
    // =======================================================================
    // REGEL 5: Maximal 1 Note schlechter als 4,0 → Direkt VERSETZT
    // Wenn es 0 oder 1 schlechte Note gibt, ist der Schüler automatisch versetzt
    // Bei 2 oder 3 schlechten Noten → weiter zur Ausgleichsprüfung
    // =======================================================================
    const regel5Bestanden = stopBeiSchritt ? null : (schlechteNotenGesamt <= 1);
    schritte.push({
        nummer: 5,
        titel: 'Maximal 1 Note schlechter als 4,0 → Versetzt',
        details: `Noten schlechter als 4: <span class="wert">${schlechteNotenGesamt}</span> ${regel5Bestanden ? '→ Direkt versetzt' : '→ Ausgleichsprüfung erforderlich'}`,
        wert: schlechteNotenGesamt,
        bestanden: regel5Bestanden,
        status: stopBeiSchritt ? 'nicht-geprueft' : (regel5Bestanden ? 'bestanden' : 'ausgleich-noetig')
    });
    
    // Bei 0 oder 1 schlechter Note: Sofort versetzt, keine weiteren Prüfungen
    if (regel5Bestanden) {
        return { versetzt: true, schritte, stopBeiSchritt: null, schlechteNotenGesamt };
    }
    
    // =======================================================================
    // REGEL 6: 2-3 Noten unter 4,0 → Ausgleich für ALLE Fächer erforderlich
    // Ab hier wird geprüft ob die schlechten Noten ausgeglichen werden können
    // =======================================================================
    if (!stopBeiSchritt && schlechteNotenGesamt >= 2 && schlechteNotenGesamt <= 3) {
        schritte.push({
            nummer: 6,
            titel: '2-3 Noten unter 4,0 → Ausgleich für ALLE erforderlich',
            details: `${schlechteNotenGesamt} schlechte Noten müssen ausgeglichen werden`,
            wert: schlechteNotenGesamt,
            bestanden: null,
            status: 'ausgleich-noetig'
        });
        
        // ===================================================================
        // REGEL 7a: 6 in Nicht-Kernfach → Ausgleich erforderlich
        // Für jede 6 in einem Nebenfach braucht man:
        //   - 1× Note 1 in einem maßgebenden Fach, ODER
        //   - 2× Note 2 in maßgebenden Fächern
        // ===================================================================
        if (sechserNebenfach > 0) {
            // Prüfe ob genug Ausgleichsnoten vorhanden sind
            const kannAusgleichen6 = einserGesamt >= sechserNebenfach || Math.floor(zweierGesamt / 2) >= sechserNebenfach;
            
            schritte.push({
                nummer: '7a',
                titel: '6 in Nicht-Kernfach → Ausgleich: 1×1 oder 2×2',
                details: `${sechserNebenfach}× Note 6 in Nebenfach. Verfügbar: ${einserGesamt}× Note 1, ${zweierGesamt}× Note 2. ${kannAusgleichen6 ? '<span class="highlight-gut">Ausgleich möglich</span>' : '<span class="highlight-schlecht">Kein Ausgleich möglich</span>'}`,
                wert: sechserNebenfach,
                bestanden: kannAusgleichen6,
                status: kannAusgleichen6 ? 'bestanden' : 'nicht-bestanden'
            });
            
            if (!kannAusgleichen6) {
                versetzt = false;
                stopBeiSchritt = '7a';
            }
        }
        
        // ===================================================================
        // REGEL 7b: 5 in Nicht-Kernfach → Ausgleich erforderlich
        // Für jede 5 in einem Nebenfach braucht man:
        //   - 1× Note 2 in einem maßgebenden Fach, ODER
        //   - 2× Note 3 in maßgebenden Fächern
        // ===================================================================
        if (fuenferNebenfach > 0 && !stopBeiSchritt) {
            const kannAusgleichen5Neben = zweierGesamt >= fuenferNebenfach || Math.floor(dreierGesamt / 2) >= fuenferNebenfach;
            
            schritte.push({
                nummer: '7b',
                titel: '5 in Nicht-Kernfach → Ausgleich: 1×2 oder 2×3',
                details: `${fuenferNebenfach}× Note 5 in Nebenfach. Verfügbar: ${zweierGesamt}× Note 2, ${dreierGesamt}× Note 3. ${kannAusgleichen5Neben ? '<span class="highlight-gut">Ausgleich möglich</span>' : '<span class="highlight-schlecht">Kein Ausgleich möglich</span>'}`,
                wert: fuenferNebenfach,
                bestanden: kannAusgleichen5Neben,
                status: kannAusgleichen5Neben ? 'bestanden' : 'nicht-bestanden'
            });
            
            if (!kannAusgleichen5Neben) {
                versetzt = false;
                stopBeiSchritt = '7b';
            }
        }
        
        // ===================================================================
        // REGEL 7c: 5 in Kernfach → Ausgleich durch 2 in Kernfach
        // Für jede 5 in einem Kernfach (D, M, E, WPF) braucht man:
        //   - 1× Note 2 in einem ANDEREN Kernfach
        // WICHTIG: Die 2 muss in einem Kernfach sein, nicht Nebenfach!
        // ===================================================================
        if (fuenferKernfach > 0 && !stopBeiSchritt) {
            const kannAusgleichen5Kern = zweierKernfach >= fuenferKernfach;
            
            schritte.push({
                nummer: '7c',
                titel: '5 in Kernfach → Ausgleich: 1×2 in Kernfach',
                details: `${fuenferKernfach}× Note 5 in Kernfach. Verfügbar: ${zweierKernfach}× Note 2 in Kernfach. ${kannAusgleichen5Kern ? '<span class="highlight-gut">Ausgleich möglich</span>' : '<span class="highlight-schlecht">Kein Ausgleich möglich</span>'}`,
                wert: fuenferKernfach,
                bestanden: kannAusgleichen5Kern,
                status: kannAusgleichen5Kern ? 'bestanden' : 'nicht-bestanden'
            });
            
            if (!kannAusgleichen5Kern) {
                versetzt = false;
                stopBeiSchritt = '7c';
            }
        }
    }
    
    // Ergebnis zurückgeben mit allen Details
    return { versetzt, schritte, stopBeiSchritt, schlechteNotenGesamt };
}
