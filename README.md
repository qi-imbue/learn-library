# learn-library

The learn-from-scratch tutorials published at `learn.<your zone>` on Cloud in
a Bottle. Topics are written in `~/on/learn-from-scratch` (with the
`learn-from-scratch` skill); this repo holds the ones published, plus a copy of
the app's source, and the Cloud in a Bottle app that builds and serves them.

## Publishing a topic

```sh
scripts/publish-topic content/datalib/dag-config-by-hand
```

It copies the topic (without your local `annotations.json`) and the app's
current source from `~/on/learn-from-scratch`, commits and pushes. Then press
**Update and reload** on the `learn` app's page in the dashboard, which pulls
and rebuilds. Several topics can be named at once. To unpublish one,
`git rm -r content/<topic>`, commit, push, and reload.

## How the app runs

- `Dockerfile` installs the app and moves `content/` to `published/`.
- `bottle-start.mjs` copies each published topic into
  `$BOTTLE_APP_DATA_DIR/content/`, keeping what was saved there: a topic's
  `annotations.json`, and the `tags` and `archived` keys of its
  `manifest.json`. A topic no longer published moves to
  `$BOTTLE_APP_DATA_DIR/unpublished/`. `content/` becomes a link to that
  directory, and the app is built and served by `vite preview` on port 8080,
  answering for every subdomain of `$BOTTLE_ZONE_DOMAIN` (`LFS_ALLOWED_HOSTS`).
- The pages are public (`public_paths = ["/"]` in `cloudinabottle.toml`).
  Saving annotations, tags and archive flags requires the owner: the app
  refuses a write without `X-OpenHost-Is-Owner: true`, which the router sets
  on the owner's requests (`LFS_WRITE_REQUIRES_HEADER` in the `Dockerfile`).
  A visitor's edits stay in their own browser.
- Tags and archive flags you save are read at build time, so other visitors
  see them after the next reload of the app; annotations show at once.
