A step's `params` is any TOML, written under the step. [[cite:protocol]]

```toml
[[steps]]
id = "commands/count"
command = "word-count"
inputs = ["commands/fetch"]
[steps.params]
top = 10
```

- The runner hands the subtree to the step as JSON in `DATALIB_DAG_PARAMS`. The variable is unset when there are no params.
- Params may be at most 64 KiB as JSON; the loader refuses more.
- A table header such as `[steps.params]` ends the table it sits in, so a step's plain keys go above it.
- Put a secret's *name* in params, never its value.

Reading them in Python:

```python
params = json.loads(os.environ.get("DATALIB_DAG_PARAMS", "{}"))
```
