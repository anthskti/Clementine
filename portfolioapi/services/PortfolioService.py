from models.portfolio import Portfolio, Position
from services.QuestradeService import QuestradeService

questrade = QuestradeService()

class PortfolioService:
    async def build_from_questrade(self, refresh_token: str) -> Portfolio:
        
        # Access Token to Exchange token 
        token_data = await questrade.exchange_token(refresh_token)
        access_token = token_data["access_token"]
        api_server = token_data["api_server"]

        # Get account first account for now
        accounts = await questrade.get_accounts(access_token, api_server)
        if not accounts:
            raise ValueError("No accounts found for this Questrade token.")
        account_id = str(accounts[1]["number"])

        # Getting account positions + balance for data analysis
        raw_positions = await questrade.get_positions(access_token, api_server, account_id)
        balances = await questrade.get_balances(access_token, api_server, account_id)

        # Find the CAD account balance. If it exists, use its total equity as the portfolio value.
        # Otherwise, calculate the portfolio value by summing the market value of all positions.
        combined = next(
            (b for b in balances.get("combinedBalances", []) if b["currency"] == "CAD"),
            None,
        )
        portfolio_value = combined["totalEquity"] if combined else sum(
            p.get("currentMarketValue", 0) for p in raw_positions
        )

        # Normalize positions
        positions = []
        for p in raw_positions:
            market_value = p.get("currentMarketValue", 0)
            qty = p.get("openQuantity")
            total_cost = p.get("totalCost", 0)
            avg_cost = p.get("averageEntryPrice")

            price = None
            total_gain_pct = None

            if qty and market_value is not None:
                try:
                    q = float(qty)
                    if q:
                        price = round(float(market_value) / q, 6)
                except (TypeError, ValueError):
                    pass

            if total_cost and market_value is not None:
                try:
                    tc = float(total_cost)
                    if tc != 0:
                        total_gain_pct = (float(market_value) - tc) / tc
                except (TypeError, ValueError):
                    pass

            positions.append(
                Position(
                    symbol=p.get("symbol", ""),
                    weight=round(market_value / portfolio_value, 2) if portfolio_value else 0,
                    market_value=market_value,
                    quantity=qty,
                    currency=p.get("currency", "CAD"),
                    description=p.get("description"),
                    price=price,
                    avg_cost_per_share=avg_cost,       
                    total_gain_pct=total_gain_pct
                )
            )
        # Sort by decending weight
        positions.sort(key=lambda x: x.weight, reverse=True)


        return Portfolio(
            portfolio_value=round(portfolio_value, 2),
            currency="CAD",
            positions=positions,
        )
    
    async def build_from_dict(self, data: dict) -> Portfolio:
        return Portfolio(**data)

    def build_from_yahoo_minimal(self, rows: list[dict]) -> Portfolio:
        """
        Build a portfolio from minimal Yahoo-style rows: symbol, price, quantity,
        avg_cost_per_share. Optional: market_value, total_gain_pct (computed if omitted).
        """
        if not rows:
            raise ValueError("At least one position is required.")

        positions_raw: list[dict] = []
        for r in rows:
            symbol = str(r["symbol"]).strip().upper()
            price = float(r["price"])
            quantity = float(r["quantity"])
            avg_cost = float(r["avg_cost_per_share"])

            market_value = r.get("market_value")
            if market_value is not None:
                market_value = float(market_value)
            else:
                market_value = round(price * quantity, 6)

            total_gain_pct = r.get("total_gain_pct")
            if total_gain_pct is not None:
                total_gain_pct = float(total_gain_pct)
            else:
                cost_basis = quantity * avg_cost
                total_gain_pct = (
                    (market_value - cost_basis) / cost_basis if cost_basis else 0.0
                )

            positions_raw.append(
                {
                    "symbol": symbol,
                    "market_value": market_value,
                    "quantity": quantity,
                    "price": price,
                    "avg_cost_per_share": avg_cost,
                    "total_gain_pct": total_gain_pct,
                    "currency": r.get("currency", "CAD"),
                }
            )

        portfolio_value = sum(p["market_value"] for p in positions_raw)
        positions = [
            Position(
                symbol=p["symbol"],
                weight=round(p["market_value"] / portfolio_value, 4) if portfolio_value else 0,
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