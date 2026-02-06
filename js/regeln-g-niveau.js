// ==========================================================================
// VERSETZUNGSREGELN G-NIVEAU (Hauptschul-Niveau)
// Basierend auf: Versetzungsordnung vom 19. April 2016
// Realschule Baden-Württemberg
// ==========================================================================
//
// DIESE REGELN DÜRFEN NUR MIT AUSDRÜCKLICHER GENEHMIGUNG GEÄNDERT WERDEN!
//
// G-Niveau: Es gibt KEINE Unterscheidung zwischen Haupt- und Nebenfächern.
// Alle Fächer des Schülers (inklusive WPF) sind "maßgebende Fächer".
// INF (Informatik) zählt nur positiv → schlechte Noten in INF werden ignoriert.
//
// KEIN Durchschnitts-Check wie bei M-Niveau!
//
// Prüfungsablauf G-Niveau:
//   Regel 1: Toleranzgrenze prüfen
//            - Maximal 1×6 (ohne 5er) ODER maximal 2×5 (ohne 6er) → VERSETZT
//            - Mehr als das → weiter zu Regel 2
//
//   Regel 2: Ausgleich erforderlich für ALLE Noten schlechter als 4,0
//            - Jede 6 → Ausgleich durch 1×1 ODER 2×2 in maßgebenden Fächern
//            - Jede 5 → Ausgleich durch 1×2 (oder besser) in maßgebendem Fach
//            - Wenn Ausgleich NICHT möglich → NICHT VERSETZT
//
// MuKu-Beschluss (Musik, Kunst, Sport):
//   Wenn ein Schüler NUR wegen einer 5 in MUS, BK oder SPO nicht versetzt
//   würde, darf EINE solche 5 ignoriert werden → erneute Prüfung.
//
// ==========================================================================

// MuKu-Fächer: Musik, Bildende Kunst, Sport (inkl. Varianten)
const MUKU_FAECHER = ['MUS', 'BK', 'SPO', 'SPO-W', 'SPO-M'];

/**
 * Prüft ob ein G-Niveau Schüler nicht versetzt wird.
 * Nutzt intern die Detail-Funktion und gibt nur das Ergebnis zurück.
 *
 * @param {Object} noten - Objekt mit Fachkürzeln als Key und Note (1-6) als Wert
 * @returns {boolean} true = nicht versetzt, false = versetzt
 */
function pruefeGefaehrdungGNiveau(noten) {
    const ergebnis = pruefeVersetzungGNiveauDetail(noten);
    return !ergebnis.versetzt;
}

/**
 * Detaillierte Versetzungsprüfung für G-Niveau.
 * Geht alle Regeln der Reihe nach durch und gibt detaillierte Informationen zurück.
 * Wird sowohl für die Gefährdungsprüfung als auch für das UI-Modal verwendet.
 *
 * @param {Object} noten - Objekt mit Fachkürzeln als Key und Note (1-6) als Wert
 * @returns {Object} Ergebnis mit:
 *   - versetzt {boolean}: Ob der Schüler versetzt wird
 *   - schritte {Array}: Array mit allen geprüften Regelschritten
 *   - stopBeiSchritt {number|string|null}: Bei welcher Regel gestoppt wurde
 *   - mukuAngewendet {boolean}: Ob der MuKu-Beschluss angewendet wurde
 */
function pruefeVersetzungGNiveauDetail(noten) {
    // Array für die einzelnen Prüfungsschritte (wird im UI angezeigt)
    const schritte = [];

    // Ergebnis-Variablen
    let versetzt = true;
    let stopBeiSchritt = null;
    let mukuAngewendet = false;

    // =======================================================================
    // DATEN SAMMELN
    // Alle maßgebenden Noten durchgehen und Zähler füllen.
    // G-Niveau: ALLE Fächer sind maßgebend (keine Haupt/Nebenfach-Trennung).
    // INF wird bei schlechten Noten komplett ignoriert (zählt nur positiv).
    // =======================================================================

    let anzahl6 = 0;           // Anzahl der 6er
    let anzahl5 = 0;           // Anzahl der 5er
    let anzahl2 = 0;           // Anzahl der 2er (für Ausgleich)
    let anzahl1 = 0;           // Anzahl der 1er (für Ausgleich)
    let mukuFuenfer = 0;       // Anzahl der 5er in MuKu-Fächern (MUS, BK, SPO)

    // Listen für die Detail-Anzeige
    const faecherMit6 = [];
    const faecherMit5 = [];
    const faecherMit5MuKu = [];

    for (const [fach, note] of Object.entries(noten)) {
        // Informatik bei schlechten Noten komplett ignorieren
        if (WAHLFACH_NUR_POSITIV.includes(fach) && note >= 4) {
            continue;
        }

        // Noten zählen
        if (note === 6) {
            anzahl6++;
            faecherMit6.push(fach);
        } else if (note === 5) {
            anzahl5++;
            faecherMit5.push(fach);
            // MuKu-5er separat zählen
            if (MUKU_FAECHER.includes(fach)) {
                mukuFuenfer++;
                faecherMit5MuKu.push(fach);
            }
        } else if (note === 2 || note === 1) {
            // Noten 1 und 2 können zum Ausgleich verwendet werden
            if (note === 1) anzahl1++;
            if (note === 2) anzahl2++;
        }
    }

    const schlechteNotenGesamt = anzahl5 + anzahl6;

    // =======================================================================
    // REGEL 1: Toleranzgrenze
    // Maximal 1×6 (ohne 5er) ODER maximal 2×5 (ohne 6er) → VERSETZT
    // Alle anderen Kombinationen → weiter zur Ausgleichsprüfung
    // =======================================================================
    const toleranzOk = (anzahl6 <= 1 && anzahl5 === 0) || (anzahl6 === 0 && anzahl5 <= 2);

    let regel1Details = '';
    if (schlechteNotenGesamt === 0) {
        regel1Details = 'Keine Noten schlechter als 4 → <span class="highlight-gut">direkt versetzt</span>';
    } else {
        const faecher6Str = faecherMit6.length > 0 ? `6er: ${faecherMit6.join(', ')}` : '';
        const faecher5Str = faecherMit5.length > 0 ? `5er: ${faecherMit5.join(', ')}` : '';
        const notenInfo = [faecher6Str, faecher5Str].filter(s => s).join(' | ');
        regel1Details = `${notenInfo}. ` + (toleranzOk
            ? '<span class="highlight-gut">Innerhalb der Toleranz → versetzt</span>'
            : 'Mehr als 1×6 oder 2×5 → Ausgleich erforderlich');
    }

    schritte.push({
        nummer: 1,
        titel: 'Toleranzgrenze: Max. 1×6 (ohne 5er) oder max. 2×5 (ohne 6er)',
        details: regel1Details,
        bestanden: toleranzOk,
        status: toleranzOk ? 'bestanden' : 'ausgleich-noetig'
    });

    // Bei Toleranz-OK: Sofort versetzt, keine weiteren Prüfungen nötig
    if (toleranzOk) {
        return { versetzt: true, schritte, stopBeiSchritt: null, mukuAngewendet: false };
    }

    // =======================================================================
    // REGEL 2: Ausgleichsprüfung für ALLE Noten schlechter als 4,0
    // G-Niveau kennt nur maßgebende Fächer (keine Haupt/Nebenfach-Trennung).
    //
    // Ausgleichsregeln:
    //   - Jede 6 → 1×1 ODER 2×2 in maßgebenden Fächern
    //   - Jede 5 → 1×2 (oder besser) in maßgebendem Fach
    //
    // Ausgleichsnoten werden "verbraucht": Eine Note kann nur einmal
    // zum Ausgleich herangezogen werden.
    // =======================================================================

    schritte.push({
        nummer: 2,
        titel: 'Ausgleich erforderlich für alle Noten schlechter als 4,0',
        details: `${schlechteNotenGesamt} schlechte Noten müssen ausgeglichen werden (${anzahl6}×6, ${anzahl5}×5). Verfügbar: ${anzahl1}×1, ${anzahl2}×2`,
        bestanden: null,
        status: 'ausgleich-noetig'
    });

    // --- 2a: Ausgleich für 6er ---
    // Zuerst 6er ausgleichen (brauchen stärkere Noten)
    // Pro 6 benötigt: 1×1 ODER 2×2
    // Strategie: Zuerst 1er verwenden, dann 2er-Paare
    if (anzahl6 > 0) {
        // Wie viele 6er können mit 1ern ausgeglichen werden?
        const mitEinser = Math.min(anzahl6, anzahl1);
        // Verbleibende 6er versuchen mit je 2×2 auszugleichen
        const restNach1er = anzahl6 - mitEinser;
        const mitZweierPaare = Math.min(restNach1er, Math.floor(anzahl2 / 2));
        const ausgeglichene6 = mitEinser + mitZweierPaare;
        const restliche6 = anzahl6 - ausgeglichene6;

        // Verbrauchte Noten merken für die 5er-Prüfung
        const verbrauchte1er = mitEinser;
        const verbrauchte2er = mitZweierPaare * 2;
        // Für globale Nutzung bei 5er-Ausgleich aktualisieren
        anzahl1 -= verbrauchte1er;
        anzahl2 -= verbrauchte2er;

        const kannAusgleichen6 = restliche6 === 0;

        schritte.push({
            nummer: '2a',
            titel: 'Ausgleich für 6er: Jede 6 → 1×1 oder 2×2',
            details: `${anzahl6 + verbrauchte1er === anzahl6 ? '' : ''}${faecherMit6.join(', ')}: ${anzahl6}×6. ` +
                `Genutzt: ${verbrauchte1er}×1, ${verbrauchte2er}×2. ` +
                (kannAusgleichen6
                    ? '<span class="highlight-gut">Alle 6er ausgeglichen</span>'
                    : `<span class="highlight-schlecht">${restliche6}×6 ohne Ausgleich</span>`),
            bestanden: kannAusgleichen6,
            status: kannAusgleichen6 ? 'bestanden' : 'nicht-bestanden'
        });

        if (!kannAusgleichen6) {
            versetzt = false;
            stopBeiSchritt = '2a';
        }
    }

    // --- 2b: Ausgleich für 5er ---
    // Pro 5 benötigt: 1×2 (oder besser, also auch 1×1)
    // Verbleibende 1er und 2er nach 6er-Ausgleich verwenden
    if (anzahl5 > 0 && !stopBeiSchritt) {
        // 1er können auch als "besser als 2" für 5er genutzt werden
        const verfuegbar = anzahl1 + anzahl2;
        const ausgeglichene5 = Math.min(anzahl5, verfuegbar);
        const restliche5 = anzahl5 - ausgeglichene5;

        const kannAusgleichen5 = restliche5 === 0;

        schritte.push({
            nummer: '2b',
            titel: 'Ausgleich für 5er: Jede 5 → 1×2 (oder besser)',
            details: `${faecherMit5.join(', ')}: ${anzahl5}×5. ` +
                `Noch verfügbar: ${anzahl1}×1, ${anzahl2}×2. ` +
                (kannAusgleichen5
                    ? '<span class="highlight-gut">Alle 5er ausgeglichen</span>'
                    : `<span class="highlight-schlecht">${restliche5}×5 ohne Ausgleich</span>`),
            bestanden: kannAusgleichen5,
            status: kannAusgleichen5 ? 'bestanden' : 'nicht-bestanden'
        });

        if (!kannAusgleichen5) {
            versetzt = false;
            stopBeiSchritt = '2b';
        }
    }

    // =======================================================================
    // MUKU-BESCHLUSS: Musik, Kunst (BK), Sport
    // Wenn der Schüler NUR wegen einer 5 in MUS, BK oder SPO nicht versetzt
    // würde, darf EINE solche 5 ignoriert werden.
    // Danach wird die gesamte Prüfung erneut durchgeführt.
    // =======================================================================
    if (!versetzt && mukuFuenfer > 0) {
        // Versuche erneut: Entferne eine MuKu-5 und prüfe nochmal
        const notenOhneMuku = { ...noten };

        // Entferne die erste gefundene MuKu-5
        let ignoriertesFach = null;
        for (const mFach of faecherMit5MuKu) {
            if (notenOhneMuku[mFach] === 5) {
                ignoriertesFach = mFach;
                // Note auf 4 setzen (= nicht mehr schlecht)
                notenOhneMuku[mFach] = 4;
                break;
            }
        }

        if (ignoriertesFach) {
            // Erneute Prüfung ohne die MuKu-5
            const erneutesPruefung = pruefeVersetzungGNiveauDetail(notenOhneMuku);

            if (erneutesPruefung.versetzt) {
                // MuKu-Beschluss greift! Schüler wird doch versetzt
                mukuAngewendet = true;
                versetzt = true;
                stopBeiSchritt = null;

                schritte.push({
                    nummer: 'MuKu',
                    titel: `MuKu-Beschluss: 5 in ${ignoriertesFach} wird ignoriert`,
                    details: `Die Note 5 in <span class="wert">${ignoriertesFach}</span> darf laut MuKu-Beschluss ignoriert werden. ` +
                        '<span class="highlight-gut">Schüler ist mit MuKu-Beschluss versetzt!</span>',
                    bestanden: true,
                    status: 'bestanden'
                });
            } else {
                // MuKu-Beschluss reicht nicht
                schritte.push({
                    nummer: 'MuKu',
                    titel: `MuKu-Beschluss: 5 in ${ignoriertesFach} ignoriert → reicht nicht`,
                    details: `Auch nach Ignorieren der 5 in ${ignoriertesFach} fehlt Ausgleich. ` +
                        '<span class="highlight-schlecht">MuKu-Beschluss reicht nicht aus</span>',
                    bestanden: false,
                    status: 'nicht-bestanden'
                });
            }
        }
    }

    return { versetzt, schritte, stopBeiSchritt, mukuAngewendet };
}
