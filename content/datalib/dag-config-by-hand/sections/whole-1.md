The complete config, in two parts. Part 1 declares one group and its two steps. [[cite:protocol]]

```toml
[[groups]]
id = "commands"
name = "Command manual pages"

[[steps]]
id = "commands/fetch"
command = "copy-folder /usr/share/man/man1"

[[steps]]
id = "commands/count"
command = "word-count"
inputs = ["commands/fetch"]
params = { top = 10 }
```

`params` is written as an inline table here, which keeps each step to its plain keys.

There is no `[[programs]]` entry: neither program handles a verb. So a reset of either step deletes its directory, which is what a plain-file step wants. [[cite:protocol]]
