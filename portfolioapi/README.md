# Portfolio API
This is a monolithic backend hosting Clementine, the finance assistant.

## Python Setup:

1. Make sure you have uv installed.
```bash
homebrew install uv
```

2. Need to sync dependencies:
```bash
uv sync
```

3. Run Virtual Environment:
```bash
source .venv/bin/activate
```

4. Run App

```bash
uv run uvicorn main:app --reload
```

localhost:8000
