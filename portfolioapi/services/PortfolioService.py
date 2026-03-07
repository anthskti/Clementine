from models.portfolio import Portfolio, Position

class PortfolioService:
    async def build_from_questrade(self, refresh_token: str) -> Portfolio:
        # TODO
        return 
    
    async def build_from_dict(self, data: dict) -> Portfolio:
        return Portfolio(**data)