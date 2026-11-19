`datalib-pipeline` runs a pipeline of commands. Each command is a **step**: one program that writes one directory of its own. [[cite:readme]]

A step names the steps it reads. Those names are the edges of a graph, which the runner follows.

The runner starts a step only when something it depends on changed. The example pipeline counts the words in the manual pages every Mac has, under `/usr/share/man`. It knows no program by name; since November 2026 every step, Datalib's own included, is spelled out the same way in the config. [[cite:pr]]

```diagram
{ "type": "svg", "src": "assets/pipeline.svg" }
```
