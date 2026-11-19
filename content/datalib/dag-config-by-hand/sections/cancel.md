On a Stop, the runner sends **SIGINT** to the step's process group. Fifteen seconds later it sends SIGKILL. [[cite:protocol]]

Stop at the next consistent point, commit there, and exit 130 with a `cancelled` outcome. Never commit from the signal handler itself: that would publish whatever half-written state the signal landed in.

```python
import signal
stopping = False
def on_sigint(signum, frame):
    global stopping
    stopping = True                # only note it here
signal.signal(signal.SIGINT, on_sigint)
# in the work loop: if stopping, finish what is whole, write the
# outcome with "failure": "cancelled", then sys.exit(130)
```

A step that does nothing is killed at the grace period. Its next run starts from what it last committed.
