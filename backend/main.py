import os
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(Path(__file__).with_name(".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")
FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

TABLE_METHODS = {
    "profiles": {"GET", "PATCH"},
    "facilities": {"GET", "POST", "PATCH", "DELETE"},
    "court_requests": {"GET", "POST"},
    "bookings": {"GET", "POST", "PATCH", "DELETE"},
    "events": {"GET", "POST"},
    "event_registrations": {"GET"},
    "recent_visits": {"GET", "POST", "PATCH", "DELETE"},
    "legacy_imports": {"GET", "POST"},
}
RPC_NAMES = {
    "get_my_facility_ids",
    "get_booking_availability",
    "create_booking",
    "review_booking",
    "review_court_request",
    "register_for_event",
    "review_event_registration",
    "cancel_event_registration",
}
FORWARDED_HEADERS = {
    "accept",
    "content-type",
    "prefer",
    "range",
    "accept-profile",
    "content-profile",
}

app = FastAPI(title="CourtConnect API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "authorization",
        "apikey",
        "content-type",
        "accept",
        "prefer",
        "range",
        "range-unit",
        "accept-profile",
        "content-profile",
        "x-client-info",
    ],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.api_route(
    "/api/supabase-proxy/{resource:path}",
    methods=["GET", "POST", "PATCH", "DELETE"],
)
async def proxy_supabase_rest(resource: str, request: Request) -> Response:
    if not SUPABASE_URL or not SUPABASE_PUBLISHABLE_KEY:
        raise HTTPException(
            status_code=503,
            detail="Configure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in backend/.env.",
        )

    authorization = request.headers.get("authorization", "")
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="A Supabase access token is required.")

    resource_parts = resource.split("/")
    if len(resource_parts) == 1 and resource_parts[0] in TABLE_METHODS:
        allowed_methods = TABLE_METHODS[resource_parts[0]]
    elif (
        len(resource_parts) == 2
        and resource_parts[0] == "rpc"
        and resource_parts[1] in RPC_NAMES
    ):
        allowed_methods = {"POST"}
    else:
        raise HTTPException(status_code=404, detail="Database resource is not available.")

    if request.method not in allowed_methods:
        raise HTTPException(status_code=405, detail="Operation is not available for this resource.")

    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() in FORWARDED_HEADERS
    }
    headers["apikey"] = SUPABASE_PUBLISHABLE_KEY
    headers["authorization"] = authorization

    body = await request.body()
    url = f"{SUPABASE_URL}/rest/v1/{resource}"
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            upstream = await client.request(
                request.method,
                url,
                params=list(request.query_params.multi_items()),
                content=body or None,
                headers=headers,
            )
    except httpx.TimeoutException as error:
        raise HTTPException(status_code=504, detail="Supabase request timed out.") from error
    except httpx.RequestError as error:
        raise HTTPException(status_code=502, detail="Unable to reach Supabase.") from error

    response_headers = {
        key: value
        for key, value in upstream.headers.items()
        if key.lower()
        in {
            "content-type",
            "content-range",
            "range-unit",
            "preference-applied",
        }
    }
    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=response_headers,
    )
