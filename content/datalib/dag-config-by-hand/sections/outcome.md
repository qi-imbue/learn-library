A step reports what it produced with one `outcome` line on stdout, last: [[cite:protocol]]

```json
{
  "event": "outcome",
  "outputs": [{ "path": "commands/count", "version": "3f9a1c0e" }]
}
```

The **version** is the signal for "did this change". The runner compares it with the last one, as a string. When it is equal, the steps that read this one skip.

- It must be a function of the output's content. Two runs that leave the same data report the same string.
- A timestamp or run id is never a version: it moves every run.
- Report nothing, and every success counts as new, so everything downstream reruns.

In `word-count`, a hash of `counts.json` is enough:

```python
data = (out / "counts.json").read_bytes()
version = hashlib.blake2b(data, digest_size=8).hexdigest()
```
