Exit status 0 is success; anything else is a failure. An outcome line can say what kind of failure, which decides whether the runner retries: [[cite:protocol]]

| `failure` | meaning | what the runner does |
|---|---|---|
| `transient` | a network blip, lock contention | retries, up to 3 attempts, 1 s then 2 s apart |
| `rate_limited` | HTTP 429 and similar | retries the same way |
| `auth` | credentials need a person | fails at once |
| `data` | bad input; retrying won't help | fails at once (the default) |
| `incomplete` | gave up with work left, after committing | fails at once; the next run resumes |

```json
{"event": "outcome", "failure": "rate_limited", "outputs": []}
```

`outputs` on a failure reports what the step *did* commit. Readers then read that.
