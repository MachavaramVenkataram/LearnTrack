"""
LearnTrack ML: Lightweight Sliding-Window Rate Limiter
Prevents API flooding on compute-intensive prediction and simulation routes.
"""

import time
from typing import Dict, List
from fastapi import Request, HTTPException, status

class InMemoryRateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.client_history: Dict[str, List[float]] = {}

    def check(self, request: Request):
        # Extract client IP
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        window_start = now - 60.0

        history = self.client_history.get(client_ip, [])
        # Prune expired timestamps
        active_history = [t for t in history if t > window_start]

        if len(active_history) >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please wait a moment before sending additional simulation requests."
            )

        active_history.append(now)
        self.client_history[client_ip] = active_history

# Standard rate limiters
prediction_rate_limiter = InMemoryRateLimiter(requests_per_minute=60)
simulation_rate_limiter = InMemoryRateLimiter(requests_per_minute=90)
