A sync runs a step only when it is **due**. A step is due when one of these holds: [[cite:readme]]

| it is due when | which means |
|---|---|
| it has never succeeded | a new step always runs once |
| an input's version differs from the one it read at its last success | something upstream changed |
| its **fingerprint** differs from the one recorded then | its definition was edited |
| it declares no inputs, and has not run since the sync began | its real input is outside the graph |

The fingerprint covers `id`, `command`, `inputs`, `params`, `env` and `code_version`. So editing any of them runs the step again. [[cite:protocol]]

`code_version` is any string. Change it to rerun a step whose program changed while its config did not.
