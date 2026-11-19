`inputs` lists the ids of the steps this one reads. Each entry is an edge of the graph. [[cite:protocol]]

The step waits for each input's first output. It runs again when an input's version moves.

Three variables describe the inputs, each a list of paths separated by newlines:

| variable | lists |
|---|---|
| `DATALIB_DAG_INPUTS` | every input |
| `DATALIB_DAG_CHANGED_INPUTS` | the inputs whose version moved since this step's last success; every input on a first run |
| `DATALIB_DAG_FAILED_INPUTS` | the inputs whose producer's last run did not succeed |

A failed input is still read, at what its producer last committed. Whether to go on is the step's decision. [[cite:protocol]]
