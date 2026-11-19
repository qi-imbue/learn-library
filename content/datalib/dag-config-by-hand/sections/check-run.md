Check the config before running it: [[cite:cli]]

```sh
datalib-pipeline check ~/dag-tutorial
```

It prints every problem as `file:line:col: severity: message` and runs nothing. It exits 0 when every entry loads, 1 when the file is not a config at all, and 2 when some entries were dropped. A broken entry costs only itself; the rest still load. [[cite:readme]]

`check` checks the config, not the programs it names. With only the `commands/fetch` step from the previous level, it exits 0, even though `copy-folder` does not exist yet.
