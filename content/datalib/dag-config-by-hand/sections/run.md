Run the pipeline with `sync`: [[cite:cli]]

```sh
datalib-pipeline sync ~/dag-tutorial
```

With no step named, every step that declares no inputs runs, and so does everything downstream that is out of date. Naming step ids after the root, as in `datalib-pipeline sync ~/dag-tutorial commands/fetch`, runs those steps and what reads them instead. [[cite:readme]]

It prints its events as JSON lines while it runs, then one line per step with how it ended. At this point the step fails, because no program named `copy-folder` exists yet:

```text
commands/fetch    Failed { kind: Data }
    (spawn "copy-folder": No such file or directory (os error 2))
```

The sync exits 2. The next two levels write `copy-folder`, after which the same command succeeds.
