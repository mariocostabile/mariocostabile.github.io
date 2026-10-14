# Portfolio di Mario Costabile — Design

Data: 2026-10-14 · Stato: approvato dall'utente (bozza visiva v3)

## Obiettivo

Sito portfolio personale per recruiter e tech lead (stage/lavoro). Pagina singola, statica, bilingue IT/EN, tema chiaro/scuro automatico. I progetti mostrati sono i repo **pinnati** sul profilo GitHub e si aggiornano da soli, senza liste scritte a mano.

Contenuti e tono: vedi `PRODUCT.md` (fonte di verità per tutti i testi). Riferimento visivo approvato: `docs/design/approved-preview.html`.

## Hosting e repo

- Repo: `mariocostabile/mariocostabile.github.io` → `https://mariocostabile.github.io/`
- GitHub Pages con sorgente **GitHub Actions** (non "deploy from branch").

## Architettura

```
index.html                 pagina unica (markup + testi IT come default)
style.css                  tutto lo stile
main.js                    i18n IT/EN, rendering progetti, bottone Copia
scripts/fetch-projects.mjs Node, gira nella Action: GraphQL → data/projects.json
scripts/fetch-projects.test.mjs  test di toProjects() con node:test
assets/cv/LEGGIMI.md       istruzioni: il CV va qui come cv-mario-costabile.pdf
.github/workflows/deploy.yml
```

Nessun framework, nessuna dipendenza npm (Node 20+ ha `fetch` e `node:test` nativi).

### Flusso dati

1. Trigger della Action: `push` su `main`, `schedule` giornaliero (cron `0 4 * * *`), `workflow_dispatch`.
2. `node --test scripts/` → se fallisce, niente deploy.
3. `node scripts/fetch-projects.mjs` con `GITHUB_TOKEN`:
   - query GraphQL `user(login:"mariocostabile") { pinnedItems(first: 6, types: REPOSITORY) { nodes { ... on Repository { name description url homepageUrl stargazerCount pushedAt primaryLanguage { name color } repositoryTopics(first: 6) { nodes { topic { name } } } } } } }`
   - `toProjects(response)` (funzione pura, esportata, testata) → `{ syncedAt, hasCV, projects: [{ name, description, url, homepage, language, color, topics, stars, pushedAt }] }` nell'ordine dei pin.
   - `hasCV = existsSync("assets/cv/cv-mario-costabile.pdf")`.
   - Scrive `_site/data/projects.json`.
4. Copia in `_site/` solo i file pubblici: `index.html`, `style.css`, `main.js`, `assets/` (senza `LEGGIMI.md`). `docs/`, `PRODUCT.md`, `scripts/` **non** vengono pubblicati.
5. `actions/upload-pages-artifact` + `actions/deploy-pages`.

`data/projects.json` non è committato (è in `.gitignore`).

### Gestione errori

- Risposta GraphQL con `errors`, HTTP non-OK, o zero pin → lo script esce con codice ≠ 0 → la Action fallisce → resta online l'ultimo deploy buono. Mai pubblicare una sezione progetti vuota.
- Nel browser: se `fetch("data/projects.json")` fallisce, al posto della lista compare un messaggio ("Non riesco a caricare i progetti ora.") con link a `github.com/mariocostabile?tab=repositories`.
- Tutto il contenuto proveniente da GitHub è inserito con `textContent` / `createElement`, mai `innerHTML` (nessuna XSS da descrizioni o topic).
- Colore linguaggio: usato solo se combacia con `/^#[0-9a-f]{3,8}$/i`, altrimenti grigio.

### Sviluppo locale

`GITHUB_TOKEN=<token> node scripts/fetch-projects.mjs --out data/projects.json` poi un server statico qualsiasi (`npx serve` o `python -m http.server`). Senza token lo script spiega cosa manca ed esce.

## Comportamento della pagina

- **Lingua:** default da `localStorage` (`lang`), altrimenti `navigator.language` (it* → IT, resto → EN). Toggle IT/EN in alto a destra, `aria-pressed`, aggiorna `<html lang>`. Testi in un oggetto `{ it, en }` in `main.js`, elementi marcati `data-i18n`. Le descrizioni dei repo restano nella lingua di GitHub.
- **Tema:** solo `prefers-color-scheme`, nessun toggle.
- **CV:** bottone "Scarica CV" nell'hero, visibile solo se `hasCV` è true; punta a `assets/cv/cv-mario-costabile.pdf` con `download`.
- **Avatar:** URL fisso `https://avatars.githubusercontent.com/u/105019269` nell'HTML: è stabile e mostra sempre la foto profilo GitHub corrente, quindi l'hero non dipende dal JSON.
- **Date:** "aggiornato N giorni/mesi fa" con `Intl.RelativeTimeFormat`; "Sincronizzato con GitHub · <data>" da `syncedAt`.
- **Contatti:** email con bottone Copia (`navigator.clipboard`, etichetta "Copiata" per 1.8s), LinkedIn, GitHub, Rende (CS). Nessun telefono.
- **Mobile:** link di navigazione nascosti sotto 860px (resta IT/EN); niente menu hamburger.

## Design visivo (approvato)

Un solo sfondo per tema. La profondità viene da struttura, non da fasce di colore.

- **Palette** — chiaro: carta `#F2F1EC`, scheda `#FBFAF6`, inchiostro `#111111`, secondario `#5E5E5A`, filetti `#D3D0C7`, accento `#1E6B4F`. Scuro: `#121211`, `#1C1C1A`, `#ECEBE6`, `#9A9993`, `#2E2E2B`, accento `#5FBF94`.
- **Font** — Archivo (variabile, asse `wdth`) per tutto il testo; JetBrains Mono solo per dati (linguaggio, date, topic, etichette tabella).
- **Struttura** — cornice: due filetti verticali ai lati del contenuto (desktop); sezioni come registro: titolo con trattino spesso | filetto verticale | contenuto; titolo sticky.
- **Hero** — nome su due righe (max 4.5rem, peso 750, `wdth` 112) con animazione di risalita; filetto inchiostro; ruolo + frase magistrale; bottoni Contattami / Vedi i progetti / (Scarica CV). A destra la scheda profilo: avatar su carta più chiara con ombra morbida, sotto Città / Studio / GitHub.
- **Progetti** — tabella: intestazione `# · Repository · Linguaggio · Aggiornato` con filetto spesso, righe con numero d'ordine dei pin, nome, descrizione, `#topic`, stelle se > 0; riga intera cliccabile, hover con tinta d'accento e sottolineatura del nome; "Sincronizzato con GitHub" con punto pulsante; bottone "Vedi tutti i repository".
- **Contatti** — filetto doppio sopra; frase "Per opportunità di stage o lavoro, scrivimi."; email + Copia; LinkedIn/GitHub come bottoni; località.
- **Dettagli** — grana carta leggera, `::selection`, focus ring in accento, scrollbar a tema, `prefers-reduced-motion` spegne animazioni.
- **Font self-hosted?** No: Google Fonts con `display=swap` (sito statico semplice, nessun vincolo privacy dichiarato).

## Test

- `scripts/fetch-projects.test.mjs` (node:test): `toProjects()` su una risposta GraphQL di esempio → ordine dei pin preservato, topic estratti, colore non valido scartato, zero pin → errore.
- Verifica manuale prima di consegnare: screenshot desktop 1440 / mobile 390 / tema scuro, toggle IT/EN, JSON mancante → messaggio d'errore.

## Fuori scope

Blog, form di contatto, analytics, toggle del tema, menu mobile, traduzione automatica delle descrizioni dei repo, dominio personalizzato.
