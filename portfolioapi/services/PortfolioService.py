from models.portfolio import Portfolio, Position
from services.QuestradeService import QuestradeService

questrade = QuestradeService()

class PortfolioService:
    async def build_from_questrade(self, refresh_token: str) -> Portfolio:
        
        # Access Toekn to Exchange token 
        token_data = await questrade.exchange_token(refresh_token)
        access_token = token_data["access_token"]
        api_server = token_data["api_server"]

        # Get account first account for now
        accounts = await questrade.get_accounts(access_token, api_server)
        if not accounts:
            raise ValueError("No accounts found for this Questrade token.")
        account_id = str(accounts[0]["number"])

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
            positions.append(
                Position(
                    symbol=p.get("symbol", ""),
                    weight=round(market_value / portfolio_value, 4) if portfolio_value else 0,
                    market_value=market_value,
                    quantity=p.get("openQuantity"),
                    currency=p.get("currency", "CAD"),
                    description=p.get("description"),
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