Each time the runner starts, it sends `--prepare` to every step whose program declares it, producers first. [[cite:protocol]]

This is the place to upgrade what a step wrote, for example after you change your program's output format. The runner cannot tell whether a program changed, so it asks every time. Answer quickly when there is nothing to do.

| answer | how |
|---|---|
| nothing to do | exit 0, report nothing |
| brought up to date in place | report the new version, as a run would |
| needs a rerun | outcome with `"needs_rerun": true` |
| refused: a newer program wrote it | exit non-zero with `"failure": "incompatible"` |

A refused step is turned off. A later start whose `--prepare` does not refuse turns it back on. [[cite:protocol]]
