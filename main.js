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
    synced: "Synced with GitHub", star: "star", stars: "stars",
    load_error: "Projects can't be loaded right now.", load_error_link: "See them on GitHub",
  },
};
document.querySelectorAll("[data-i18n]").forEach((e) => { T.it[e.dataset.i18n] ??= e.textContent; });
Object.assign(T.it, {
  synced: "Sincronizzato con GitHub", star: "stella", stars: "stelle", copied: "Copiata",
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
    if (Math.abs(d) < 335) return rtf.format(Math.round(d / 30), "month"); // from ~11 months on, say "last year"
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
    if (p.stars) tp.append(el("span", null, `${p.stars} ${p.stars === 1 ? t.star : t.stars}`));
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
