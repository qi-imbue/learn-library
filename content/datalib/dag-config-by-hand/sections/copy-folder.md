The first program copies a folder into its step's directory. Save it as `~/dag-tutorial/system/bin/copy-folder` and make it executable. [[cite:protocol]]

```sh
#!/bin/sh
set -eu
out="$DATALIB_DAG_STEP"       # e.g. commands/fetch
mkdir -p "$out"
rm -rf "$out/.next"
cp -R "$1/." "$out/.next"     # build the new copy beside the old one
rm -rf "$out/files"
mv "$out/.next" "$out/files"  # then swap it in
```

It follows the three rules every step must: [[cite:protocol]]

- It writes only under its own directory.
- It is idempotent: running it twice leaves the same result.
- It never leaves a half-written tree: the copy is built in `.next` and moved into place only when whole.

Exit status 0 means success.
