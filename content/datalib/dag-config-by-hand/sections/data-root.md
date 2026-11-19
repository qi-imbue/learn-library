A **data root** is the directory that holds the config and every step's output. [[cite:protocol]]

`datalib-pipeline init` creates one, with a `config.toml` that has comments and no steps: [[cite:starter]] [[cite:cli]]

```sh
datalib-pipeline init ~/dag-tutorial
```

Every other `datalib-pipeline` command names the data root the same way, as a directory or as the `config.toml` inside it. [[cite:cli]]

After the tutorial's pipeline has run, the root looks like this:

```text
~/dag-tutorial/
  config.toml
  system/          the runner's records, and system/bin/ for your programs
  commands/fetch/   one step's directory
  commands/count/   another step's directory
  report/all/
```
