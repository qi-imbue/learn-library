#!/usr/bin/env node
// Render every level of a topic in headless Chromium and report problems.
//
// Usage: node scripts/check-topic.mjs <topic-dir> [--port 5199]
//   <topic-dir> is the topic folder relative to the repo root,
//   e.g. content/internet/dns
//
// Requires a dev server already running on the port (`npm run dev:verify`).
// For each level (plus the automatic References step) it:
//   - saves a screenshot to scratch/check/<topic-path>/level-NN.png
//   - counts KaTeX error nodes (.katex-error)
//   - checks whether the slide's content reaches below the viewport
//   - collects browser console errors
// Exits non-zero if any KaTeX error, overflow, or console error was found.
// Look at the screenshots yourself for clipped or overlapping diagram text;
// this script cannot detect that.

import { chromium } from 'playwright-core'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const args = process.argv.slice(2)
let port = 5199
const portIdx = args.indexOf('--port')
if (portIdx !== -1) {
  port = Number(args[portIdx + 1])
  args.splice(portIdx, 2)
}
const topicArg = args[0]
if (!topicArg) {
  console.error('usage: node scripts/check-topic.mjs <topic-dir> [--port 5199]')
  process.exit(2)
}

const topicRel = path.relative(ROOT, path.resolve(ROOT, topicArg))
if (!topicRel.startsWith('content' + path.sep)) {
  console.error(`topic must be under content/: ${topicArg}`)
  process.exit(2)
}
const manifest = JSON.parse(
  await fs.readFile(path.join(ROOT, topicRel, 'manifest.json'), 'utf8'),
)
const levelCount = manifest.levels.length + 1 // + References step
const topicDir = '/' + topicRel.split(path.sep).join('/')
const outDir = path.join(ROOT, 'scratch', 'check', topicRel.replace(/^content[\\/]/, ''))
await fs.mkdir(outDir, { recursive: true })

// Prefer Playwright's own Chromium; fall back to an installed Google Chrome.
let browser
try {
  browser = await chromium.launch()
} catch {
  browser = await chromium.launch({ channel: 'chrome' })
}
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const consoleErrors = []
// "Failed to load resource" console messages omit the URL; record failed
// responses from the response event instead, ignoring the missing favicon.
page.on('console', (m) => {
  if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) {
    consoleErrors.push(m.text())
  }
})
page.on('response', (res) => {
  if (res.status() >= 400 && !res.url().endsWith('/favicon.ico')) {
    consoleErrors.push(`HTTP ${res.status()} ${res.url()}`)
  }
})
page.on('pageerror', (e) => consoleErrors.push(String(e)))

let problems = 0
const base = `http://localhost:${port}/`
for (let lvl = 1; lvl <= levelCount; lvl++) {
  const before = consoleErrors.length
  const hash = '#' + encodeURIComponent(topicDir) + (lvl > 1 ? '::' + lvl : '')
  await page.goto(base + hash, { waitUntil: 'networkidle' })
  await page.waitForSelector('main.topic', { timeout: 10000 })
  await page.waitForTimeout(300)
  const r = await page.evaluate(() => {
    // How far the bottom of the visible section's content reaches past the
    // viewport. Measured on the content itself, not scrollHeight, so trailing
    // page padding below the content does not count as overflow.
    let bottom = 0
    for (const sec of document.querySelectorAll('main.topic section, main.topic .references')) {
      for (const child of sec.querySelectorAll(':scope > *')) {
        const r = child.getBoundingClientRect()
        if (r.height > 0) bottom = Math.max(bottom, r.bottom)
      }
    }
    return {
      katexErrors: document.querySelectorAll('.katex-error').length,
      katex: document.querySelectorAll('.katex').length,
      overflow: Math.round(bottom - window.innerHeight),
    }
  })
  const file = path.join(outDir, `level-${String(lvl).padStart(2, '0')}.png`)
  await page.screenshot({ path: file })
  const overflow = r.overflow
  const errs = consoleErrors.slice(before)
  const caption = lvl <= manifest.levels.length ? manifest.levels[lvl - 1].caption : 'References'
  const flags = []
  if (r.katexErrors) flags.push(`${r.katexErrors} KaTeX error(s)`)
  if (overflow > 0) flags.push(`overflows viewport by ${overflow}px`)
  if (errs.length) flags.push(`console errors: ${errs.join(' | ')}`)
  problems += flags.length
  console.log(
    `level ${lvl} (${caption}): ${flags.length ? 'PROBLEM: ' + flags.join('; ') : 'ok'}` +
      (r.katex ? ` [${r.katex} math nodes]` : ''),
  )
}
await browser.close()
console.log(`\nscreenshots: ${outDir}`)
process.exit(problems ? 1 : 0)
