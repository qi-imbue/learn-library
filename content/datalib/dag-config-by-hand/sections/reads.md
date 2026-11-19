`reads` says how a step reads its inputs. [[cite:protocol]]

- `reads = "files"`, the default: no producer of the step's inputs runs while it does. The step reads the directories as they are on disk. This is right for every program in this tutorial.
- `reads = "pinned"`: the step may start while an input is still being written. It promises to read only the version named for each input in `DATALIB_READS`, a JSON object of input path to `<fingerprint>:<version>`.

Pinned reads suit inputs that keep their history, such as a database where each version is a commit. A producer that announces `"streams_output": true` then lets pinned readers run on each batch it seals.

`start = "after_inputs_settle"` makes a step wait until nothing upstream is running or due, then run once.
