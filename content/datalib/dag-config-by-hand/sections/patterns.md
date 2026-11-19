A step can read every step of one name at once, by pattern: [[cite:readme]]

```toml
[[steps]]
id = "report/all"
command = "merge-counts"
inputs = ["*/count"]
```

- `*/count` stands for every step whose id has two parts, the second `count`: here `commands/count` and `formats/count`.
- The loader expands the pattern before anything else sees it. The step receives ids in `DATALIB_DAG_INPUTS`.
- Add a third group with a `count` step, and `report/all` reads it without being edited.
- `--check` prints what each pattern stood for. [[cite:cli]]

A pattern that matches nothing leaves the step reading nothing. It still declared inputs, so it runs only when due, never on every sync. [[cite:readme]]
