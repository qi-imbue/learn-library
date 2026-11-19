Locks keep steps apart beyond what the graph shows. A step holds its locks while its process runs. [[cite:readme]]

Every config has two, each with 4 slots:

| lock | held by a step that names no lock and |
|---|---|
| `network` | declares no inputs (a download) |
| `cpu` | declares inputs |

So a download waiting out a rate limit never keeps a transform from starting. `--parallelism N` sets both to N. [[cite:cli]]

Declare any other lock, then name it on the steps that hold it: [[cite:example]]

```toml
[[locks]]
name = "usb-drive"
slots = 1

# on each step that reads the drive:
locks = ["usb-drive"]
```

A step holding a lock no `[[locks]]` entry declares is dropped.
