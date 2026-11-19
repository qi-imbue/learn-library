Run the config: [[cite:cli]]

```sh
datalib-dag ~/dag-tutorial/config.toml
```

With no `--sync`, every step that declares no inputs runs, and so does everything downstream that is out of date. `--sync <id>` runs that step and what reads it instead. [[cite:readme]]

It prints its events as JSON lines while it runs, then one line per step with how it ended. At this point the step fails, because no program named `copy-folder` exists yet:

```text
commands/fetch    Failed { kind: Data }
    (spawn "copy-folder": No such file or directory (os error 2))
```

The run exits 2. The next two levels write `copy-folder`, after which the same command succeeds.
