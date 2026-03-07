import csv
import io
from models.portfolio import Portfolio, Position


class CsvService:
    """
    Expects CSV with headers: symbol, market_value, quantity (optional), currency (optional)
    Example:
        symbol,market_value,quantity,currency
        VOO,4510,10,USD
        AAPL,2214,12,USD
    """

    def parse(self, raw_csv: str) -> Portfolio:
        reader = csv.DictReader(io.StringIO(raw_csv))
        rows = list(reader)

        if not rows:
            raise ValueError("CSV is empty.")

        required = {"symbol", "market_value"}
        if not required.issubset(set(rows[0].keys())):
            raise ValueError(f"CSV must include columns: {required}")

        positions_raw = []
        for row in rows:
            positions_raw.append({
                "symbol": row["symbol"].strip().upper(),
                "market_value": float(row["market_value"]),
                "quantity": float(row["quantity"]) if "quantity" in row and row["quantity"] else None,
                "currency": row.get("currency", "CAD").strip(),
            })

        portfolio_value = sum(p["market_value"] for p in positions_raw)

        positions = [
            Position(
                **p,
                weight=round(p["market_value"] / portfolio_value, 4) if portfolio_value else 0,
            )
            for p in positions_raw
        ]
        positions.sort(key=lambda x: x.weight, reverse=True)

        return Portfolio(
            portfolio_value=round(portfolio_value, 2),
            currency="CAD",
            positions=positions,
        )