# Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Mario Costabile's single-page portfolio to `https://mariocostabile.github.io/`, built and deployed by a GitHub Action that pulls his pinned repos daily.

**Architecture:** Static `index.html` + `style.css` + `main.js`, no framework. A dependency-free Node script (`scripts/fetch-projects.mjs`) runs in the Action, queries GitHub GraphQL for pinned repos and writes `data/projects.json` into the build folder; the page fetches that JSON at runtime. The visual design is already approved and lives in `docs/design/approved-preview.html` — the page is extracted from it, not redesigned.

**Tech Stack:** HTML/CSS/vanilla JS, Node 22 (native `fetch`, `node:test`), GitHub Actions + GitHub Pages, `gh` CLI for repo setup.

**Read first:** `docs/superpowers/specs/2026-10-14-portfolio-design.md` (behaviour), `PRODUCT.md` (all copy — never invent text), `.impeccable/surfaces/index-html.md` (design contract).

**Shell:** commands are Git Bash. `gh` lives at `"/c/Program Files/GitHub CLI/gh.exe"` if it is not on PATH yet — alias it with `gh() { "/c/Program Files/GitHub CLI/gh.exe" "$@"; }`.

---

## File map

| File | Responsibility |
|---|---|
| `scripts/fetch-projects.mjs` | `toProjects()` (pure: GraphQL response → JSON shape) + `main()` (HTTP call, CV check, write file) |
| `scripts/fetch-projects.test.mjs` | node:test unit tests for `toProjects()` |
| `index.html` | markup + Italian copy (default language) |
| `style.css` | all styles (extracted from the approved preview + 2 small additions) |
| `main.js` | i18n, fetching/rendering projects, error state, CV button, copy-email |
| `assets/cv/LEGGIMI.md` | tells Mario where to drop the CV PDF |
| `.github/workflows/deploy.yml` | test → build `_site/` → deploy Pages; push / daily / manual |

---

### Task 1: Data script — `toProjects()` with tests

**Files:**
- Create: `scripts/fetch-projects.test.mjs`
- Create: `scripts/fetch-projects.mjs`

- [ ] **Step 1: Write the failing tests**

`scripts/fetch-projects.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { toProjects } from "./fetch-projects.mjs";

const repo = (name, extra = {}) => ({
  name,
  description: `${name} desc`,
  url: `https://github.com/mariocostabile/${name}`,
  homepageUrl: "",
  stargazerCount: 0,
  pushedAt: "2026-10-01T00:00:00Z",
  primaryLanguage: { name: "Python", color: "#3572A5" },
  repositoryTopics: { nodes: [{ topic: { name: "python" } }, { topic: { name: "bot" } }] },
  ...extra,
});
const response = (nodes) => ({ data: { user: { pinnedItems: { nodes } } } });
const now = new Date("2026-10-14T04:00:00Z");

test("keeps pin order and maps every field", () => {
  const out = toProjects(response([repo("B", { stargazerCount: 3 }), repo("A")]), { now, hasCV: true });
  assert.equal(out.syncedAt, "2026-10-14T04:00:00.000Z");
  assert.equal(out.hasCV, true);
  assert.deepEqual(out.projects.map((p) => p.name), ["B", "A"]);
  assert.deepEqual(out.projects[0], {
    name: "B",
    description: "B desc",
    url: "https://github.com/mariocostabile/B",
    homepage: null,
    language: "Python",
    color: "#3572A5",
    topics: ["python", "bot"],
    stars: 3,
    pushedAt: "2026-10-01T00:00:00Z",
  });
});

test("tolerates missing description/language and drops a non-hex colour", () => {
  const [a, b] = toProjects(response([
    repo("A", { description: null, primaryLanguage: null }),
    repo("B", { primaryLanguage: { name: "Java", color: "red;background:url(x)" } }),
  ]), { now }).projects;
  assert.equal(a.description, "");
  assert.equal(a.language, null);
  assert.equal(a.color, null);
  assert.equal(b.language, "Java");
  assert.equal(b.color, null);
});

test("refuses to publish an empty projects section", () => {
  assert.throws(() => toProjects(response([]), { now }), /No pinned repositories/);
});

test("surfaces GraphQL errors", () => {
  assert.throws(() => toProjects({ errors: [{ message: "Bad credentials" }] }, { now }), /Bad credentials/);
});

test("fails when the user is missing", () => {
  assert.throws(() => toProjects({ data: { user: null } }, { now }), /not found/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test scripts/*.test.mjs`
Expected: FAIL — `Cannot find module '.../scripts/fetch-projects.mjs'`.

- [ ] **Step 3: Write the implementation**

`scripts/fetch-projects.mjs`:

```js
// Runs in the GitHub Action: pinned repos of LOGIN -> JSON consumed by main.js.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";

const LOGIN = "mariocostabile";
const CV_PATH = "assets/cv/cv-mario-costabile.pdf";
const HEX = /^#[0-9a-f]{3,8}$/i;
const QUERY = `query($login: String!) {
  user(login: $login) {
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes { ... on Repository {
        name description url homepageUrl stargazerCount pushedAt
        primaryLanguage { name color }
        repositoryTopics(first: 6) { nodes { topic { name } } }
      } }
    }
  }
}`;

export function toProjects(response, { now = new Date(), hasCV = false } = {}) {
  if (response.errors?.length) throw new Error("GitHub GraphQL: " + response.errors.map((e) => e.message).join("; "));
  const user = response.data?.user;
  if (!user) throw new Error(`GitHub user "${LOGIN}" not found`);
  const nodes = user.pinnedItems?.nodes ?? [];
  if (!nodes.length) throw new Error("No pinned repositories: refusing to publish an empty projects section");
  return {
    syncedAt: now.toISOString(),
    hasCV,
    projects: nodes.map((r) => ({
      name: r.name,
      description: r.description ?? "",
      url: r.url,
      homepage: r.homepageUrl || null,
      language: r.primaryLanguage?.name ?? null,
      color: HEX.test(r.primaryLanguage?.color ?? "") ? r.primaryLanguage.color : null,
      topics: r.repositoryTopics.nodes.map((n) => n.topic.name),
      stars: r.stargazerCount,
      pushedAt: r.pushedAt,
    })),
  };
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is missing. Locally: GITHUB_TOKEN=$(gh auth token) node scripts/fetch-projects.mjs data/projects.json");
  const out = process.argv[2] ?? "_site/data/projects.json";
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json", "User-Agent": LOGIN },
    body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
  });
  if (!res.ok) throw new Error(`GitHub API HTTP ${res.status}: ${await res.text()}`);
  const data = toProjects(await res.json(), { hasCV: existsSync(CV_PATH) });
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(data, null, 2));
  console.log(`Wrote ${data.projects.length} projects to ${out} (CV: ${data.hasCV})`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test scripts/*.test.mjs`
Expected: `# pass 5`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add scripts/
git commit -m "feat: fetch pinned repos from GitHub GraphQL into projects.json"
```

---

### Task 2: Page files extracted from the approved preview

**Files:**
- Create: `style.css`, `index.html` (generated from `docs/design/approved-preview.html`)
- Create: `main.js`

- [ ] **Step 1: Extract `style.css` and the `index.html` skeleton**

Run from the repo root:

```bash
python - <<'EOF'
import re
src = open("docs/design/approved-preview.html", encoding="utf-8").read()
css = re.search(r"<style>\n(.*?)</style>", src, re.S).group(1)
css += """
[hidden] { display: none !important; }
.perror { padding: 24px 12px; border-bottom: 1px solid var(--rule); color: var(--muted); }
"""
open("style.css", "w", encoding="utf-8", newline="\n").write(css)
html = re.sub(r"<style>\n.*?</style>", '<link rel="stylesheet" href="style.css">', src, flags=re.S)
html = re.sub(r"<script>\n.*?</script>", '<script src="main.js" defer></script>', html, flags=re.S)
open("index.html", "w", encoding="utf-8", newline="\n").write(html)
EOF
```

Expected: `style.css` starts with `:root {` and ends with the `.perror` rule; `index.html` contains no `<style>` and exactly one `<script src="main.js" defer></script>`.

- [ ] **Step 2: Apply the three markup edits to `index.html`**

(a) After `<title>Mario Costabile</title>` add:

```html
<meta name="description" content="Mario Costabile — laureato in Ingegneria Informatica, studente magistrale in Artificial Intelligence & Machine Learning all'Università della Calabria. Progetti, competenze e contatti.">
```

(b) Add the hidden CV button after "Vedi i progetti". Replace:

```html
        <a class="btn" href="#projects"><span data-i18n="cta_projects">Vedi i progetti</span> <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16M6 14l6 6 6-6"/></svg></a>
      </div>
```

with:

```html
        <a class="btn" href="#projects"><span data-i18n="cta_projects">Vedi i progetti</span> <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16M6 14l6 6 6-6"/></svg></a>
        <a class="btn" id="cv" href="assets/cv/cv-mario-costabile.pdf" download hidden><span data-i18n="cta_cv">Scarica CV</span> <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg></a>
      </div>
```

(c) Replace `src="https://avatars.githubusercontent.com/u/105019269?v=4"` with `src="https://avatars.githubusercontent.com/u/105019269"` (no cache-busting param, so GitHub always serves the current photo).

- [ ] **Step 3: Write `main.js`**

```js
// Italian copy lives in index.html; English overrides live here.
const T = {
  it: {},
  en: {
    skip: "Skip to content", nav_about: "About", nav_edu: "Education", nav_skills: "Skills", nav_projects: "Projects", nav_contact: "Contact",
    role: "BSc in Computer Engineering",
    lead: "Currently an MSc student in Artificial Intelligence & Machine Learning at the University of Calabria.",
    cta_contact: "Get in touch", cta_projects: "See projects", cta_cv: "Download CV", f_city: "City", f_study: "Studying",
    about: "I approach every project with method and see it through to the end. I'm not content with what I already know: I look for chances to learn and enjoy taking on different fields, from artificial intelligence to web and mobile development.",
    msc: "MSc in Artificial Intelligence & Machine Learning", bsc: "BSc in Computer Engineering", unical: "University of Calabria", ongoing: "Ongoing",
    sk_lang: "Languages", sk_other: "Other", sk_other_v: "Concurrency & multithreading · Telegram bots",
    col_lang: "Language", col_upd: "Updated",
    all_repos: "See all repositories", contact_intro: "For internship or job opportunities, get in touch.", copy: "Copy", copied: "Copied", italy: "Italy",
    synced: "Synced with GitHub", stars: "stars",
    load_error: "Projects can't be loaded right now.", load_error_link: "See them on GitHub",
  },
};
document.querySelectorAll("[data-i18n]").forEach((e) => { T.it[e.dataset.i18n] ??= e.textContent; });
Object.assign(T.it, {
  synced: "Sincronizzato con GitHub", stars: "stelle", copied: "Copiata",
  load_error: "Non riesco a caricare i progetti in questo momento.", load_error_link: "Vedili su GitHub",
});

const REPOS_URL = "https://github.com/mariocostabile?tab=repositories";
const EMAIL = "mariocostabile05@gmail.com";
const $ = (s) => document.querySelector(s);
let lang, data = null, failed = false;

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function renderProjects() {
  const t = T[lang], list = $("#plist");
  if (failed) {
    const li = el("li", "perror", t.load_error + " "), a = el("a", null, t.load_error_link);
    a.href = REPOS_URL;
    li.append(a);
    list.replaceChildren(li);
    $("#sync").textContent = "";
    return;
  }
  if (!data) return;
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const ago = (iso) => {
    const d = (new Date(iso) - Date.now()) / 864e5;
    if (Math.abs(d) < 30) return rtf.format(Math.round(d), "day");
    if (Math.abs(d) < 365) return rtf.format(Math.round(d / 30), "month");
    return rtf.format(Math.round(d / 365), "year");
  };
  list.replaceChildren(...data.projects.map((p, i) => {
    const li = el("li", "prow");
    li.append(el("span", "n", String(i + 1).padStart(2, "0")));
    const main = el("div"), h = el("h3"), a = el("a");
    a.href = p.url;
    a.append(el("span", null, p.name));
    h.append(a);
    main.append(h);
    if (p.description) main.append(el("p", "d", p.description));
    const tp = el("p", "topics");
    p.topics.forEach((x) => tp.append(el("span", null, "#" + x)));
    if (p.stars) tp.append(el("span", null, `★ ${p.stars} ${t.stars}`));
    main.append(tp);
    const lc = el("span", "lang-c");
    if (p.language) {
      const dot = el("i", "dot");
      dot.style.background = p.color ?? "var(--muted)";
      lc.append(dot, p.language);
    }
    const go = el("span", "go");
    go.setAttribute("aria-hidden", "true");
    go.innerHTML = '<svg class="i" viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg>'; // static markup, no data
    li.append(main, lc, el("span", "upd", ago(p.pushedAt)), go);
    return li;
  }));
  const day = new Date(data.syncedAt).toLocaleDateString(lang, { day: "numeric", month: "short", year: "numeric" });
  $("#sync").textContent = `${t.synced} · ${day}`;
}

function render(l) {
  lang = l;
  document.querySelectorAll("[data-i18n]").forEach((e) => { e.textContent = T[l][e.dataset.i18n]; });
  document.documentElement.lang = l;
  document.querySelectorAll(".lang button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.lang === l));
  renderProjects();
}

document.querySelectorAll(".lang button").forEach((b) => b.addEventListener("click", () => {
  try { localStorage.setItem("lang", b.dataset.lang); } catch {}
  render(b.dataset.lang);
}));

$("#copy").addEventListener("click", async (e) => {
  const label = e.currentTarget.querySelector("span");
  try {
    await navigator.clipboard.writeText(EMAIL);
    label.textContent = T[lang].copied;
    setTimeout(() => { label.textContent = T[lang].copy; }, 1800);
  } catch {} // clipboard blocked: the mailto link next to it still works
});

let saved = null;
try { saved = localStorage.getItem("lang"); } catch {}
render(saved === "it" || saved === "en" ? saved : navigator.language.startsWith("it") ? "it" : "en");

fetch("data/projects.json")
  .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then((d) => { data = d; $("#cv").hidden = !d.hasCV; })
  .catch(() => { failed = true; })
  .finally(renderProjects);
```

- [ ] **Step 4: Verify locally with real data**

```bash
GITHUB_TOKEN=$(gh auth token) node scripts/fetch-projects.mjs data/projects.json
python -m http.server 8000
```

Expected first line: `Wrote 6 projects to data/projects.json (CV: false)`. Open `http://localhost:8000`: six project rows in pin order, sync line with today's date, no "Scarica CV" button, IT/EN toggle switches every label and survives a reload.

Then stop the server, rename `data/projects.json` to `data/x.json`, restart, reload: the table shows "Non riesco a caricare i progetti in questo momento. Vedili su GitHub". Rename it back.

- [ ] **Step 5: Commit**

```bash
git add index.html style.css main.js
git commit -m "feat: portfolio page from the approved design, projects loaded from JSON"
```

---

### Task 3: CV placeholder

**Files:**
- Create: `assets/cv/LEGGIMI.md`

- [ ] **Step 1: Write the placeholder**

```markdown
# Dove va il CV

Metti qui il tuo curriculum in PDF con questo nome esatto:

    assets/cv/cv-mario-costabile.pdf

Poi fai commit e push. Alla build successiva il bottone "Scarica CV" compare da solo nell'hero.
Finché il file non esiste, il bottone resta nascosto. Questo file LEGGIMI.md non viene pubblicato.
```

- [ ] **Step 2: Verify the CV switch**

```bash
cp docs/design/approved-preview.html assets/cv/cv-mario-costabile.pdf   # any file works for the existence check
GITHUB_TOKEN=$(gh auth token) node scripts/fetch-projects.mjs data/projects.json
rm assets/cv/cv-mario-costabile.pdf
```

Expected: `... (CV: true)`. Then rerun the script once more and expect `(CV: false)`.

- [ ] **Step 3: Commit**

```bash
git add assets/cv/LEGGIMI.md
git commit -m "docs: CV placeholder location"
```

---

### Task 4: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: Deploy portfolio

on:
  push:
    branches: [main]
  schedule:
    - cron: "0 4 * * *" # daily refresh of pinned repos
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
      - name: Test
        run: node --test scripts/*.test.mjs
      - name: Build
        run: |
          mkdir -p _site
          cp index.html style.css main.js _site/
          cp -r assets _site/
          rm -f _site/assets/cv/LEGGIMI.md
          node scripts/fetch-projects.mjs _site/data/projects.json
        env:
          # PINNED_TOKEN is optional: only needed if GITHUB_TOKEN can't read pinned items
          GITHUB_TOKEN: ${{ secrets.PINNED_TOKEN || secrets.GITHUB_TOKEN }}
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v4
        with:
          path: _site
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Dry-run the build steps locally**

```bash
rm -rf _site && mkdir -p _site && cp index.html style.css main.js _site/ && cp -r assets _site/ && rm -f _site/assets/cv/LEGGIMI.md \
  && GITHUB_TOKEN=$(gh auth token) node scripts/fetch-projects.mjs _site/data/projects.json && find _site -type f | sort
```

Expected exactly: `_site/data/projects.json`, `_site/index.html`, `_site/main.js`, `_site/style.css` (no `docs/`, no `PRODUCT.md`, no `LEGGIMI.md`). Then `rm -rf _site`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: test, build and deploy to GitHub Pages on push, daily and on demand"
```

---

### Task 5: Create the GitHub repo, enable Pages, deploy

Requires `gh auth status` to show the account `mariocostabile` with the `workflow` scope.

- [ ] **Step 1: Make sure the repo name is free**

Run: `gh repo view mariocostabile/mariocostabile.github.io`
Expected: `Could not resolve to a Repository`. If it exists, STOP and ask Mario before touching it.

- [ ] **Step 2: Create the repo and enable Pages via Actions (before the first push)**

```bash
gh repo create mariocostabile/mariocostabile.github.io --public --source . --remote origin \
  --description "Portfolio personale" --homepage https://mariocostabile.github.io
gh api -X POST repos/mariocostabile/mariocostabile.github.io/pages -f build_type=workflow
```

Expected: repo URL printed; the API returns JSON with `"build_type": "workflow"`.

- [ ] **Step 3: Push and watch the run**

```bash
git push -u origin main
gh run watch --repo mariocostabile/mariocostabile.github.io --exit-status
```

Expected: all steps green. If the Build step fails with a GraphQL permission error on `pinnedItems`: Mario creates a fine-grained token (public repositories read-only) at github.com/settings/personal-access-tokens, then `gh secret set PINNED_TOKEN --repo mariocostabile/mariocostabile.github.io` and `gh workflow run deploy.yml --repo mariocostabile/mariocostabile.github.io`.

- [ ] **Step 4: Verify the live site**

```bash
curl -s https://mariocostabile.github.io/data/projects.json | head -c 300
curl -s -o /dev/null -w "%{http_code}\n" https://mariocostabile.github.io/PRODUCT.md
```

Expected: JSON starting with `{"syncedAt"` and containing `AE-XAD-BUSI`; second command prints `404`.

---

### Task 6: Finish — inspection, review, DESIGN.md

- [ ] **Step 1: Screenshots** (headless Chrome, reduced motion so the entrance animations are settled) of `https://mariocostabile.github.io/` into `.impeccable/review/`: `desktop.png` (1440×3400), `mobile.png` (390 wide — render through an iframe page, headless Chrome clamps windows below ~500px), `dark.png` (`--force-dark-mode --blink-settings=preferredColorScheme=0`). Open each and confirm it shows the full live page.

- [ ] **Step 2: Detector**

Run: `"C:/Users/mario/.claude/plugins/cache/impeccable/impeccable/4.5.2/skills/impeccable/scripts/impeccable" detect --json index.html style.css`
Known false positive: `cramped-padding` on `section.s` / `.body` (the inset comes from `clamp()` padding on the children).

- [ ] **Step 3: Finish reviewer** — spawn `impeccable:impeccable-finish-reviewer` fresh with: the original request, PRODUCT.md, the spec, the direction contract (`.impeccable/surfaces/index-html.md`), the screenshots, detector output, `docs/design/approved-preview.html` as critique reference, craft-floor path. Act on its disposition (ship / fix / rebuild / recapture).

- [ ] **Step 4: Documenter** — spawn `impeccable:impeccable-documenter` with project root, `index.html`, the direction contract, PRODUCT.md; verify `DESIGN.md` and `.impeccable/design.json` exist. Commit and push:

```bash
git add DESIGN.md .impeccable/
git commit -m "docs: DESIGN.md from the shipped build"
git push
```
