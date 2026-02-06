// ==================== KONFIGURATION ====================
// Fachkürzel-Mapping: Kürzel aus CSV → Anzeigename
const FACH_MAPPING = {
    'D': 'Deutsch',
    'E': 'Englisch',
    'M': 'Mathematik',
    'T': 'Technik',
    'F': 'Französisch',
    'AES': 'AES',
    'G': 'Geschichte',
    'GES': 'Geschichte',
    'GEO': 'Geographie',
    'EK': 'Erdkunde',
    'GK': 'Gemeinschaftskunde',
    'WBS': 'WBS',
    'PH': 'Physik',
    'CH': 'Chemie',
    'BIO': 'Biologie',
    'MUS': 'Musik',
    'BK': 'Kunst',
    'SPO': 'Sport',
    'SPO-W': 'Sport',
    'SPO-M': 'Sport',
    'ETH': 'Ethik',
    'RRK': 'kath. Rel.',
    'REV': 'ev. Rel.',
    'INF': 'Informatik',
    'IuM': 'Informatik'
};

// Kernfächer (D, E, M)
const KERNFAECHER = ['D', 'E', 'M'];

// Wahlpflichtfächer - jeder Schüler hat genau eines davon
const WAHLPFLICHTFAECHER = ['T', 'F', 'AES'];

// Wahlfach das nur positiv zählt (schlechte Noten werden ignoriert)
const WAHLFACH_NUR_POSITIV = ['INF'];

// Feste Reihenfolge der Fächer für konsistente Anzeige in der Tabelle
const FACH_REIHENFOLGE = [
    'D', 'E', 'M',                              // Kernfächer zuerst
    'T', 'F', 'AES',                             // Wahlpflichtfächer
    'G', 'GES', 'GEO', 'EK', 'GK', 'WBS',       // Gesellschaftswissenschaften
    'PH', 'CH', 'BIO',                           // Naturwissenschaften
    'MUS', 'BK', 'SPO', 'SPO-W', 'SPO-M',        // Musisch-Künstlerisch
    'ETH', 'RRK', 'REV',                          // Religion/Ethik
    'INF', 'IuM'                                   // Informatik
];

// ==================== DATENSTRUKTUREN ====================
let alleKlassen = {};
let geladeneFiles = new Set();

// ==================== NOTENKONVERTIERUNG ====================
// Konvertiert einen Notenstring aus der CSV in eine Ganzzahl (1-6)
// Unterstützte Formate: "3", "2-3", "3+", "4-", "--", "X", ""
function konvertiereNote(noteStr) {
    if (!noteStr || noteStr.trim() === '' || noteStr === '--' || noteStr.toLowerCase() === 'x') {
        return null;
    }

    const cleaned = noteStr.trim();

    // Einfache ganze Note: "1" bis "6"
    if (/^[1-6]$/.test(cleaned)) {
        return parseInt(cleaned);
    }

    // Bereichsnote: "2-3" → Durchschnitt gerundet
    const rangeMatch = cleaned.match(/^([1-6])-([1-6])$/);
    if (rangeMatch) {
        const note1 = parseInt(rangeMatch[1]);
        const note2 = parseInt(rangeMatch[2]);
        return Math.round((note1 + note2) / 2);
    }

    // Tendenznote: "3+" oder "4-" → auf Hauptnote runden
    const tendenzMatch = cleaned.match(/^([1-6])[-+]$/);
    if (tendenzMatch) {
        return parseInt(tendenzMatch[1]);
    }

    // Fallback: Versuche als Zahl zu parsen
    const parsed = parseInt(cleaned);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 6) {
        return parsed;
    }

    return null;
}

// Konvertiert einen Notenstring in eine Anzeige-Note
// Halbjahresinformation: Dezimalnote (z.B. 2,5)
// Halbjahreszeugnis: Ganze Note (z.B. 3)
function konvertiereNoteAnzeige(noteStr, zeugnisTyp) {
    if (!noteStr || noteStr.trim() === '' || noteStr === '--' || noteStr.toLowerCase() === 'x') {
        return null;
    }

    if (zeugnisTyp === 'Halbjahreszeugnis') {
        const note = konvertiereNote(noteStr);
        return note === null ? null : String(note);
    }

    const cleaned = noteStr.trim();

    // Einfache ganze Note: "1" bis "6"
    if (/^[1-6]$/.test(cleaned)) {
        return `${cleaned},0`;
    }

    // Bereichsnote: "2-3" → 2,5
    const rangeMatch = cleaned.match(/^([1-6])-([1-6])$/);
    if (rangeMatch) {
        const note1 = parseInt(rangeMatch[1]);
        const note2 = parseInt(rangeMatch[2]);
        return formatDezimal((note1 + note2) / 2);
    }

    // Tendenznote: "3+" oder "4-" → 2,7 oder 4,3
    const tendenzMatch = cleaned.match(/^([1-6])([+-])$/);
    if (tendenzMatch) {
        const basis = parseInt(tendenzMatch[1]);
        const delta = tendenzMatch[2] === '+' ? -0.3 : 0.3;
        const wert = Math.min(6, Math.max(1, basis + delta));
        return formatDezimal(wert);
    }

    // Dezimalnote aus CSV (z.B. "2,3" oder "2.3")
    const parsed = parseFloat(cleaned.replace(',', '.'));
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 6) {
        return formatDezimal(parsed);
    }

    return null;
}

function formatDezimal(value) {
    return value.toFixed(1).replace('.', ',');
}

// ==================== BERECHNUNGEN ====================

// Berechnet den Hauptfachschnitt (D, E, M + WPF)
function berechneHauptfachSchnitt(noten) {
    const hauptfachNoten = [];
    
    // D, E, M
    for (const kf of KERNFAECHER) {
        if (noten[kf] !== undefined) {
            hauptfachNoten.push(noten[kf]);
        }
    }

    // Wahlpflichtfach (erstes gefundenes)
    for (const wpf of WAHLPFLICHTFAECHER) {
        if (noten[wpf] !== undefined) {
            hauptfachNoten.push(noten[wpf]);
            break;
        }
    }

    if (hauptfachNoten.length === 0) return null;
    
    const summe = hauptfachNoten.reduce((a, b) => a + b, 0);
    return (summe / hauptfachNoten.length).toFixed(2);
}

// Berechnet den Gesamtschnitt aller maßgebenden Fächer
// INF wird NUR einbezogen wenn die Note gut ist (≤ 3)
function berechneGesamtSchnitt(noten) {
    const alleNoten = [];
    
    for (const [fach, note] of Object.entries(noten)) {
        if (WAHLFACH_NUR_POSITIV.includes(fach)) {
            // INF nur wenn positiv für Schnitt (Note 1, 2, 3)
            if (note <= 3) {
                alleNoten.push(note);
            }
            // Note 4, 5, 6 in INF wird komplett ignoriert
        } else {
            alleNoten.push(note);
        }
    }
    
    if (alleNoten.length === 0) return null;
    
    const summe = alleNoten.reduce((a, b) => a + b, 0);
    return (summe / alleNoten.length).toFixed(2);
}

// Hauptfunktion: Wählt anhand des Niveaus die richtige Prüfung
// Gibt einen von 3 Status-Strings zurück:
//   'nicht-versetzt' = Regeln nicht bestanden → Schüler wird nicht versetzt
//   'gefaehrdet'     = Versetzt, aber knapp (mindestens 2x Note 5)
//   'versetzt'       = Problemlos versetzt (keine 5er oder nur eine 5)
function pruefeGefaehrdung(noten, niveau = 'M') {
    // 1. Regelprüfung: Ist der Schüler versetzt oder nicht?
    let nichtVersetzt;
    if (niveau === 'G') {
        nichtVersetzt = pruefeGefaehrdungGNiveau(noten);
    } else {
        nichtVersetzt = pruefeGefaehrdungMNiveau(noten);
    }

    // Nicht versetzt → sofort zurückgeben
    if (nichtVersetzt) {
        return 'nicht-versetzt';
    }

    // 2. Versetzt, aber hat der Schüler mindestens zwei 5er?
    // Wenn ja → "gefährdet" (knapp versetzt)
    // INF wird bei schlechten Noten ignoriert (zählt nur positiv)
    let anzahlFuenfer = 0;
    for (const [fach, note] of Object.entries(noten)) {
        if (WAHLFACH_NUR_POSITIV.includes(fach) && note >= 4) continue;
        if (note === 5) {
            anzahlFuenfer++;
        }
    }

    if (anzahlFuenfer >= 2) {
        return 'gefaehrdet';
    }

    // 3. Keine oder nur eine 5 → problemlos versetzt
    return 'versetzt';
}
