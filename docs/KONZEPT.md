# what2do – Inhaltliches Konzept (Entwurf v0.2)

Stand: 2026-09-09 · Status: v0.2 mit Host-Flow, Supabase-Backend und Pages-Deploy; Fragebogen v2 (psychologisch, projektiv)

## 0. Getroffene Entscheidungen

| Thema | Entscheidung | Auswirkung |
|---|---|---|
| Gruppe | Hypothese: immer dieselben Leute | v1 speichert keine Profile. Der Export enthält Spitznamen, sodass der Auswertungs-Agent über mehrere Abende hinweg Muster erkennen kann. Profil-Speicherung ist Kandidat für v2. |
| Ort | Alles im Umkreis von Duisburg | Host-Kontext hat Duisburg als Default. Fahrweite bleibt Teilnehmer-Frage. Konkrete Locations schlägt später der Agent vor, nicht die App. |
| Anonymität | Host sieht Namen | Spitzname ist Pflicht, für andere Teilnehmende nicht sichtbar. |
| Rahmenbedingungen | Alle geben Zeit, Budget, Mobilität selbst an | Block B bleibt vollständig. Host gibt nur Datum, Ort, Wetter, Gruppengröße vor. |
| Häufigkeit | Einmal pro Abend | Jeder Abend ist eine eigene Session mit eigener URL. Keine Wiederverwendung. |
| Sprache | Deutsch, Du-Form | Keine Mehrsprachigkeit in v1. |
| Export | Nur Daten, kein Prompt | JSON mit Codebook aus dem Host-Screen. Der Auswertungs-Agent wird separat gebaut (siehe Abschnitt 5). |
| Backend, Hosting | Supabase, GitHub Pages | Statische App auf Pages, Antworten in Postgres, Host-Token als Hash. Schema in `supabase/schema.sql`. |

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

## 3. Der Fragebogen (v2: psychologisch und projektiv)

### 3.1 Warum nicht direkt fragen

Die erste Fassung fragte Logistik ab („Budget bis 15 €", „Drinnen oder draußen"). Das ist präzise, aber flach: Es sagt dem Agenten, was jemand *sagt*, nicht, was jemand *braucht*. Die zweite Fassung dreht das um. Sie erhebt den inneren Zustand, das Bedürfnis dahinter und die gewünschte Form des Abends in Bildern, und überlässt dem Agenten die Übersetzung in eine Aktivität.

Methodische Grundlage dafür:

- **Projektive Verfahren** (Metaphern, Genre, Wetter): Menschen können ihre Stimmung schlechter benennen als in ein Bild übersetzen. Ein Bild transportiert mehrere Dimensionen gleichzeitig (Valenz, Arousal, Richtung), ohne dass die Person sie auseinandernehmen muss. Wer „Gewitter" wählt, liefert negative Valenz, hohes Arousal und einen Bewegungsimpuls in einem Tipp.
- **Zustand vor Persönlichkeit** (Circumplex-Modell, Russell 1980): Körperempfinden, Sozial-Akku und Kopf-Füllstand sind die drei Zustandsachsen, die den Abend am stärksten bestimmen.
- **Basic Psychological Needs** (Self-Determination Theory, Deci & Ryan): Verbundenheit, Autonomie, Kompetenz. Was in der Woche gefehlt hat, will der Abend nachholen. Die Ranking-Frage macht daraus ein Bedürfnisprofil.
- **Escape-Motivation** (Beard & Ragheb, Stimulus-Avoidance): Wovon jemand weg will, ist oft klarer als wohin. Deshalb eine eigene Frage.
- **Peak-End-Regel** (Kahneman): Ein Abend wird über seinen Höhepunkt und sein Ende erinnert. „Was soll morgen übrig sein?" fragt nach dem gewünschten Ende und damit nach dem Sinn des Abends.
- **Need for Closure und Kontrollbedürfnis**: Überraschung vs. Planbarkeit trennt Escape Room und Roadtrip von Stammkneipe und Filmabend.
- **Risikotoleranz** (Sensation Seeking, Hoyle et al.): „Wie viel darf schiefgehen" ist die zugängliche Alltagsform davon.
- **Gruppenrollen** (Belbin, informell): Wer heute anstiften, gastgeben, mitspielen oder beobachten will, entscheidet mit, ob die Gruppe eine Aktivität trägt. Fünf Beobachter tragen keinen Lasertag.
- **Anti-Ziele als Vetos** (Least Misery, Masthoff): „Womit wäre der Abend verschwendet" ist psychologisch ehrlicher als eine No-Go-Liste und liefert dieselben harten Filter.

Logistik, die nicht im Kopf der Teilnehmenden liegt (Ort, Wetter, Autos, Kinder), gibt der Host beim Anlegen des Abends vor. Nur Geld und Länge bleiben im Fragebogen, weil sie individuell und tagesabhängig sind.

### 3.2 Die Fragen

Sprache: Deutsch, Du-Form, mobile-first, ein Item pro Screen. Zeitziel: 3–4 Minuten. `*` = Pflicht.

**Block 0 – Wer bist du**

| Nr. | Frage | Antwort |
|---|---|---|
| 0 `*` | Wie sollen wir dich nennen? | Freitext, nur Host sieht ihn |

**Block A – Innenwetter** (aktueller Zustand)

| Nr. | Frage | Antwort | Was der Agent daraus liest |
|---|---|---|---|
| 1 `*` | Wenn dein heutiger Tag ein Wetter wäre, welches? | Klarer Himmel · Leicht bewölkt · Nebel · Dauerregen · Gewitter · Schwül und windstill | Valenz und Arousal in einem Bild. Nebel: braucht Struktur. Regen: nach innen, niedrigschwellig. Gewitter: raus, Bewegung, Ventil. Schwül: Reiz ohne Richtung, die Gruppe soll Richtung geben. |
| 2 `*` | Wie fühlt sich dein Körper gerade an? | Schwer wie Blei · Angenehm müde · Unauffällig · Unruhig, will sich bewegen · Elektrisch | Körperliches Arousal. Least Misery: „Blei" setzt die Obergrenze für das Aktivitätsniveau. |
| 3 `*` | Wie voll ist dein Sozial-Akku? | Skala 1–5 | Verträgliche Reizmenge. Least Misery: der leerste Akku bestimmt Gruppengröße, Lautstärke, Fremdkontakt. |
| 4 `*` | Wie voll ist dein Kopf? | Skala 1–5 | Kognitive Last. Hoch: braucht Auslauf oder Berieselung, keine Denkaufgabe. Niedrig: offen für Neues, Rätsel, Lernen. |

**Block B – Bedürfnis** (was dahinter liegt)

| Nr. | Frage | Antwort | Was der Agent daraus liest |
|---|---|---|---|
| 5 `*` | Was hat dir in den letzten Tagen am meisten gefehlt? | Ranking: Nähe · Selbstbestimmung · Wirksamkeit · Nichts müssen | Bedürfnisprofil nach SDT plus Escape. Borda-Summe ergibt das dominante Gruppenbedürfnis. Nähe: Gespräch im Zentrum. Wirksamkeit: etwas schaffen, Spiel, Bauen, Kochen. Selbstbestimmung: offene Formate, wenig Programm. Nichts müssen: Sofa, Sauna, Kino. |
| 6 `*` | Wovon willst du heute Abend weg? | Mehrfach: Bildschirmen · Menschen · eigenen Gedanken · Routine · Stille · Leistung · Entscheidungen · Nichts | Ausschlusskriterien und Richtung. „Bildschirmen": kein Film, keine Games. „Gedanken": Absorption, Flow, Körper. „Routine": Neues, Ortswechsel. „Entscheidungen": der Agent soll einen klaren Vorschlag machen, keine Optionen. |
| 7 `*` | Was soll morgen früh von heute Abend übrig sein? | Geschichte · Ausgeruhter Kopf · Nähe · Etwas gelernt oder geschafft · Lachmuskelkater · Einfach ein guter Abend | Gewünschtes Ende und Sinn. Approval-Zählung: das häufigste „Übrig" ist der Zielzustand, gegen den Vorschläge geprüft werden. |

**Block C – Form** (wie der Abend sich anfühlen soll)

| Nr. | Frage | Antwort | Was der Agent daraus liest |
|---|---|---|---|
| 8 `*` | Der heutige Abend als Film. Welches Genre? | Komödie · Roadmovie · Thriller · Doku · Feel-Good-Drama · Arthouse · Action | Projektive Kernfrage. Komödie: laut, albern, Spiele, Karaoke. Roadmovie: unterwegs, mehrere Stationen. Thriller: Escape Room, Krimi-Dinner, Wettkampf. Doku: Ausstellung, Vortrag, Workshop, neues Viertel. Feel-Good: Kochen, Gespräch, Kneipe. Arthouse: langsam, schön, Spaziergang, Konzert, seltsamer Ort. Action: Sport, Bouldern, Lasertag. Bei Streuung: Genre-Mix als zweiteiliger Abend. |
| 9 `*` | Welches Tempo hat der Abend? | Spaziergang · Flotter Gang · Sprint · Marathon mit Pausen | Dramaturgie und Dauer. Least Misery auf Intensität. „Marathon" bei mehreren: Stationen planen. |
| 10 `*` | Willst du wissen, was kommt, oder überrascht werden? | Skala 1–5 | Kontrollbedürfnis. Niedrig: bekanntes Format, klarer Plan vorab. Hoch: der Host darf ein Geheimnis daraus machen. |
| 11 `*` | Wie viel darf heute schiefgehen? | Skala 1–5 | Risikotoleranz. Least Misery: das niedrigste Level begrenzt Experimente (neues Lokal, unbekannte Aktivität, Wetterabhängigkeit). |
| 12 `*` | Welche Rolle willst du heute in der Gruppe haben? | Anstifter · Gastgeber · Spielmacher · Mitläufer · Beobachter | Gruppendynamik. Kein Anstifter: der Vorschlag muss selbsttragend sein. Viele Spielmacher: Wettbewerbsformat. Viele Beobachter: kein Format, das alle auf die Bühne zwingt. |

**Block D – Rahmen und Joker**

| Nr. | Frage | Antwort | Was der Agent daraus liest |
|---|---|---|---|
| 13 `*` | Wie großzügig bist du heute mit Geld? | Skala 1–5 | Weiche Budgetgrenze. Least Misery. |
| 14 `*` | Wie lang soll der Abend sein? | Kurzer Ausflug · Ordentlicher Abend · Open End | Zeitfenster. Least Misery. |
| 15 `*` | Womit wäre der Abend für dich verschwendet? | Mehrfach: Rumsitzen · Menschenmassen · Viel Geld · Anstrengung · Lange Anfahrt · Oberflächliches Gelaber · Alkohol · Bildschirm · Vorne stehen · Nichts + Freitext | Harte Vetos. Vereinigung über alle. Freitext für Allergien, Verletzungen. |
| 16 | Ein Wort, das der Abend am Ende verdient haben soll. | Freitext, optional | Projektiver Anker. Der Agent nutzt die Wörter als Tonalität des Vorschlags und prüft, ob der Vorschlag zu allen Wörtern passen kann. |
| 17 | Wenn du allein entscheiden dürftest, was würden wir heute machen? | Freitext, optional | Hidden Profile. Ideen, die sonst niemand ausspricht. |

**Gesamt: 18 Items (16 Pflicht, 2 optional), geschätzt 3,5 bis 4 Minuten.** Fünfzehn davon sind Ein-Tipp-Antworten.

### 3.3 Host-Kontext (füllt nur der Host beim Anlegen, ~1 Minute)

- Datum, Startzeit, Ort (Default: Duisburg; bzw. „bei X zu Hause")
- Wetter-Erwartung
- Erwartete Gruppengröße
- Mobilität: Autos vorhanden, ÖPNV okay
- Optional: Besonderheiten (Kinder dabei, jemand hat Geburtstag, Wochentag)

## 4. Export-Format

Der Export enthält **nur Daten**, keinen Prompt. Die Aufbereitung übernimmt ein separat gebauter Auswertungs-Agent. Der Export muss aber so gebaut sein, dass dieser Agent ihn ohne Erklärung versteht.

**Primärformat: JSON** (eine Datei pro Abend)

```
{
  "schema_version": "1.0",
  "session": { "id", "title", "created_at", "context": { "date", "time", "place", "weather", "group_size", "notes" } },
  "codebook": [ { "id": "q01", "block": "A", "text", "type", "scale", "aggregation" }, ... ],
  "responses": [
    { "nickname", "submitted_at", "answers": { "q01": 2, "q03": ["social","avoid","master","intellect"], ... } },
    ...
  ]
}
```

- `codebook` ist Teil jeder Exportdatei, damit der Agent nie ein externes Schema braucht.
- `aggregation` pro Frage (`least_misery`, `average`, `borda`, `approval`, `union`, `text`) ist die Anweisung an den Agenten, wie er zusammenfassen soll.
- Antworten sind kodiert (Zahlen, Schlüssel), nicht als Labeltext. Die Labels stehen im Codebook.

Der Host bekommt diese Datei im Host-Screen per „Export kopieren" oder als Download. Markdown und CSV sind für später vorgemerkt, falls der Agent sie braucht.

## 5. Auswertungslogik (für den Agenten, nicht in der App)

Diese Logik wird nicht in der App implementiert. Sie ist die Spezifikation für den Auswertungs-Agenten, den wir separat vorbereiten. Der Agent bekommt den JSON-Export, kennt Duisburg und Umgebung und liefert konkrete Vorschläge inklusive Locations.

Reihenfolge, in der die Auswertung vorgehen sollte:

1. **Harte Filter anwenden** (Least Misery): Vereinigung aller Vetos aus „Verschwendet" und „Weg von", Minimum von Länge und Geld, Host-Kontext (Ort, Wetter, Mobilität).
2. **Zustands-Obergrenze setzen**: Der schwerste Körper, der leerste Sozial-Akku und die niedrigste Chaos-Toleranz begrenzen Aktivitätsniveau, Reizmenge und Experimentierfreude.
3. **Bedürfnisprofil bilden**: Borda-Summen aus „Was fehlt", Approval aus „Was bleibt" → dominantes Bedürfnis und Zielzustand der Gruppe.
4. **Form ableiten**: Genre- und Tempo-Verteilung in ein Aktivitätsformat übersetzen (Tabelle in 3.2). Rollenverteilung prüfen: trägt die Gruppe das Format?
5. **Wetterbilder und Wörter lesen**: Innenwetter und das „eine Wort" bestimmen die Tonalität. Bei Widerspruch zum Format (Gewitter plus Arthouse) beides bedienen: erst Ventil, dann Ruhe.
6. **Joker lesen**: Freitexte auf Ideen prüfen, die zum Profil passen, aber in keiner Frage vorkamen.
7. **Streuung prüfen**: Wenn die Gruppe bimodal ist (halb Sofa, halb Vollgas), zwei Optionen oder einen zweiteiligen Abend vorschlagen statt einen faulen Kompromiss.
8. **Ausgabe**: 1 Hauptvorschlag + 2 Alternativen, jeweils mit einem Satz Begründung, die auf die Daten verweist („Alle drei haben Reden als Hauptprogramm, niemand will Bildschirm, Energie ist niedrig → gemeinsam kochen").

## 6. Nächste Schritte

1. **Fragebogen abnehmen**: Wortlaut, Reihenfolge und Antwortoptionen der 18 Items gemeinsam durchgehen. Insbesondere Genre-Liste (Frage 8) und Veto-Liste (Frage 15) auf die Gruppe zuschneiden.
2. **Pilot auf Papier**: Fragebogen einmal mit 2–3 Leuten der Gruppe mündlich durchspielen und die Zeit stoppen, bevor Code entsteht.
3. **Codebook festziehen**: IDs, Kodierung und Aggregationsregel pro Frage als JSON-Schema fixieren. Das ist die Schnittstelle zwischen App und Agent.
4. **Technisches Konzept**: Erst danach Stack, Hosting, Session-Modell, Export-Endpunkt.
5. **Auswertungs-Agent**: Parallel zur App vorbereiten, gegen einen handgeschriebenen Beispiel-Export testen.

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
