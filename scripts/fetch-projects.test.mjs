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
