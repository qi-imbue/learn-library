A step's environment is built from a short list of sources. [[cite:protocol]]

```toml
[env]                          # handed to every step
WORDCOUNT_LOCALE = "en"

[[steps]]
id = "commands/count"
command = "word-count"
env = { WORDCOUNT_DEBUG = "1" } # this step only; wins on a clash
```

Little of the runner's own environment reaches a step. It passes what any program needs (`HOME`, `TMPDIR`, the locale) and nothing a person merely exported. [[cite:protocol]]

Two ways let a variable through:

- name it in params under a key ending `_env_var`, such as `token_env_var = "MY_TOKEN"`;
- list it in `DATALIB_CHILD_ENV`, comma-separated, where the runner is started.
