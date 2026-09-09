# what2do – Inhaltliches Konzept (Entwurf v0.1)

Stand: 2026-09-09 · Status: Diskussionsgrundlage, noch kein Code

## 1. Ziel und Abgrenzung

Eine Gruppe (Freunde, Familie, Kollegen) will einen gemeinsamen Abend verbringen und weiß nicht, was. Die App stellt allen Teilnehmenden **vorab, einzeln und unabhängig voneinander** einen kurzen Fragebogen (unter 5 Minuten). Die Antworten werden gesammelt und **exportiert**. Die eigentliche Auswertung und der Aktivitätsvorschlag passieren **außerhalb der App** (Host füttert den Export in ein LLM).

Die App ist also bewusst dumm: Fragen stellen, Antworten einsammeln, exportieren. Keine Empfehlungslogik, kein Login, kein Aktivitätskatalog mit Locations.

Ablauf:

1. Host legt einen „Abend" an und bekommt eine URL.
2. Host verteilt die URL (WhatsApp, Signal, …).
3. Teilnehmende beantworten den Fragebogen auf dem Handy.
4. Host lädt die Antworten herunter (prompt-fertiges Format).
5. Host + LLM machen den Vorschlag.

## 2. Was die Forschung dazu sagt

Es gibt keine Studie „Wie fragt man eine Gruppe, was sie heute Abend machen will". Es gibt aber mehrere gut belegte Bausteine, aus denen sich der Fragebogen zusammensetzen lässt.

### 2.1 Warum überhaupt einzeln und vorab fragen (statt in der Gruppe diskutieren)

- **Hidden-Profile-Effekt** (Stasser & Titus, 1985): Gruppen diskutieren überwiegend das, was ohnehin alle wissen. Informationen, die nur eine Person hat (z. B. „ich hab heute Rückenschmerzen", „ich wollte schon immer mal Bouldern"), kommen in der Diskussion selten auf den Tisch. Ein anonymer Einzel-Fragebogen holt genau diese Info raus.
- **Konformität und Gruppenpolarisierung**: Wer als Erstes „Kino?" sagt, setzt den Anker. Homogene Gruppen polarisieren, Leise passen sich an. Unabhängige Erhebung vor der Diskussion verhindert das.
- **Choice Overload / Decision Fatigue**: Eine Liste mit 50 Aktivitäten erzeugt Entscheidungsvermeidung. Deshalb fragt der Bogen nach **Dimensionen** (Energie, Bedürfnis, Rahmen), nicht nach konkreten Aktivitäten. Die Übersetzung in Aktivitäten macht später das LLM.

**Konsequenz für die App:** Antworten sind für andere Teilnehmende nicht sichtbar. Jeder füllt alleine aus.

### 2.2 Was man fragen sollte: die vier Dimensionen

**A) Aktueller Zustand (State), nicht nur Persönlichkeit (Trait)**
Das *Circumplex-Modell des Affekts* (Russell, 1980) beschreibt Stimmung über zwei Achsen: **Arousal** (Energie: müde ↔ aufgedreht) und **Valenz** (Stimmung: mies ↔ gut). Beide sind tagesabhängig und entscheiden mehr über einen gelungenen Abend als jede Persönlichkeitsfrage. Wer heute auf 2/10 Energie ist, will keinen Lasertag, egal wie sportlich er sonst ist.

**B) Motivation: Was soll der Abend geben?**
Die *Leisure Motivation Scale* (Beard & Ragheb, 1983; 48 Items, Reliabilität ≈ 0,90) ist das Standardinstrument der Freizeitforschung. Sie unterscheidet vier Motive:

| Motiv | Kurz | Typische Aktivitäten |
|---|---|---|
| Stimulus-Avoidance | Abschalten, runterkommen, Ruhe | Sofa, Spaziergang, Sauna, ruhiges Essen |
| Social | Leute, Gespräch, Zugehörigkeit | Kochen, Kneipe, Spieleabend |
| Competence-Mastery | Etwas schaffen, sich messen, gewinnen | Bowling, Escape Room, Turnier |
| Intellectual | Lernen, entdecken, kreativ sein | Ausstellung, Workshop, neues Rezept, Quiz |

Wir übernehmen nicht 48 Items, sondern lassen die vier Motive **in eine Reihenfolge bringen** (Ranking → Borda-Punkte). Das ist ein Item statt 48 und liefert trotzdem ein Profil.

**C) Rahmenbedingungen (Constraints)**
Das *Hierarchische Modell der Freizeit-Constraints* (Crawford, Jackson & Godbey, 1991) unterscheidet:
- *intrapersonal*: Müdigkeit, Stimmung, Ängste → über Block A abgedeckt
- *interpersonal*: „mit wem" → durch die Gruppe gegeben
- *strukturell*: Zeit, Geld, Mobilität, Wetter, Körper → **müssen explizit abgefragt werden**, weil sie harte Filter sind

**D) Aktivitätscharakter**
- *Flow-Theorie* (Csíkszentmihályi): Zufriedenheit entsteht, wenn Anforderung und Können zusammenpassen. Frage: „Berieseln lassen oder gefordert werden?"
- *Sensation Seeking* (BSSS, Hoyle et al., 2002; sagt Urlaubs-/Freizeitpräferenzen voraus): „Was Bekanntes oder was Neues?"

### 2.3 Wie man fragen sollte (Fragebogen-Design)

- **Forced Choice / Ranking statt Likert-Skalen**: Likert-Items produzieren Mittel-Tendenz und Zustimmungs-Bias („stimme allem eher zu"). Erzwungene Entscheidungen (Rangreihe, „wähle 2 von 4", Best/Worst) diskriminieren besser, gehen schneller und haben weniger Abbrecher (Combrinck, 2024; MaxDiff-Literatur).
- **Länge**: Mobile Surveys über ~5 Minuten oder ~9 Minuten haben hohe Abbruchraten. Median-Antwortzeit liegt bei ~20–30 Sekunden pro Frage, die erste Frage dauert am längsten. **Ziel: 12–14 Items, überwiegend Ein-Tipp-Antworten, ca. 3–4 Minuten.**
- **Keine Doppelfragen** („Hast du Lust auf Sport und draußen?"), **ausbalancierte Skalen**, **Pilot-Test** mit 3–4 Leuten vor dem ersten echten Einsatz.

### 2.4 Wie man aggregiert (für die spätere Auswertung)

Aus der Group-Recommender-Forschung (Masthoff, 2004/2011) und Social Choice Theory:

| Strategie | Prinzip | Wo wir sie einsetzen |
|---|---|---|
| **Least Misery** | Gruppe ist so zufrieden wie ihr unzufriedenstes Mitglied | Vetos / No-Gos, Budget-Obergrenze, Energie-Obergrenze |
| **Average** | Mittelwert aller | Motivprofil, Neu/Vertraut, Anspruch |
| **Approval Voting** | Jeder kreuzt alles an, was ok wäre | Aktivitätskategorien |
| **Borda Count** | Rangreihe → Punkte | Die vier Motive |

Wichtig: Ein Veto von einer Person schlägt fünf „gerne". Deshalb werden **No-Gos separat und explizit** erhoben, nicht als niedrige Bewertung versteckt.

## 3. Der Fragebogen (Entwurf)

Sprache: Deutsch, Du-Form, mobile-first, ein Item pro Screen, Fortschrittsbalken. Zeitziel: 3–4 Minuten. Alle Items mit `*` sind Pflicht.

### Block 0 – Wer bist du (1 Item, ~10 s)

**0. Wie sollen wir dich nennen?** `*`
Freitext (Spitzname reicht). Nur für den Host sichtbar.

### Block A – Wie geht's dir heute (3 Items, ~40 s)

**1. Wie viel Energie hast du heute Abend?** `*`
5 Stufen, Emoji-Skala: 🛋️ Sofa-Modus · 🐢 eher ruhig · 🙂 normal · ⚡ gut drauf · 🚀 Vollgas
→ *Arousal*. Aggregation: Least Misery (die müdeste Person setzt die Obergrenze) plus Median.

**2. Wie ist deine Stimmung gerade?** `*`
5 Stufen: 😩 · 😕 · 😐 · 🙂 · 😄
→ *Valenz*. Schlechte Stimmung → eher niedrigschwellige, sichere Aktivitäten, keine Leistung.

**3. Was soll dir der Abend heute vor allem geben? Bring die vier in deine Reihenfolge.** `*`
Tippe die Karten in Reihenfolge deiner Priorität (1 = wichtigste):
- 🧘 **Abschalten** – runterkommen, Kopf frei, nichts müssen
- 🗣️ **Leute** – quatschen, lachen, Zeit miteinander
- 🏆 **Was schaffen** – mich messen, gewinnen, etwas hinkriegen
- 💡 **Was entdecken** – Neues lernen, kreativ sein, staunen
→ *Beard & Ragheb*. Aggregation: Borda (Platz 1 = 3 Punkte … Platz 4 = 0).

### Block B – Dein Rahmen heute (4 Items, ~40 s)

**4. Wie viel Zeit hast du?** `*`
○ bis ca. 2 Stunden · ○ 2–4 Stunden · ○ open end

**5. Was darf's dich heute kosten (pro Person)?** `*`
○ am liebsten nichts · ○ bis 15 € · ○ bis 40 € · ○ egal, gönnen

**6. Drinnen oder draußen?** `*`
○ Drinnen · ○ Draußen · ○ Egal

**7. Wie weit würdest du heute fahren?** `*`
○ Ich bleib am liebsten, wo ich bin · ○ bis 15 Minuten · ○ bis 45 Minuten · ○ Ist mir egal
Zusatz-Toggle: „Ich hab ein Auto dabei" (ja/nein)

### Block C – Wie soll die Aktivität sein (4 Items, ~50 s)

**8. Was Bekanntes oder was Neues?** `*`
Slider 1–5: „Was Bewährtes, das sicher klappt" ↔ „Was Neues ausprobieren"
→ *Sensation Seeking*. Aggregation: Mittelwert, Streuung beachten.

**9. Berieseln lassen oder gefordert werden?** `*`
Slider 1–5: „Einfach genießen, Hirn aus" ↔ „Richtig gefordert werden"
→ *Flow / Anspruch*. Aggregation: Mittelwert.

**10. Selbst machen oder zuschauen?** `*`
○ Selbst aktiv sein · ○ Zuschauen / konsumieren · ○ Mix ist fein

**11. Wie viel Reden darf's sein?** `*`
○ Reden ist das Hauptprogramm · ○ Nebenbei reden reicht · ○ Kann auch mal still sein
→ Unterscheidet Kneipe/Kochen (Gespräch im Zentrum) von Kino/Konzert (Gespräch unmöglich).

### Block D – Vetos und Joker (3 Items, ~60 s)

**12. Was geht heute für dich gar nicht?** (Mehrfachauswahl, optional)
☐ Alkohol · ☐ Laute Orte / Menschenmassen · ☐ Schwitzen / Sport · ☐ Bildschirm (Film, Games) · ☐ Selber kochen · ☐ Brett- und Kartenspiele · ☐ Kultur (Museum, Theater, Lesung) · ☐ Lange Anfahrt · ☐ Etwas, wo ich vorne stehen muss (Karaoke, Impro) · ☐ Nichts davon
+ Freitext: „Sonst noch was (Allergie, Verletzung, …)?"
→ *Least Misery*, harter Filter.

**13. Worauf hättest du heute grundsätzlich Bock? Kreuz alles an, was für dich okay wäre.** `*`
☐ Essen gehen · ☐ Zusammen kochen · ☐ Brett-/Kartenspiele · ☐ Videospiele · ☐ Film / Serie · ☐ Bar / Kneipe · ☐ Kino / Konzert / Kultur · ☐ Aktiv & sportlich (Bowling, Bouldern, Minigolf …) · ☐ Erlebnis (Escape Room, Lasertag, Quiz-Night …) · ☐ Draußen (Spaziergang, See, Grillen) · ☐ Kreatives (Basteln, Musik, Malen) · ☐ Wellness (Sauna, Therme) · ☐ Einfach chillen & quatschen
→ *Approval Voting*. Jede Kategorie bekommt einen Zustimmungs-Score von 0 bis n.

**14. Joker: Wenn du heute allein entscheiden dürftest, was würden wir machen?** (Freitext, optional)
→ *Hidden Profile*: Hier kommt die Idee raus, die sonst niemand ausspricht.

**15. Wie flexibel bist du heute?** `*`
Slider 1–5: „Ich hab klare Wünsche" ↔ „Mir ist fast alles recht, Hauptsache zusammen"
→ Gewichtung: Bei Konflikten zählen die Präferenzen der Leute mit klaren Wünschen stärker.

**Gesamt: 16 Items (14 Pflicht, 2 optional), geschätzt 3,5 Minuten.**

### Host-Kontext (füllt nur der Host beim Anlegen, ~1 Minute)

Damit die Teilnehmenden weniger Fragen bekommen, gibt der Host Rahmen vor, der für alle gilt:
- Datum, Startzeit, Ort/Stadt (bzw. „bei X zu Hause")
- Wetter-Erwartung (Host weiß es, Teilnehmende müssen nicht raten)
- Erwartete Gruppengröße
- Optional: Besonderheiten (Kinder dabei, jemand hat Geburtstag, es ist ein Wochentag, …)
- Optional: Bereits gesetzte Constraints („Auto haben wir", „Budget ist egal") → entsprechende Teilnehmer-Fragen werden ausgeblendet

## 4. Export-Format

Der Export muss so gebaut sein, dass ein LLM ihn **ohne Erklärung** versteht. Vorschlag: eine Markdown-Datei mit drei Teilen:

1. **Codebook**: Jede Frage mit ID, Wortlaut, Skala und Aggregationsregel (Least Misery / Average / Borda / Approval). Das ist fix und kommt aus dem Fragebogen-Schema.
2. **Host-Kontext**: Datum, Ort, Wetter, Gruppengröße, Besonderheiten.
3. **Antworten**: Eine Tabelle pro Block, Zeilen = Teilnehmende, plus die Freitexte.

Zusätzlich JSON für maschinelle Weiterverarbeitung. Der Markdown-Export enthält am Ende einen **fertigen Auswertungs-Prompt** (siehe 5), sodass der Host nur Copy-Paste machen muss.

## 5. Auswertungslogik (für den LLM-Schritt, nicht in der App)

Reihenfolge, in der die Auswertung vorgehen sollte:

1. **Harte Filter anwenden** (Least Misery): Vereinigung aller No-Gos, Minimum von Zeit, Budget, Fahrweite, Drinnen/Draußen-Konflikte.
2. **Energie-Obergrenze setzen**: Die niedrigste Energie bestimmt das Aktivitätsniveau. Median zeigt, wo die Gruppe im Schnitt ist.
3. **Motivprofil bilden**: Borda-Summen der vier Motive → dominantes Motiv der Gruppe, zweites Motiv als Modifikator.
4. **Approval-Ranking**: Kategorien nach Zustimmung sortieren, Kategorien mit Vetos rausfiltern.
5. **Charakter feinjustieren**: Neu/Vertraut, Anspruch, Selbst/Zuschauen, Redeanteil als Mittelwerte, Ausreißer benennen.
6. **Joker lesen**: Freitexte auf Ideen prüfen, die zum Profil passen, aber in keiner Kategorie waren.
7. **Streuung prüfen**: Wenn die Gruppe bimodal ist (halb Sofa, halb Vollgas), zwei Optionen oder einen zweiteiligen Abend vorschlagen statt einen faulen Kompromiss.
8. **Ausgabe**: 1 Hauptvorschlag + 2 Alternativen, jeweils mit einem Satz Begründung, die auf die Daten verweist („Alle drei haben Reden als Hauptprogramm, niemand will Bildschirm, Energie ist niedrig → gemeinsam kochen").

## 6. Offene Fragen (bitte beantworten)

Siehe Chat. Kurzfassung:

1. Wer ist die Gruppe (feste Freundesrunde, wechselnd, Familie, Kollegen)? Immer dieselben Leute?
2. Wo findet der Abend typischerweise statt (zu Hause vs. unterwegs, welche Stadt)?
3. Sollen die Antworten auch für dich als Host anonym sein, oder willst du Namen sehen?
4. Sollen Rahmenbedingungen (Budget, Zeit, Mobilität) von allen abgefragt werden oder gibst du das als Host vor?
5. Einmalig pro Abend oder wiederkehrend (dann könnte man stabile Dinge wie No-Gos speichern)?
6. Sprache nur Deutsch, Du-Form okay?
7. Soll der Export einen fertigen Prompt enthalten?

## 7. Quellen

- Beard, J. G. & Ragheb, M. G. (1983). Measuring Leisure Motivation. *Journal of Leisure Research*, 15(3). https://www.tandfonline.com/doi/abs/10.1080/00222216.1983.11969557
- Crawford, D. W., Jackson, E. L. & Godbey, G. (1991). A hierarchical model of leisure constraints. *Leisure Sciences*, 13(4). https://www.tandfonline.com/doi/abs/10.1080/01490409109513147
- Russell, J. A. (1980). A circumplex model of affect. Überblick: https://pmc.ncbi.nlm.nih.gov/articles/PMC4301408/
- Stasser, G. & Titus, W. (1985). Hidden profiles. Überblick: https://en.wikipedia.org/wiki/Hidden_profile · Lu, Yuan & McLeod (2012), Twenty-Five Years of Hidden Profiles: https://journals.sagepub.com/doi/10.1177/1088868311417243
- Masthoff, J. Group recommender aggregation strategies (Least Misery, Average, …). Überblick: https://link.springer.com/article/10.1007/s11257-023-09363-0
- Hoyle, R. H. et al. (2002). Brief Sensation Seeking Scale; Anwendung auf Urlaubspräferenzen: https://www.sciencedirect.com/science/article/abs/pii/S0191886903000746
- Csíkszentmihályi, M. Flow / Challenge-Skill-Balance. Überblick: https://pmc.ncbi.nlm.nih.gov/articles/PMC7033418/
- Deci, E. L. & Ryan, R. M. Self-Determination Theory (Autonomie, Kompetenz, Verbundenheit): https://selfdeterminationtheory.org/theory/
- Combrinck, C. (2024). Not Liking the Likert? Forced-choice vs. Likert. *SAGE Open*: https://journals.sagepub.com/doi/full/10.1177/21582440241295501
- Survey-Länge und Abbruchraten (Mobile): https://survicate.com/reports/survey-completion-time-benchmarks/ · https://www.surveymonkey.com/curiosity/survey_completion_times/
- Borda Count vs. Approval Voting in Gruppen: https://link.springer.com/article/10.1023/A:1015609200117
