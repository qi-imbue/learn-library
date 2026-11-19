A step is a `[[steps]]` table with two required keys. [[cite:protocol]]

```toml
[[steps]]
id = "commands/fetch"
command = "copy-folder /usr/share/man/man1"
```

- `id` is the directory the step writes, `<root>/commands/fetch/`. No other step writes there, and the loader refuses two ids that are equal or nested.
- `command` is split shell-style into an argument list. There is no variable expansion, globbing or piping, so write an absolute path; `~` stays a literal `~`. Wrap the command in `sh -c '…'` when you need a shell.
- The first word is looked up in `binary_dir`, then in `<root>/system/bin/`, then in `PATH`. A program you put in `system/bin/` travels with the data root.
