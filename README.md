# what2do

Eine kleine Web-App, die einer Gruppe vor einem gemeinsamen Abend einen kurzen Fragebogen stellt, die Antworten einsammelt und dem Host als Datenexport bereitstellt. Die Auswertung und der Aktivitätsvorschlag passieren außerhalb der App.

Konzept und Fragebogen: `docs/KONZEPT.md`.

## Stand

v0.2: Host legt einen Abend an, verteilt den Link, Teilnehmende beantworten 18 Fragen auf dem Handy, der Host sieht die Antworten und exportiert sie als JSON für den Auswertungs-Agenten. Backend ist Supabase (Postgres mit REST-API), Hosting ist GitHub Pages.

## Einrichtung

1. **Supabase**: Projekt anlegen, dann `supabase/schema.sql` im SQL-Editor ausführen (einmalig, wiederholbar). Projekt-URL und Publishable Key in `.env` eintragen. Der Key ist öffentlich, die Zugriffsregeln stehen im Schema.
2. **GitHub Pages**: Repo-Einstellungen → Pages → Source „GitHub Actions". Jeder Push auf `main` baut und veröffentlicht nach `https://<owner>.github.io/what2do/`.

## Entwicklung

```
npm install
npm run dev        # Dev-Server, auch im lokalen Netz erreichbar (fürs Handy)
npm test           # Vitest
npm run build      # Typecheck + Produktions-Build nach dist/
npm run preview    # gebaute Version ausliefern
```

## Routen

- `#/` Host: neuen Abend anlegen, eigene Abende auf diesem Gerät
- `#/s/<id>` Teilnehmende: Fragebogen
- `#/host/<id>/<token>` Host: Link teilen, Antworten ansehen, Export

## Sicherheit

Teilnehmende dürfen mit dem öffentlichen Key nur einen Abend lesen (Titel, Kontext) und eine Antwort einfügen, nie Antworten lesen. Der Host-Token wird beim Anlegen einmal ausgegeben und nur als Hash gespeichert; Antworten liest ausschließlich die Funktion `host_responses` gegen diesen Hash. Wer den Host-Link hat, ist Host.

## Struktur

- `src/questionnaire/schema.ts`: die Fragen (v2, psychologisch und projektiv). Ids sind der Vertrag mit dem Auswertungs-Agenten, nicht umbenennen.
- `src/questionnaire/logic.ts`: Validierung, Toggle-Logik, Anzeige-Formatierung.
- `src/questionnaire/export.ts`: Codebook und Host-Export.
- `src/api.ts`: REST-Aufrufe an Supabase. `src/router.ts`: Hash-Routing.
- `src/screens/`: NewSession, Host, Participant (Intro, Fragen, Summary, Done).
- `src/styles.css`: alle Design-Tokens stehen oben in `:root`.
- `supabase/schema.sql`: Tabellen, Zugriffsregeln, Host-Funktionen.
