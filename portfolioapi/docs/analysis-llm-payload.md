# LLM analysis payload (token efficiency)

The analysis endpoints send portfolio data to Gemini. To reduce input tokens without hiding information the model needs for summaries and “garden” copy:

## Implemetation 

1. No pretty printing with JSON (JSON takes a lot of space, overbearing tokens).
2. No indents, same compact serialization.
3. Highlight these fields:
   - `symbol`
   - `weight` (portfolio weight, 0–1)
   - `price` (if present)
   - `avg_cost` (average cost per share, if present)
   - `gain_pct` (total gain as decimal fraction, if present; Yahoo-style, e.g. `0.05` = 5%)

4. Position cap to at most **15** positions by default (`LLM_MAX_POSITIONS` in `AnalysisService`), largest weights first.

5. Gemini output's `maxOutputTokens` is set to **8192** so JSON (especially the garden with many captions) is less likely to be cut mid-object. HTTP timeout is **120s**.

## Failure analysis

Check the API error text (HTTP 502 `detail` from `/analysis`):

- `No candidates` — often safety / prompt block; inspect `promptFeedback` in the message.
- `Invalid JSON` + `MAX_TOKENS`— output was truncated; fewer positions or higher `GEMINI_MAX_OUTPUT_TOKENS`.
- `Gemini API error ...` — quota, bad key, or model name; the message includes Google’s `message` field.


