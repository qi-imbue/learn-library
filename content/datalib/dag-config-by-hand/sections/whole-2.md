Part 2 adds the second group and the report, which reads both counts by pattern. `merge-counts` is a third program like `word-count`: it sums every `counts.json` it reads. [[cite:readme]]

```toml
[[groups]]
id = "formats"
name = "File format manual pages"

[[steps]]
id = "formats/fetch"
command = "copy-folder /usr/share/man/man5"

[[steps]]
id = "formats/count"
command = "word-count"
inputs = ["formats/fetch"]

[[steps]]
id = "report/all"
command = "merge-counts"
inputs = ["*/count"]
```

`datalib-dag --check` exits 0 on this config, and reports what the pattern stood for: [[cite:cli]]

```text
  report/all reads */count = commands/count, formats/count
```
