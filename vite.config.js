import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { promises as fs } from 'node:fs'
import path from 'node:path'

// The app lives at the repo root so it can glob the `content/` topic
// hierarchy with root-relative `import.meta.glob('/content/**')` paths.

// These three middlewares persist in-app edits (annotations, tags, archive flag)
// back to files under content/. They are registered on BOTH the dev server
// (`configureServer`) and the production preview server (`configurePreviewServer`),
// so persistence works in the deployed app too -- not just during development.
// The client falls back to localStorage only if these endpoints are unreachable.
// Both server objects expose `.config.root` and `.middlewares`, so one register
// function serves both.

// Resolve a topic dir (e.g. "/content/internet/dns") to a file inside it,
// guarding against path traversal outside content/.
function fileInTopic(root, topic, filename) {
  if (!topic || !topic.startsWith('/content/')) return null
  const rel = topic.replace(/^\//, '')
  const resolved = path.resolve(root, rel, filename)
  const contentRoot = path.resolve(root, 'content')
  if (!resolved.startsWith(contentRoot + path.sep)) return null
  return resolved
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => resolve(body))
  })
}

// Persists annotations to `annotations.json` inside the topic's content folder.
function registerAnnotationsApi(server) {
  const root = server.config.root
  server.middlewares.use('/__annotations', async (req, res) => {
    const url = new URL(req.url, 'http://localhost')
    const file = fileInTopic(root, url.searchParams.get('topic'), 'annotations.json')
    res.setHeader('Content-Type', 'application/json')
    if (!file) {
      res.statusCode = 400
      res.end(JSON.stringify({ error: 'bad topic' }))
      return
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      try {
        const data = JSON.parse((await readBody(req)) || '[]')
        if (Array.isArray(data) && data.length === 0) {
          // Empty list — remove the file to keep the content folder tidy.
          await fs.rm(file, { force: true })
        } else {
          await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n')
        }
        res.statusCode = 200
        res.end(JSON.stringify({ ok: true }))
      } catch (e) {
        res.statusCode = 500
        res.end(JSON.stringify({ error: String(e) }))
      }
      return
    }

    // GET: return the saved annotations (or an empty list).
    try {
      const raw = await fs.readFile(file, 'utf8')
      res.statusCode = 200
      res.end(raw)
    } catch {
      res.statusCode = 200
      res.end('[]')
    }
  })
}

// Persists a topic's tags into its manifest.json.
function registerTagsApi(server) {
  const root = server.config.root
  server.middlewares.use('/__tags', async (req, res) => {
    const url = new URL(req.url, 'http://localhost')
    const file = fileInTopic(root, url.searchParams.get('topic'), 'manifest.json')
    res.setHeader('Content-Type', 'application/json')
    if (!file) {
      res.statusCode = 400
      res.end(JSON.stringify({ error: 'bad topic' }))
      return
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      try {
        const { tags } = JSON.parse((await readBody(req)) || '{}')
        const manifest = JSON.parse(await fs.readFile(file, 'utf8'))
        if (Array.isArray(tags) && tags.length > 0) {
          manifest.tags = tags
        } else {
          // Empty — drop the key entirely to keep the manifest tidy.
          delete manifest.tags
        }
        await fs.writeFile(file, JSON.stringify(manifest, null, 2) + '\n')
        res.statusCode = 200
        res.end(JSON.stringify({ ok: true }))
      } catch (e) {
        res.statusCode = 500
        res.end(JSON.stringify({ error: String(e) }))
      }
      return
    }

    // GET: return the manifest's tags (or an empty list).
    try {
      const manifest = JSON.parse(await fs.readFile(file, 'utf8'))
      res.statusCode = 200
      res.end(JSON.stringify({ tags: manifest.tags || [] }))
    } catch {
      res.statusCode = 200
      res.end(JSON.stringify({ tags: [] }))
    }
  })
}

// Persists a slide's `archived` flag into its manifest.json. The slide's content
// folder is never moved — archiving only changes where it appears in the sidebar
// (see buildTree).
function registerArchivedApi(server) {
  const root = server.config.root
  server.middlewares.use('/__archived', async (req, res) => {
    const url = new URL(req.url, 'http://localhost')
    const file = fileInTopic(root, url.searchParams.get('topic'), 'manifest.json')
    res.setHeader('Content-Type', 'application/json')
    if (!file) {
      res.statusCode = 400
      res.end(JSON.stringify({ error: 'bad topic' }))
      return
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      try {
        const { archived } = JSON.parse((await readBody(req)) || '{}')
        const manifest = JSON.parse(await fs.readFile(file, 'utf8'))
        if (archived) {
          manifest.archived = true
        } else {
          // Default state — drop the key entirely to keep the manifest tidy.
          delete manifest.archived
        }
        await fs.writeFile(file, JSON.stringify(manifest, null, 2) + '\n')
        res.statusCode = 200
        res.end(JSON.stringify({ ok: true }))
      } catch (e) {
        res.statusCode = 500
        res.end(JSON.stringify({ error: String(e) }))
      }
      return
    }

    // GET: return the manifest's archived flag (defaults to false).
    try {
      const manifest = JSON.parse(await fs.readFile(file, 'utf8'))
      res.statusCode = 200
      res.end(JSON.stringify({ archived: !!manifest.archived }))
    } catch {
      res.statusCode = 200
      res.end(JSON.stringify({ archived: false }))
    }
  })
}

// Register a middleware on both the dev server and the preview (production) server.
// When LFS_WRITE_REQUIRES_HEADER names a request header, the persistence
// endpoints accept a write only when that header is `true`. A deployment behind
// a router that marks its owner's requests (Cloud in a Bottle sets
// X-OpenHost-Is-Owner) sets it, so a public page cannot be edited by visitors;
// their edits fall back to localStorage. Unset, as in local use, nothing changes.
const WRITE_PATHS = /^\/(__annotations|__tags|__archived)(\?|$)/
function guardWrites(server) {
  const header = process.env.LFS_WRITE_REQUIRES_HEADER
  if (!header) return
  server.middlewares.use((req, res, next) => {
    const writes = req.method !== 'GET' && req.method !== 'HEAD'
    if (writes && WRITE_PATHS.test(req.url) && req.headers[header.toLowerCase()] !== 'true') {
      res.statusCode = 403
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'only the owner may save changes here' }))
      return
    }
    next()
  })
}

function persistenceApi(name, register) {
  const withGuard = (server) => {
    guardWrites(server)
    register(server)
  }
  return {
    name,
    configureServer: withGuard,
    configurePreviewServer: withGuard,
  }
}

// Hosts the preview server answers for, beyond localhost: LFS_ALLOWED_HOSTS is
// a comma-separated list (a leading dot allows every subdomain), or `all`. A
// deployment behind a router sets it, or Vite refuses the router's Host header.
function allowedHosts() {
  const hosts = process.env.LFS_ALLOWED_HOSTS
  if (!hosts) return undefined
  if (hosts === 'all') return true
  return hosts.split(',').map((h) => h.trim()).filter(Boolean)
}

export default defineConfig({
  preview: { allowedHosts: allowedHosts() },
  // Relative base so any remaining external asset URLs (fonts) are relative
  // (./assets/...). The app is served behind the system_interface reverse proxy
  // at /service/learn-from-scratch/, which injects a <base href> tag; relative
  // URLs then resolve under that prefix. The dev server still serves from '/',
  // unaffected by this build-only base.
  base: './',
  // Inline all JS and CSS into a single index.html. The system_interface reverse
  // proxy serves the HTML document correctly, but the browser's ES-module loader
  // stalls on external `<script type="module">` responses forwarded through it
  // (normal resource fetches -- CSS links, fonts, images -- are unaffected). By
  // inlining the app into the document there is no external module to load, so
  // the proxied app mounts reliably. Fonts (KaTeX) stay external and load via
  // ordinary resource fetches, which work through the proxy.
  plugins: [
    react(),
    viteSingleFile(),
    persistenceApi('annotations-api', registerAnnotationsApi),
    persistenceApi('tags-api', registerTagsApi),
    persistenceApi('archived-api', registerArchivedApi),
  ],
})
