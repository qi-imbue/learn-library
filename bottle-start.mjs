// Start the library on Cloud in a Bottle: lay the published topics out under
// the app's persistent data directory, keeping what was saved there (each
// topic's annotations, tags and archived flag), point content/ at it, then
// build the app and serve it on port 8080.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { spawn, spawnSync } from 'node:child_process'
import path from 'node:path'

const app = process.cwd()
const published = path.join(app, 'published')
const data = process.env.BOTTLE_APP_DATA_DIR || '/tmp/lfs-data'
const content = path.join(data, 'content')

// Every folder holding a manifest.json, relative to `root`.
function topics(root, rel = '') {
  const dir = path.join(root, rel)
  if (!existsSync(dir)) return []
  if (existsSync(path.join(dir, 'manifest.json'))) return [rel]
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .flatMap((e) => topics(root, path.join(rel, e.name)))
}

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))

const wanted = topics(published)
for (const rel of wanted) {
  const dest = path.join(content, rel)
  const annotations = path.join(dest, 'annotations.json')
  const savedAnnotations = existsSync(annotations) ? readFileSync(annotations) : null
  const savedManifest = existsSync(path.join(dest, 'manifest.json'))
    ? readJson(path.join(dest, 'manifest.json'))
    : null
  rmSync(dest, { recursive: true, force: true })
  cpSync(path.join(published, rel), dest, { recursive: true })
  if (savedAnnotations) writeFileSync(annotations, savedAnnotations)
  if (savedManifest) {
    const manifest = readJson(path.join(dest, 'manifest.json'))
    for (const key of ['tags', 'archived']) {
      if (key in savedManifest) manifest[key] = savedManifest[key]
    }
    writeFileSync(path.join(dest, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  }
}

// A topic no longer published moves aside with its saved state, rather than
// staying in the library or being deleted.
for (const rel of topics(content)) {
  if (!wanted.includes(rel)) {
    const aside = path.join(data, 'unpublished', rel)
    rmSync(aside, { recursive: true, force: true })
    mkdirSync(path.dirname(aside), { recursive: true })
    renameSync(path.join(content, rel), aside)
    console.log(`unpublished: ${rel} (kept in ${aside})`)
  }
}

mkdirSync(content, { recursive: true })
rmSync(path.join(app, 'content'), { recursive: true, force: true })
symlinkSync(content, path.join(app, 'content'))
console.log(`serving ${wanted.length} topic(s) from ${content}`)

// The router reaches the app as <app>.<zone>; Vite's preview refuses any other
// Host header unless it is allowed.
const zone = process.env.BOTTLE_ZONE_DOMAIN
process.env.LFS_ALLOWED_HOSTS ??= zone ? `.${zone}` : 'all'

const build = spawnSync('npx', ['vite', 'build'], { stdio: 'inherit' })
if (build.status !== 0) process.exit(build.status ?? 1)
const server = spawn('npx', ['vite', 'preview', '--host', '0.0.0.0', '--port', '8080', '--strictPort'], { stdio: 'inherit' })
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => server.kill(sig))
server.on('exit', (code) => process.exit(code ?? 0))
