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
    signal: AbortSignal.timeout(30_000),
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
