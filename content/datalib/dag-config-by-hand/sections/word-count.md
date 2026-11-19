The second program counts the words in every input's files. Save it as `~/dag-tutorial/system/bin/word-count`. [[cite:protocol]]

```python
#!/usr/bin/env python3
import collections, json, os, pathlib, re

params = json.loads(os.environ.get("DATALIB_DAG_PARAMS", "{}"))
out = pathlib.Path(os.environ["DATALIB_DAG_STEP"])
counts = collections.Counter()
for src in filter(None, os.environ["DATALIB_DAG_INPUTS"].split("\n")):
    for f in pathlib.Path(src, "files").rglob("*"):
        if f.is_file():
            text = f.read_text(errors="replace").lower()
            counts.update(re.findall(r"[a-z]{3,}", text))
out.mkdir(parents=True, exist_ok=True)
tmp = out / "counts.json.tmp"
tmp.write_text(json.dumps(dict(counts.most_common(params.get("top", 20)))))
tmp.replace(out / "counts.json")   # a rename, so readers never see half a file
```

The input paths are relative, which works because the working directory is the data root. Words of three letters or more leave out troff's formatting codes, such as `\fR`.
