import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("examples/BitBetMatic-example-specs");
const specsDir = path.join(root, "specs");
const legacyDir = path.join(root, "legacy-specs");

const none = ["None"];

function clean(value) {
  return String(value ?? "")
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201c|\u201d/g, '"')
    .replace(/\u00a0/g, " ")
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function slug(value) {
  return clean(value)
    .toLowerCase()
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "item";
}

function lines(value) {
  return clean(value)
    .split(/\r?\n/)
    .map((line) => clean(line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "")))
    .filter(Boolean)
    .filter((line) => !/^#+\s+/.test(line))
    .filter((line) => !/^Feature\s+/i.test(line))
    .filter((line) => !/^Story\s+/i.test(line))
    .filter((line) => !/^Goal$/i.test(line))
    .filter((line) => !/^Stories$/i.test(line));
}

function bullets(items, fallback = none) {
  const filtered = (items ?? []).map(clean).filter(Boolean);
  return (filtered.length ? filtered : fallback).map((item) => `- ${item}`).join("\n");
}

function firstParagraph(value, fallback) {
  const paragraph = clean(value)
    .split(/\n\s*\n/)
    .map((part) => clean(part))
    .find((part) => part && !part.startsWith("#"));
  return paragraph || fallback;
}

function sections(markdown) {
  const result = new Map();
  const matches = [...markdown.matchAll(/^##\s+(.+?)\s*$([\s\S]*?)(?=^##\s+|(?![\s\S]))/gm)];
  for (const match of matches) result.set(clean(match[1]).toLowerCase(), match[2].trim());
  return result;
}

function section(map, names) {
  for (const name of names) {
    const value = map.get(name.toLowerCase());
    if (value) return value;
  }
  return "";
}

function splitScope(scope, label) {
  const pattern = new RegExp(`^###\\s+${label}\\s*$([\\s\\S]*?)(?=^###\\s+|(?![\\s\\S]))`, "gmi");
  return pattern.exec(scope)?.[1] ?? "";
}

function idPrefix(number) {
  return String(Number(number)).padStart(2, "0");
}

function featureId(number, index) {
  return `F-${idPrefix(number)}${String(index).padStart(2, "0")}`;
}

function storyId(number, index) {
  return `S-${idPrefix(number)}${String(index).padStart(2, "0")}`;
}

function taskId(number, index) {
  return `T-${idPrefix(number)}${String(index).padStart(2, "0")}`;
}

function spec({ title, id, type, parent, summary, context, goals, nonGoals, requirements, acceptance, dependencies, questions, notes }) {
  const blocks = [
    [`# ${clean(title)}`],
    ["## ID", id],
    ["## Type", type],
    ["## Parent", parent ?? "None"],
    ["## Summary", clean(summary)],
    ["## Problem / Context", clean(context)],
    ["## Goals", bullets(goals)],
    ["## Non-goals", bullets(nonGoals)],
    ["## Requirements", bullets(requirements)],
    ["## Acceptance Criteria", bullets(acceptance)],
    ["## Dependencies", bullets(dependencies)],
    ["## Open Questions", bullets(questions)],
    ["## Notes", bullets(notes)],
  ].map((block) => block.join("\n"));

  return `${blocks.join("\n\n")}\n`;
}

async function archive() {
  await mkdir(legacyDir, { recursive: true });
  await mkdir(specsDir, { recursive: true });
  const safeRoot = `${root}${path.sep}`;
  for (const entry of await readdir(specsDir, { withFileTypes: true })) {
    if (entry.isDirectory() && /^epic-\d{4}-/.test(entry.name)) {
      const generated = path.join(specsDir, entry.name);
      if (!generated.startsWith(safeRoot)) {
        throw new Error(`Refusing to remove generated specs outside ${root}: ${generated}`);
      }
      await rm(generated, { recursive: true, force: true });
      continue;
    }

    if (entry.isDirectory() && /^\d{4}-/.test(entry.name)) {
      const source = path.join(specsDir, entry.name);
      const target = path.join(legacyDir, entry.name);
      if (!source.startsWith(safeRoot) || !target.startsWith(safeRoot)) {
        throw new Error(`Refusing to archive outside ${root}: ${source} -> ${target}`);
      }
      await cp(source, target, { recursive: true, force: true });
      await rm(source, { recursive: true, force: true });
    }
  }
}

async function readText(file) {
  try {
    return await readFile(file, "utf8");
  } catch {
    return "";
  }
}

async function write(relative, content) {
  const file = path.join(root, relative);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content, "utf8");
}

function explicitFeatures(markdown) {
  const starts = [];
  const featureSource = markdown.replace(/^\d+\.\s+Implementation Order[\s\S]*$/gmi, "");
  const featureLine = /^(?:\d+\.\s+\*\*)?Feature\s+([A-Z]|\d+)\s*(?:[:\-]|\u2014|\u2013)\s*(.+?)(?:\*\*)?\s*$/gmi;
  for (const match of featureSource.matchAll(featureLine)) {
    const title = clean(match[2].replace(/\*\*/g, ""));
    if (!starts.some((item) => item.title === title)) starts.push({ index: match.index, title });
  }
  return starts
    .map((item, index) => ({
      ...item,
      body: featureSource.slice(item.index, starts[index + 1]?.index ?? featureSource.length),
    }))
    .filter((item) => !/^Feature\s+\d+$/i.test(item.title));
}

function explicitStories(featureBody) {
  const starts = [];
  const storyLine = /^Story\s+\d+(?:\.\d+)?\s*(?:[:\-]|\u2014|\u2013)\s*(.+?)\s*$/gmi;
  for (const match of featureBody.matchAll(storyLine)) starts.push({ index: match.index, title: clean(match[1]) });
  return starts.map((item, index) => {
    const body = featureBody.slice(item.index, starts[index + 1]?.index ?? featureBody.length);
    const ac = /Acceptance Criteria\s*([\s\S]*?)(?=^Story\s+|^Feature\s+|(?![\s\S]))/gmi.exec(body)?.[1] ?? "";
    return {
      title: item.title,
      body,
      summary: firstParagraph(body.replace(/^Story.+$/m, ""), item.title),
      acceptance: lines(ac).slice(0, 10),
    };
  });
}

function syntheticFeatureTitles(title) {
  if (/dashboard/i.test(title)) return ["Dashboard Read Models and APIs", "Overview and Candle Coverage UI", "Strategies and Backtests UI", "Dashboard Robustness and Tests"];
  if (/profitability/i.test(title)) return ["Trend Feature Set", "TrendPullbackRegime Strategy Family", "Trade Quality Diagnostics", "Strategy Dashboard and Trace Context"];
  if (/tuning|regime/i.test(title)) return ["Bounded Candidate Grid", "Market Condition Classification", "Per-Condition Selection Artifacts", "Condition-Aware Dashboard and Trace Views"];
  if (/activation/i.test(title)) return ["Buy-And-Hold Control Candidate", "Condition Activation Selection", "Activation Persistence and Read Models", "Activation Dashboard Views"];
  if (/validation/i.test(title)) return ["Validation Configuration and Orchestration", "Validation Persistence", "Repeatability Scoring and Decisions", "Validation Read APIs and Dashboard"];
  if (/foundation/i.test(title)) return ["Foundation Repository Scaffold"];
  return [`${title} Implementation`];
}

async function convertEpic(folder) {
  const number = folder.slice(0, 4);
  const sourceSlug = folder.slice(5);
  const epicId = `E-${number}`;
  const outDir = `specs/epic-${number}-${sourceSlug}`;
  const legacyBase = path.join(legacyDir, folder);
  const markdown = await readText(path.join(legacyBase, "spec.md"));
  const map = sections(markdown);
  const rawTitle = clean((/^#\s+(.+)$/m.exec(markdown)?.[1] ?? /^Epic\s+\d+\s*(?:-|:|\u2014|\u2013)\s*(.+)$/mi.exec(markdown)?.[1] ?? sourceSlug).replace(/^\d{4}\s*(?:-|:|\u2014|\u2013)?\s*/, "").replace(/\s+Spec$/i, ""));
  const scope = section(map, ["scope"]);
  const inScope = lines(section(map, ["in scope"]) || splitScope(scope, "in scope"));
  const outScope = lines(section(map, ["out of scope"]) || splitScope(scope, "out of scope"));
  const objective = section(map, ["objective"]);
  const overview = section(map, ["overview"]) || firstParagraph(markdown, rawTitle);
  const constraints = lines(section(map, ["hard constraints (non-negotiable)", "hard constraints"]));
  const success = lines(section(map, ["success criteria", "acceptance criteria"]));
  const questions = lines(section(map, ["open questions"]));
  const dependencies = number === "0001" ? none : [`E-${String(Number(number) - 1).padStart(4, "0")}`];
  const epicGoals = lines(objective).slice(0, 8);
  const epicNonGoals = outScope.slice(0, 10);
  const epicRequirements = [...inScope.slice(0, 8), ...constraints.slice(0, 8)];
  const epicAcceptance = success.slice(0, 10);
  const support = [];
  for (const name of ["decisions.md", "clarifications.md", "plan.md"]) {
    if ((await readText(path.join(legacyBase, name))).trim()) support.push(`Archived ${name} under legacy-specs/${folder}.`);
  }
  await write(`${outDir}/epic.md`, spec({
    title: rawTitle,
    id: epicId,
    type: "Epic",
    parent: "None",
    summary: firstParagraph(overview || objective, `Canonicalized BitBetMatic epic ${number}.`),
    context: firstParagraph(overview, `Migrated from BitBetMatic legacy epic ${number}.`),
    goals: epicGoals.length ? epicGoals : [`Deliver ${rawTitle} in canonical SpecForge form.`],
    nonGoals: epicNonGoals.length ? epicNonGoals : [`Avoid unrelated work outside ${rawTitle}.`],
    requirements: epicRequirements.length ? epicRequirements : [`Preserve the migrated ${rawTitle} intent as canonical SpecForge specs.`],
    acceptance: epicAcceptance.length ? epicAcceptance : [`${rawTitle} parses and validates as canonical SpecForge specs.`],
    dependencies,
    questions,
    notes: [`Migrated from legacy-specs/${folder}/spec.md.`, ...support],
  }));

  let featureDefs = explicitFeatures(markdown);
  if (featureDefs.length === 0) featureDefs = syntheticFeatureTitles(rawTitle).map((title) => ({ title, body: markdown }));
  if (number === "0001" && featureDefs.length === 0) featureDefs = [{ title: "Foundation Repository Scaffold", body: markdown }];
  const taskLines = lines(await readText(path.join(legacyBase, "tasks.md"))).filter((line) => /^\[[ xX]\]\s+/.test(line) || /^-?\s*\[[ xX]\]\s+/.test(line));
  const tasks = taskLines.map((line) => clean(line.replace(/^\[[ xX]\]\s+/, "").replace(/^-?\s*\[[ xX]\]\s+/, "")));
  let storyIndex = 1;
  let bridgeStory;

  for (const [featureIndex, feature] of featureDefs.entries()) {
    const fid = featureId(number, featureIndex + 1);
    const featureSummary = firstParagraph(feature.body.replace(/^Feature.+$/m, ""), `Deliver ${feature.title}.`);
    await write(`${outDir}/feature-${fid.slice(2)}-${slug(feature.title)}.md`, spec({
      title: feature.title,
      id: fid,
      type: "Feature",
      parent: epicId,
      summary: featureSummary,
      context: `Migrated from BitBetMatic Epic ${number}.`,
      goals: [featureSummary],
      nonGoals: none,
      requirements: lines(feature.body).slice(0, 8),
      acceptance: success.slice(0, 5).length ? success.slice(0, 5) : [`${feature.title} is represented as a canonical SpecForge feature.`],
      dependencies: [epicId],
      questions: none,
      notes: [`Original feature material archived under legacy-specs/${folder}.`],
    }));

    let stories = explicitStories(feature.body);
    if (featureIndex === 0 && tasks.length > 0) {
      stories = [{
        title: "Implementation Task Breakdown",
        summary: `Represent the migrated ${rawTitle} task checklist as canonical implementation tasks.`,
        acceptance: ["Flat legacy checklist items have valid canonical task parents."],
        bridge: true,
      }, ...stories];
    }

    for (const story of stories) {
      const sid = storyId(number, storyIndex++);
      if (story.bridge) bridgeStory = sid;
      await write(`${outDir}/story-${sid.slice(2)}-${slug(story.title)}.md`, spec({
        title: story.title,
        id: sid,
        type: "Story",
        parent: fid,
        summary: story.summary,
        context: `Migrated from BitBetMatic Epic ${number}.`,
        goals: [story.summary],
        nonGoals: none,
        requirements: lines(story.body ?? story.summary).slice(0, 8),
        acceptance: story.acceptance?.length ? story.acceptance : [`${story.title} has verifiable canonical acceptance criteria.`],
        dependencies: [fid],
        questions: none,
        notes: story.bridge ? ["Bridge story introduced during SpecForge normalization for flat task-list parentage."] : [`Original story material archived under legacy-specs/${folder}.`],
      }));
    }
  }

  for (const [taskIndex, task] of tasks.entries()) {
    const tid = taskId(number, taskIndex + 1);
    await write(`${outDir}/task-${tid.slice(2)}-${slug(task)}.md`, spec({
      title: task,
      id: tid,
      type: "Task",
      parent: bridgeStory,
      summary: task,
      context: `Migrated from legacy-specs/${folder}/tasks.md.`,
      goals: [task],
      nonGoals: ["Do unrelated work outside the migrated checklist item."],
      requirements: [`Complete the migrated task: ${task}`],
      acceptance: ["The migrated task is represented as a canonical SpecForge task with a valid story parent."],
      dependencies: [bridgeStory],
      questions: none,
      notes: [`Original task text: ${task}`],
    }));
  }
}

await archive();
const folders = (await readdir(legacyDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && /^\d{4}-/.test(entry.name))
  .map((entry) => entry.name)
  .sort();

for (const folder of folders) await convertEpic(folder);
console.log(`Normalized ${folders.length} BitBetMatic legacy epic folders.`);
