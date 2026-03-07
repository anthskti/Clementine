import httpx
from core.config import settings


class QuestradeService:
    async def exchange_token(self, refresh_token: str) -> dict:
        """
        Exchange refresh token for access token + api_server URL.
        Returns: { access_token, api_server, token_type, expires_in, refresh_token }
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                settings.questrade_token_url,
                params={"grant_type": "refresh_token", "refresh_token": refresh_token},
            )
            response.raise_for_status()
            return response.json()
        
    async def get_accounts(self, access_token: str, api_server: str) -> list[dict]:
        """
        Fetch all accounts for the authenticated user.
        Returns: { accounts } like TFSA, RRSP
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{api_server}v1/accounts",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            response.raise_for_status()
            return response.json().get("accounts", [])
        
    async def get_positions(self, access_token: str, api_server: str, account_id: str) -> list[dict]:
        """
        Fetch all positions for a given account.
        Returns: { list(positions) }
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{api_server}v1/accounts/{account_id}/positions",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            response.raise_for_status()
            return response.json().get("positions", [])
        
    async def get_balances(self, access_token: str, api_server: str, account_id: str) -> dict:
        """
        Fetch balances for a given account.
        Returns: { account_balance } int
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{api_server}v1/accounts/{account_id}/balances",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            response.raise_for_status()
            return response.json()