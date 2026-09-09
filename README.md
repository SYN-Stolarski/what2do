# what2do

Eine kleine Web-App, die einer Gruppe vor einem gemeinsamen Abend einen kurzen Fragebogen stellt, die Antworten einsammelt und als Datenexport bereitstellt. Die Auswertung und der Aktivitätsvorschlag passieren außerhalb der App.

Konzept und Fragebogen: `docs/KONZEPT.md`.

## Stand

v0.1: nur der Fragenflow, mobile-first, ohne Backend. Antworten bleiben im Browser (localStorage). Der Endscreen zeigt die eigenen Antworten und schickt sie „an den Host"; das Backend dafür fehlt noch (siehe `src/submit.ts`). Session-Verwaltung, Sammel-Export für den Host und Hosting folgen.

## Entwicklung

```
npm install
npm run dev        # Dev-Server, auch im lokalen Netz erreichbar (fürs Handy)
npm test           # Vitest
npm run build      # Typecheck + Produktions-Build nach dist/
npm run preview    # gebaute Version ausliefern
```

## Struktur

- `src/questionnaire/schema.ts`: die Fragen (v2, psychologisch und projektiv). Ids sind der Vertrag mit dem Auswertungs-Agenten, nicht umbenennen.
- `src/questionnaire/logic.ts`: Validierung, Toggle-Logik, Anzeige-Formatierung.
- `src/questionnaire/export.ts`: JSON-Export mit eingebettetem Codebook.
- `src/styles.css`: alle Design-Tokens stehen oben in `:root`.
- `src/App.tsx`: Flow (Intro, Fragen, Zusammenfassung, Danke-Screen), Auto-Advance bei Einfachauswahl.
- `src/submit.ts`: Sende-Schnittstelle. In v0.1 nur lokal markiert, hier kommt später der POST an das Backend hin.
