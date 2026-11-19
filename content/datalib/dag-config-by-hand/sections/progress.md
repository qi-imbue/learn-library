stdout carries events, one JSON object per line. A line that is not JSON is kept as an `info` log line. [[cite:protocol]]

```json
{"event": "progress_length", "step": "", "total": 42}
{"event": "progress_inc", "step": "", "delta": 1}
{"event": "log", "step": "", "level": "warn", "msg": "skipped a binary file"}
```

- `step` is required, and its value does not matter: the runner tags each event with the real id.
- `progress_length` and `progress_inc` drive the progress and time-left display.
- stderr is for people. Every line is kept, and on a failed exit the last few become the step's error message.
- Flush after every line. The runner sets `PYTHONUNBUFFERED=1` for Python.

All of it lands in `system/runs/runs.sqlite`, a plain SQLite file.
