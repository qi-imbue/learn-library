The runner starts each step the same way. [[cite:protocol]]

- The working directory is the data root, so paths are relative to it.
- The argument list is the `command` and nothing else on an ordinary run.
- stdin is `/dev/null`.

Who the step is arrives in environment variables:

| variable | value |
|---|---|
| `DATALIB_DAG_STEP` | the step's id, which is also the directory it writes |
| `DATALIB_DAG_DATA_ROOT` | the data root's absolute path |
| `DATALIB_DAG_NOW` | the run's pinned time (RFC 3339); stamp with this, not your clock |
| `DATALIB_DAG_RUN_ID` | the run this invocation belongs to |
| `DATALIB_DAG_ATTEMPT` | which attempt this is, from 1 |
