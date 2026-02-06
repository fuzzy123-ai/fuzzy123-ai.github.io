# ⚠️ WICHTIGE KORREKTUREN - Offizielle Versetzungsordnung

## Basierend auf dem offiziellen Flussdiagramm (19. April 2016)

### 🔴 Hauptunterschiede zur ersten Version

#### 1. **Durchschnittsprüfungen (NEU!)**
Die offizielle Regelung enthält **zwei Durchschnittsprüfungen**, die ich ursprünglich nicht hatte:

**K.O.-Kriterium 1:**
- ❌ Durchschnitt ALLER maßgebenden Fächer muss 4,0 oder besser sein
- Wenn > 4,0 → sofort NICHT VERSETZT

**K.O.-Kriterium 2:**
- ❌ Durchschnitt der KERNFÄCHER (D, M, E) muss 4,0 oder besser sein
- Wenn > 4,0 → sofort NICHT VERSETZT

**Beispiel:**
```
Deutsch: 5, Mathe: 5, Englisch: 5, Rest: 2er
→ Durchschnitt Kernfächer = 5,0 > 4,0
→ NICHT VERSETZT (auch wenn sonst guter Ausgleich)
```

---

#### 2. **Note 6 in Kernfächern (GEÄNDERT!)**
- ❌ Ich hatte: "Jede 6 führt zur Nichtversetzung"
- ✅ OFFIZIELL: "6 nur in KERNFÄCHERN nicht ausgleichbar"

**Kernfächer = Deutsch, Mathematik, Englisch**

Eine **6 in Nicht-Kernfächern** (z.B. Geschichte, Sport) IST ausgleichbar durch:
- 1x oder 2x Note 2 in maßgebenden Fächern

---

#### 3. **Maximale Anzahl schlechter Noten (NEU!)**
- ❌ Meine Regel: "Maximal 2 Noten mit 5"
- ✅ OFFIZIELL: "Maximal 3 Noten unter 4" (d.h. 5 oder 6)

Das bedeutet: Bis zu **3x Note 5** sind prinzipiell möglich (wenn Ausgleich vorhanden)!

---

#### 4. **Ausgleichsregeln für 5 in Kernfach (PRÄZISER!)**
- ❌ Ich hatte: "2 in anderem Kernfach ODER 2x 3 in Kernfächern ODER 2 in Nebenfach"
- ✅ OFFIZIELL: **NUR** "1x Note 2 in einem Kernfach"

**Wichtig:** Bei 5 in Kernfach zählt **NUR** eine 2 in einem **anderen Kernfach**!
- ❌ NICHT: 2 in Nebenfach
- ❌ NICHT: 2x Note 3

---

#### 5. **Ausgleichsregeln für 5en in Nicht-Kernfächern (GEÄNDERT!)**
- ❌ Ich hatte: "2x Note 2 ODER 1x Note 1"
- ✅ OFFIZIELL: "1x Note 2 ODER 2x Note 3 in maßgebenden Fächern"

**Wichtig:** Schon **eine einzige 2** reicht aus! (nicht zwei!)

---

#### 6. **Fachbegriffe (PRÄZISIERT!)**
Ich verwendete unklare Begriffe:
- ❌ "Hauptfächer" / "Nebenfächer"
- ✅ OFFIZIELL:
  - **Kernfächer (KF)**: Deutsch, Mathematik, Englisch
  - **Maßgebende Fächer (MF)**: ALLE versetzungsrelevanten Fächer
  - **Nicht-Kernfächer (NKF)**: Alle MF außer D, M, E

---

## 📋 Korrigierter Algorithmus (Kurzfassung)

```
1. Prüfe: Durchschnitt alle Fächer ≤ 4,0?
   NEIN → NICHT VERSETZT

2. Prüfe: Durchschnitt Kernfächer ≤ 4,0?
   NEIN → NICHT VERSETZT

3. Prüfe: Note 6 in Kernfach (D, M, E)?
   JA → NICHT VERSETZT

4. Zähle Noten unter 4 (5 und 6):
   > 3 → NICHT VERSETZT
   ≤ 1 → VERSETZT
   
5. Wenn 2-3 Noten unter 4:
   a) 6 in Nicht-Kernfach?
      → Ausgleich: 1x Note 2 erforderlich
   
   b) 5 in Kernfach?
      → Ausgleich: 1x Note 2 in Kernfach erforderlich
   
   c) Nur 5en in Nicht-Kernfächern?
      → Ausgleich: 1x Note 2 ODER 2x Note 3 erforderlich
```

---

## 🧪 Kritische Testfälle

### Test 1: Durchschnitt Kernfächer
```
D: 5, M: 5, E: 5, Rest: 2er
→ NICHT VERSETZT (Ø KF = 5,0 > 4,0)
→ Meine alte Version: Hätte falsch als "mit Ausgleich" gewertet
```

### Test 2: 6 in Nicht-Kernfach
```
D: 2, M: 3, E: 3, Geschichte: 6, Rest: 3-4
→ VERSETZT (6 in NKF mit Ausgleich durch 2 in D)
→ Meine alte Version: NICHT VERSETZT (falsch!)
```

### Test 3: 5 in Kernfach - Ausgleich nur durch Kernfach
```
D: 5, M: 3, E: 3, Sport: 2, Rest: 3
→ NICHT VERSETZT (2 in Sport zählt nicht!)
→ Meine alte Version: VERSETZT (falsch!)
```

### Test 4: 3x Note 5 in Nicht-Kernfächern
```
D: 2, M: 3, E: 3, Geschichte: 5, Sport: 5, Musik: 5
→ VERSETZT (3x 5 in NKF, Ausgleich durch 2 in D)
→ Meine alte Version: NICHT VERSETZT (falsch - hatte Max. 2x 5)
```

---

## ✅ Neue Implementierung

Die neue JavaScript-Implementierung (`versetzungspruefung.js`) berücksichtigt jetzt:
- ✅ Durchschnittsprüfungen (alle Fächer + Kernfächer)
- ✅ 6 nur in Kernfächern K.O.
- ✅ Maximal 3 Noten unter 4
- ✅ Korrekte Ausgleichsregeln
- ✅ Offizielle Terminologie (KF, MF, NKF)

---

## 📚 Quellen

- **Versetzungsordnung Realschule M-Niveau** (Baden-Württemberg)
- **Datum:** 19. April 2016
- **Flussdiagramm:** VBE Baden-Württemberg

---

## 🚨 WICHTIG für die Praxis

1. **Maßgebende Fächer (MF):**
   - Nicht alle Fächer zählen zur Versetzung!
   - Laut §9: Kontingenstundentafel + WPF + Fächerverbund BNT
   - In CSV/Excel: NUR die versetzungsrelevanten Fächer eingeben

2. **Klassenkonferenz:**
   - §8: Besondere Versetzungsentscheidungen möglich
   - 2/3-Mehrheit kann andere Entscheidung treffen
   - Mit Vermerk im Zeugnis

3. **Niveauwechsel:**
   - Bei Nichtversetzung: M → G möglich
   - Verhindert Sitzenbleiben

---

**Stand dieser Korrektur:** 5. Februar 2026
