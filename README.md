# 🎓 Versetzungsprüfung Realschule M-Niveau

Automatisches Prüfsystem für Versetzungsentscheidungen nach der Versetzungsordnung Baden-Württemberg (Realschule M-Niveau).

## 📁 Dateien

### 1. **versetzungsregeln_m_niveau.md**
Komplette Dokumentation der Versetzungsregeln mit:
- ✅ Kristallklarem Regelwerk
- 📊 Algorithmus-Beschreibung
- 🧪 Testfällen zur Validierung
- 📝 Fächergruppen-Definition

### 2. **versetzungspruefung.js**
JavaScript-Implementierung des Prüfprogramms:
- Vollständige Regellogik
- Eingabevalidierung
- Ausführliche Fehler-/Erfolgsmeldungen
- Integrierte Testfälle

### 3. **versetzungspruefung.html**
Benutzerfreundliches Web-Interface:
- 🎨 Modernes Design
- ➕ Dynamisches Hinzufügen von Fächern
- 📊 Live-Statistik
- ✅ Sofortige Ergebnisanzeige

### 4. **test_daten.csv**
Excel-kompatible Testdaten mit 15 Beispielschülern:
- Verschiedene Szenarien abgedeckt
- Erwartete Ergebnisse dokumentiert
- Direkt in Excel/Google Sheets öffnbar

## 🚀 Verwendung

### Web-Interface (Empfohlen)
1. Öffne `versetzungspruefung.html` in einem Browser
2. Gib die Noten ein (1-6)
3. Klicke auf "Versetzung prüfen"
4. Ergebnis wird mit Begründung angezeigt

### Kommandozeile (Node.js)
```bash
node versetzungspruefung.js
```
Führt automatisch alle Testfälle aus.

### Excel-Test
1. Öffne `test_daten.csv` in Excel
2. Verwende die Noten als Input für manuelle Überprüfung
3. Vergleiche Ergebnisse mit "Erwartet"-Spalte

## 📋 Versetzungsregeln (Kurzübersicht)

### ✅ VERSETZT wenn:
1. **Keine 5 oder 6**
2. **Eine 5 im Nebenfach** (ohne weitere mangelhafte Noten)
3. **Eine 5 im Hauptfach mit Ausgleich:**
   - 1x Note 2 in anderem Hauptfach ODER
   - 2x Note 3 in anderen Hauptfächern ODER
   - 1x Note 2 in Nebenfach
4. **Zwei 5en in Nebenfächern mit Ausgleich:**
   - 1x Note 1 ODER
   - 2x Note 2

### ❌ NICHT VERSETZT wenn:
1. **Jede Note 6**
2. **Zwei oder mehr 5en in Hauptfächern**
3. **Mehr als zwei 5en insgesamt**
4. **5 ohne ausreichenden Ausgleich**

## 🏫 Fächergruppen

### Hauptfächer (Kernfächer):
- Deutsch
- Mathematik
- Englisch (1. Fremdsprache)

### Nebenfächer:
- Alle weiteren Fächer (Geschichte, Physik, Sport, etc.)

## 🧪 Testfälle

Das Programm enthält 7 vordefinierte Testfälle:

1. ✅ **Versetzt** - Keine mangelhafte Note
2. ✅ **Versetzt** - Eine 5 im Nebenfach
3. ✅ **Versetzt** - 5 im Hauptfach mit Ausgleich
4. ❌ **Nicht versetzt** - Note 6
5. ❌ **Nicht versetzt** - Zwei 5en in Hauptfächern
6. ❌ **Nicht versetzt** - 5 ohne Ausgleich
7. ✅ **Versetzt** - Zwei 5en in Nebenfächern mit Ausgleich

## 🔧 Technische Details

### Algorithmus-Schritte:
1. **Eingabevalidierung** - Prüft Notenbereiche (1-6) und Vollständigkeit
2. **Notenanalyse** - Zählt 5en und 6en, trennt nach Fächergruppen
3. **Ausschlussprüfung** - Prüft K.O.-Kriterien (6, zwei 5en in Hauptfächern, etc.)
4. **Versetzungsprüfung** - Wendet Versetzungsregeln an
5. **Ausgleichsprüfung** - Berechnet ob ausreichender Notenausgleich vorhanden

### Eingabeformat (JavaScript):
```javascript
const noten = {
    'Deutsch': 3,
    'Mathematik': 4,
    'Englisch': 3,
    'Geschichte': 2,
    'Physik': 3,
    'Sport': 4
};
```

### Ausgabeformat:
```javascript
{
    versetzt: true,  // oder false
    grund: "VERSETZT: Keine mangelhafte Note",
    details: {
        anzahl_6: 0,
        anzahl_5: 0,
        anzahl_5_hauptfach: 0,
        anzahl_5_nebenfach: 0,
        // ...weitere Statistiken
    }
}
```

## ⚠️ Hinweise

- **M-Niveau** = Mittleres Niveau (führt zur Mittleren Reife)
- Die Regeln basieren auf der Versetzungsordnung Baden-Württemberg
- Bei Zweifelsfällen hat die Klassenkonferenz Entscheidungskompetenz
- Einzelne Ausnahmeregelungen können in der vollständigen Versetzungsordnung definiert sein
- Dieses Tool dient zur Automatisierung und Vorabprüfung, ersetzt aber keine offizielle Entscheidung

## 📚 Weiterführende Informationen

- Original-PDF: `Versetzungsordnung_RS_M-Niveau-WEB.pdf`
- Detaillierte Regelwerk: `versetzungsregeln_m_niveau.md`

## 🆘 Support

Bei Fragen oder Problemen:
1. Prüfe die Dokumentation in `versetzungsregeln_m_niveau.md`
2. Teste mit den vordefinierten Testfällen
3. Vergleiche mit `test_daten.csv`

---

**Erstellt:** Februar 2026  
**Version:** 1.0  
**Lizenz:** Für schulische Zwecke
