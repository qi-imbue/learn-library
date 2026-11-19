A **group** is one thing on the app's Manage screen, such as one source. [[cite:readme]]

```toml
[[groups]]
id = "commands"
name = "Command manual pages"
type = "folder"
```

- A step's group is the first part of its id: `commands/fetch` and `commands/count` are filed under `commands`.
- `name` is the label people see. `type` is for whoever shows the pipeline; the runner never reads it.
- No group key reaches a step or its fingerprint, so renaming a group reruns nothing.
- A step whose first part names no group is a step outside any group. It still runs.
