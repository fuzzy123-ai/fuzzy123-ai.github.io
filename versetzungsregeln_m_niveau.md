# Versetzungsregeln Realschule M-Niveau (Baden-Württemberg)
## ⚠️ OFFIZIELLE REGELUNG vom 19. April 2016

## Kristallklare Regelübersicht

### Notenstufen
- **1** = sehr gut
- **2** = gut
- **3** = befriedigend
- **4** = ausreichend
- **5** = mangelhaft
- **6** = ungenügend

### Fächergruppen

#### Kernfächer (KF)
- Deutsch
- Mathematik
- Englisch (1. Fremdsprache)

#### Maßgebende Fächer (MF)
- **ALLE** für die Versetzung relevanten Fächer (siehe §9: Kontingenstundentafel + WPF + Fächerverbund BNT)
- Umfasst Kernfächer + weitere Fächer

#### Nicht-Kernfächer (NKF)
- Alle maßgebenden Fächer außer D, M, E

---

## Versetzungsregeln - Ablaufschema (OFFIZIELL)

### ⚠️ VORAB-PRÜFUNGEN (K.O.-Kriterien):

#### ❌ Sofort NICHT VERSETZT wenn:
1. **Durchschnitt aller maßgebenden Fächer (MF) schlechter als 4,0**
2. **Durchschnitt der Kernfächer (KF) schlechter als 4,0**
3. **Note 6 in einem Kernfach (D, M, E)**
4. **Mehr als 3 Noten unter 4** (d.h. 4 oder mehr Noten mit 5 oder 6)

---

### ✅ VERSETZT wenn:

#### Regel 1: Eine oder keine Note unter 4
- **Maximal 1x Note 5 in maßgebenden Fächern** ODER
- **Maximal 1x Note 6 in Nicht-Kernfächern**
- Kein Ausgleich erforderlich

#### Regel 2: Zwei oder drei Noten unter 4 MIT Ausgleich

**Fall A: Eine 6 in Nicht-Kernfach**
- AUSGLEICH: 1x Note 2 ODER 2x Note 2 in maßgebenden Fächern

**Fall B: 5en nur in Nicht-Kernfächern (keine 6)**
- AUSGLEICH: 1x Note 2 ODER 2x Note 3 in maßgebenden Fächern

**Fall C: Eine 5 in einem Kernfach (keine 6)**
- AUSGLEICH: 1x Note 2 in einem Kernfach

---

### ❌ NICHT VERSETZT wenn:

1. **Durchschnittsprüfung nicht bestanden** (siehe oben)
2. **Note 6 in Kernfach** (D, M, E)
3. **Mehr als 3 Noten unter 4**
4. **2 oder 3 Noten unter 4 OHNE ausreichenden Ausgleich**

---

## Algorithmus für maschinelle Prüfung (OFFIZIELL KORREKT)

```
EINGABE: Noten aller maßgebenden Fächer

SCHRITT 1: Berechne Durchschnitte
  - durchschnitt_alle_MF = Durchschnitt aller maßgebenden Fächer
  - durchschnitt_KF = Durchschnitt der Kernfächer (D, M, E)

SCHRITT 2: Prüfe K.O.-Kriterien (Sofort NICHT VERSETZT)
  WENN durchschnitt_alle_MF > 4,0:
    ERGEBNIS = NICHT VERSETZT (Grund: Durchschnitt aller Fächer schlechter als 4,0)
    ENDE
  
  WENN durchschnitt_KF > 4,0:
    ERGEBNIS = NICHT VERSETZT (Grund: Durchschnitt der Kernfächer schlechter als 4,0)
    ENDE
  
  WENN Note 6 in Kernfach (D, M, E):
    ERGEBNIS = NICHT VERSETZT (Grund: Note 6 in Kernfach nicht ausgleichbar)
    ENDE

SCHRITT 3: Zähle Noten unter 4
  - anzahl_unter_4 = Zähle alle Noten mit Wert 5 oder 6
  - anzahl_6_in_NKF = Anzahl der 6en in Nicht-Kernfächern
  - anzahl_5_in_KF = Anzahl der 5en in Kernfächern
  - anzahl_5_in_NKF = Anzahl der 5en in Nicht-Kernfächern

SCHRITT 4: Prüfe Anzahl schlechter Noten
  WENN anzahl_unter_4 > 3:
    ERGEBNIS = NICHT VERSETZT (Grund: Mehr als 3 Noten unter 4)
    ENDE
  
  WENN anzahl_unter_4 <= 1:
    ERGEBNIS = VERSETZT (Grund: Maximal eine Note unter 4)
    ENDE

SCHRITT 5: Prüfe 2 oder 3 Noten unter 4 mit Ausgleich
  
  Fall A: Hat Note 6 in Nicht-Kernfach?
    JA → Prüfe Ausgleich:
      WENN (anzahl_2_in_MF >= 1) ODER (anzahl_2_in_MF >= 2):
        ERGEBNIS = VERSETZT (Grund: 6 in NKF mit Ausgleich)
        ENDE
      SONST:
        ERGEBNIS = NICHT VERSETZT (Grund: 6 ohne Ausgleich)
        ENDE
  
  Fall B: Hat 5 in Kernfach (keine 6)?
    JA → Prüfe Ausgleich:
      WENN anzahl_2_in_KF >= 1:
        ERGEBNIS = VERSETZT (Grund: 5 in KF mit Ausgleich durch 2 in KF)
        ENDE
      SONST:
        ERGEBNIS = NICHT VERSETZT (Grund: 5 in KF ohne Ausgleich)
        ENDE
  
  Fall C: Nur 5en in Nicht-Kernfächern (keine 6, keine 5 in KF)?
    JA → Prüfe Ausgleich:
      WENN (anzahl_2_in_MF >= 1) ODER (anzahl_3_in_MF >= 2):
        ERGEBNIS = VERSETZT (Grund: 5en in NKF mit Ausgleich)
        ENDE
      SONST:
        ERGEBNIS = NICHT VERSETZT (Grund: 5en in NKF ohne Ausgleich)
        ENDE

SCHRITT 6: Standardfall
  ERGEBNIS = NICHT VERSETZT
  ENDE
```

---

## Testfälle zur Validierung

### Testfall 1: Versetzt - Keine 5
```
Deutsch: 3, Mathe: 4, Englisch: 3, NF1: 2, NF2: 3, NF3: 4
Erwartung: VERSETZT
```

### Testfall 2: Versetzt - Eine 5 im Nebenfach
```
Deutsch: 3, Mathe: 4, Englisch: 3, NF1: 5, NF2: 3, NF3: 4
Erwartung: VERSETZT
```

### Testfall 3: Versetzt - Eine 5 im Hauptfach mit Ausgleich
```
Deutsch: 5, Mathe: 2, Englisch: 3, NF1: 3, NF2: 3, NF3: 4
Erwartung: VERSETZT (Ausgleich durch Note 2 in Mathe)
```

### Testfall 4: Nicht versetzt - Note 6
```
Deutsch: 3, Mathe: 6, Englisch: 3, NF1: 3, NF2: 3, NF3: 4
Erwartung: NICHT VERSETZT
```

### Testfall 5: Nicht versetzt - Zwei 5en in Hauptfächern
```
Deutsch: 5, Mathe: 5, Englisch: 3, NF1: 3, NF2: 3, NF3: 4
Erwartung: NICHT VERSETZT
```

### Testfall 6: Nicht versetzt - 5 ohne Ausgleich
```
Deutsch: 5, Mathe: 3, Englisch: 3, NF1: 3, NF2: 3, NF3: 4
Erwartung: NICHT VERSETZT (kein ausreichender Ausgleich)
```

### Testfall 7: Versetzt - Zwei 5en in Nebenfächern mit Ausgleich
```
Deutsch: 2, Mathe: 3, Englisch: 2, NF1: 5, NF2: 5, NF3: 4
Erwartung: VERSETZT (Zwei 2en als Ausgleich)
```

---

## Hinweise

- **M-Niveau** = Mittleres Niveau (führt zur Mittleren Reife)
- Die Regeln können je nach Bundesland und Schulordnung variieren
- Bei Zweifelsfällen: Konferenzbeschluss möglich
- Einzelne Ausnahmeregelungen können in der vollständigen Versetzungsordnung definiert sein
