# Yahoo Finance portfolio CSV
The parser requires header names following Yahoo Finance:

## Variables
| Column | Usage |
|--------|--------|
| `Ticker` | Symbol (e.g. `AMZN`, `NVDA`) |
| `Price` | Last price per share |
| `Shares` | Position size |
| `Avg Cost/Share` | Average cost basis per share |
| `Total Gain (%)` | Total return on the position as a decimal fraction (e.g. `0.06472931` ≈ 6.47%). If the cell is empty, the API computes it from `Market Value` and cost basis. |
| `Market Value` | Current position value (used for portfolio total and weights) |

Other columns in the export (`Day's Gain`, `52wk Low`, `Volume`, etc.) are ignored.

## Encoding

Uploads are decoded in this order: UTF-16 (Excel “Unicode” on Windows), UTF-8 with BOM, UTF-8, Windows-1252, then Latin-1. If none match exactly, invalid bytes are replaced so parsing can still proceed.

## Headers

Leading/trailing spaces on column names (e.g. `Ticker ` instead of `Ticker`) are normalized so exports from Excel or copy-paste still validate.

## Numbers

Commas in numbers are accepted. Scientific notation (e.g. `9.59E-04`) is supported via normal `float` parsing.

## Stored fields

Each `Position` includes:

- `symbol`, `market_value`, `quantity`, `weight`
- `price`, `avg_cost_per_share`, `total_gain_pct` (from the CSV or derived)

## Minimal mock data

For `/portfolio/mock`, positions are defined with only `symbol`, `price`, `quantity`, and `avg_cost_per_share`. The service derives `market_value` as `price × quantity`, then `total_gain_pct` as \((\text{market\_value} - \text{cost basis}) / \text{cost basis}\) with `cost basis = quantity × avg_cost_per_share`. For production accuracy, prefer a full Yahoo export so `Market Value` and Yahoo’s `Total Gain (%)` stay aligned with their methodology (FX, corporate actions, etc.).
