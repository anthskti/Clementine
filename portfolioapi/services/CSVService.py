import csv
import io
from models.portfolio import Portfolio, Position

# Yahoo Finance "My Portfolio" CSV export 
_YAHOO_REQUIRED = frozenset(
    {"Ticker", "Price", "Shares", "Avg Cost/Share", "Total Gain (%)", "Market Value"}
)


def decode_csv_bytes(contents: bytes) -> str:
    """Decode uploaded file bytes; Yahoo/Excel often use UTF-8, UTF-16, or Windows-1252."""
    if not contents:
        raise ValueError("Uploaded file is empty.")
    if contents.startswith(b"\xff\xfe") or contents.startswith(b"\xfe\xff"):
        return contents.decode("utf-16")
    if contents.startswith(b"\xef\xbb\xbf"):
        return contents.decode("utf-8-sig")
    for encoding in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            return contents.decode(encoding)
        except UnicodeDecodeError:
            continue
    return contents.decode("utf-8", errors="replace")


def _normalize_csv_headers(raw: str) -> str:
    """
    Strip whitespace from header cells so exports with 'Ticker ' or ' Price' still match.
    Must use csv.reader so quoted fields with commas stay intact.
    """
    raw = raw.lstrip("\ufeff")
    if not raw.strip():
        raise ValueError("CSV is empty.")
    reader = csv.reader(io.StringIO(raw))
    rows = list(reader)
    if not rows:
        raise ValueError("CSV is empty.")
    rows[0] = [h.strip() for h in rows[0]]
    out = io.StringIO()
    csv.writer(out).writerows(rows)
    return out.getvalue()


def _parse_float(cell: str | None, *, label: str = "cell") -> float:
    if cell is None:
        raise ValueError(f"Missing {label} in CSV row (short row or wrong column count).")
    s = str(cell).replace(",", "").strip()
    if not s:
        raise ValueError(f"Empty {label} in CSV row.")
    return float(s)


class CSVService:
    async def parse_upload(self, contents: bytes) -> Portfolio:
        """Decode bytes from multipart upload, then parse (see `decode_csv_bytes`)."""
        return await self.parse(decode_csv_bytes(contents))

    async def parse(self, raw_csv: str) -> Portfolio:
        raw_csv = _normalize_csv_headers(raw_csv)
        reader = csv.DictReader(io.StringIO(raw_csv))
        rows = list(reader)

        if not rows:
            raise ValueError("CSV is empty.")

        actual = {k for k in rows[0].keys() if k is not None}
        if not _YAHOO_REQUIRED.issubset(actual):
            raise ValueError(
                f"CSV must be a Yahoo Finance export with columns {_YAHOO_REQUIRED}. Got: {actual}"
            )

        col_ticker = "Ticker"
        col_price = "Price"
        col_shares = "Shares"
        col_avg = "Avg Cost/Share"
        col_gain_pct = "Total Gain (%)"
        col_mv = "Market Value"

        positions_raw: list[dict] = []
        for i, row in enumerate(rows, start=2):
            ticker_cell = row.get(col_ticker)
            if not (ticker_cell and str(ticker_cell).strip()):
                continue
            try:
                price = _parse_float(row.get(col_price), label="Price")
                shares = _parse_float(row.get(col_shares), label="Shares")
                avg_cost = _parse_float(row.get(col_avg), label="Avg Cost/Share")
                market_value = _parse_float(row.get(col_mv), label="Market Value")
            except ValueError as e:
                raise ValueError(f"CSV row {i} ({ticker_cell!r}): {e}") from e

            raw_pct = (row.get(col_gain_pct) or "").strip()
            if raw_pct:
                total_gain_pct = _parse_float(raw_pct)
            else:
                cost_basis = shares * avg_cost
                total_gain_pct = (
                    (market_value - cost_basis) / cost_basis if cost_basis else 0.0
                )

            positions_raw.append(
                {
                    "symbol": row[col_ticker].strip().upper(),
                    "market_value": market_value,
                    "quantity": shares,
                    "price": price,
                    "avg_cost_per_share": avg_cost,
                    "total_gain_pct": total_gain_pct,
                    "currency": "CAD",
                }
            )

        if not positions_raw:
            raise ValueError("No data rows with a ticker were found.")

        portfolio_value = sum(p["market_value"] for p in positions_raw)

        positions = [
            Position(
                symbol=p["symbol"],
                weight=round(p["market_value"] / portfolio_value, 2) if portfolio_value else 0,
                market_value=round(p["market_value"], 2),
                quantity=p["quantity"],
                currency=p["currency"],
                price=p["price"],
                avg_cost_per_share=p["avg_cost_per_share"],
                total_gain_pct=p["total_gain_pct"],
            )
            for p in positions_raw
        ]
        positions.sort(key=lambda x: x.weight, reverse=True)

        return Portfolio(
            portfolio_value=round(portfolio_value, 2),
            currency="CAD",
            positions=positions,
        )