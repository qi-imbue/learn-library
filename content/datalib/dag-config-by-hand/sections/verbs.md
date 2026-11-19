A step **verb** is a flag the runner may add to a step's command: `--reset`, `--prepare`, `--compact` or `--collect`. [[cite:protocol]]

It sends a verb only to a program that declares it. The program is the first word of the command, as written:

```toml
[[programs]]
command = "mail-sync"
verbs = ["reset"]
```

`datalib-pipeline reset <root> mail/fetch` empties a step so its next run starts from nothing: [[cite:cli]]

- If the program declares `reset`, the runner runs its command with `--reset` added. The step empties its directory in its own way, such as deleting a database's rows while keeping its history, and exits 0.
- If it does not, the runner deletes `<root>/mail/fetch/` itself.

A reset runs nothing else. The next sync refills the step, and everything that reads it runs again. `copy-folder` and `word-count` declare no verbs, so a reset deletes their directories.
