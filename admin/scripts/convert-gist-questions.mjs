#!/usr/bin/env node

/**
 * Converts markdown questions from a GitHub gist into JSON format
 * expected by the batch import API.
 *
 * Usage:
 *   node scripts/convert-gist-questions.mjs
 *
 * Output:
 *   scripts/data/kaokao1-questions.json  (考科一)
 *   scripts/data/kaokao2-questions.json  (考科二)
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GIST_URL =
  "https://gist.githubusercontent.com/hctsai1006/f8a1a64ab43be59b4d8297ee1afc11f2/raw";

const OUTPUT_DIR = join(__dirname, "data");

// ── helpers ──────────────────────────────────────────────────────────────────

async function fetchMarkdown(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch gist: ${res.status} ${res.statusText}`);
  return await res.text();
}

function normalizeText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\\~/g, "~")
    .replace(/\\-/g, "-");
}

/**
 * Split the full markdown into two section blobs based on ## headings.
 */
function splitSections(md) {
  const section1Regex = /^## 考科一（淨零碳規劃管理基礎概論）/m;
  const section2Regex = /^## 考科二（淨零碳盤查規範與程序概要）/m;

  const s1Start = md.search(section1Regex);
  const s2Start = md.search(section2Regex);

  if (s1Start === -1 || s2Start === -1) {
    throw new Error("Could not find both section headers in the markdown.");
  }

  const section1 = md.slice(s1Start, s2Start).trim();
  const section2 = md.slice(s2Start).trim();

  return { section1, section2 };
}

/**
 * Try to extract the confirmed answer from a chunk of text.
 * Looks for patterns like: __答案: X__ or **答案: X**
 * Returns the letter (A/B/C/D) or null.
 */
function extractAnswer(text) {
  const patterns = [
    /__\s*答案\s*[:：]\s*([A-D])\s*__/,
    /\*\*\s*答案\s*[:：]\s*([A-D])\s*\*\*/,
    /答案\s*[:：]\s*([A-D])/,
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) return m[1];
  }
  return null;
}

/**
 * Clean answer annotations from text.
 */
function cleanAnswerAnnotations(text) {
  return text
    .replace(/__\s*答案\s*[:：]\s*[A-D]\s*__/g, "")
    .replace(/\*\*\s*答案\s*[:：]\s*[A-D]\s*\*\*/g, "")
    .trim();
}

/**
 * Parse questions from one section's markdown text.
 */
function parseQuestions(sectionMd) {
  const lines = sectionMd.split("\n");

  // Question start: a line beginning with optional whitespace + digits + ". "
  const questionStartRe = /^\s*(\d+)\.\s+(.+)/;

  // Option line: "- X:" where X is A-D
  const optionLineRe = /^\s*-\s+([A-D])\s*[:：]\s*(.*)/;

  // Identify question-start line indices
  const blockStarts = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(questionStartRe);
    if (m) {
      blockStarts.push({ lineIdx: i, questionNum: parseInt(m[1], 10) });
    }
  }

  const questions = [];
  const warnings = [];

  for (let bi = 0; bi < blockStarts.length; bi++) {
    const start = blockStarts[bi];
    const startIdx = start.lineIdx;
    const endIdx = bi + 1 < blockStarts.length ? blockStarts[bi + 1].lineIdx : lines.length;

    // Collect all lines in this block
    const blockLines = [];
    for (let li = startIdx; li < endIdx; li++) {
      blockLines.push(lines[li]);
    }

    const rawBlock = blockLines.join("\n");

    // Extract the stem: first line is "NNN. <stem text>"
    const firstLine = blockLines[0];
    const stemMatch = firstLine.match(/^\s*\d+\.\s+(.*)/);
    if (!stemMatch) continue;
    let stem = cleanAnswerAnnotations(stemMatch[1].trim());

    // Parse options from the remaining lines
    const options = [];
    for (let li = 1; li < blockLines.length; li++) {
      const line = blockLines[li];
      const om = line.match(optionLineRe);
      if (om) {
        let optText = cleanAnswerAnnotations(om[2].trim());
        options.push({ label: om[1], text: optText });
      }
    }

    // Extract answer
    const answer = extractAnswer(rawBlock);

    // Validation: if fewer than 2 options, skip and warn
    if (options.length < 2) {
      warnings.push(
        `  Skipped Q${start.questionNum} (only ${options.length} option(s) parsed). Stem: "${stem.slice(0, 80)}"`
      );
      continue;
    }

    // Clean any leftover noise from the stem (side-by-side layout artifacts)
    // Remove lines like "ML (2024.08.16 整理)" or "考科 1 ..." or page numbers
    stem = stem
      .replace(/ML\s*\(\d{4}\.\d{2}\.\d{2}\s*整理\)\s*/g, "")
      .replace(/考科\s*[12]\s*淨零碳[^?\n]{0,30}\s*/g, "")
      .replace(/\(\d{4}\.\d{2}\)\s*\d*\s*$/g, "")
      .trim();

    questions.push({
      questionType: "single",
      stem,
      options,
      correctAnswer: answer || "",
      difficulty: 1,
      sourceLabel: "淨零碳規劃管理師-初級 考古題",
      sortOrder: start.questionNum,
    });
  }

  return { questions, warnings };
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Fetching markdown from gist...");
  const rawMd = await fetchMarkdown(GIST_URL);
  const md = normalizeText(rawMd);

  console.log("Splitting into sections...");
  const { section1, section2 } = splitSections(md);

  console.log("Parsing 考科一 (377 expected)...");
  const result1 = parseQuestions(section1);

  console.log("Parsing 考科二 (342 expected)...");
  const result2 = parseQuestions(section2);

  // Sort by sortOrder
  result1.questions.sort((a, b) => a.sortOrder - b.sortOrder);
  result2.questions.sort((a, b) => a.sortOrder - b.sortOrder);

  // Create output dir
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outFile1 = join(OUTPUT_DIR, "kaokao1-questions.json");
  const outFile2 = join(OUTPUT_DIR, "kaokao2-questions.json");

  writeFileSync(outFile1, JSON.stringify({ items: result1.questions }, null, 2), "utf-8");
  writeFileSync(outFile2, JSON.stringify({ items: result2.questions }, null, 2), "utf-8");

  const confirmed1 = result1.questions.filter((q) => q.correctAnswer).length;
  const confirmed2 = result2.questions.filter((q) => q.correctAnswer).length;

  console.log("\n========================================");
  console.log("  Summary");
  console.log("========================================");
  console.log(`  考科一: ${result1.questions.length} / 377 questions parsed`);
  if (result1.warnings.length) {
    console.log(`  Warnings (${result1.warnings.length}):`);
    for (const w of result1.warnings) console.log(w);
  }
  console.log(`  考科二: ${result2.questions.length} / 342 questions parsed`);
  if (result2.warnings.length) {
    console.log(`  Warnings (${result2.warnings.length}):`);
    for (const w of result2.warnings) console.log(w);
  }
  console.log("========================================");
  console.log(`\nOutput files:`);
  console.log(`  ${outFile1}`);
  console.log(`  ${outFile2}`);
  console.log(
    `\nConfirmed answers: 考科一 ${confirmed1}/${result1.questions.length}, 考科二 ${confirmed2}/${result2.questions.length}`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
