from __future__ import annotations

import argparse
import json
import os
import sqlite3
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
DEFAULT_SQLITE_PATH = ROOT_DIR / "work" / "app.db"
DEFAULT_JSON_PATH = ROOT_DIR / "work" / "generated_data.json"
DEFAULT_ENV_FILES = [ROOT_DIR / ".env.local", ROOT_DIR / ".env"]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_empty_state() -> dict:
    return {"version": "db-seed-1", "influencers": [], "brands": []}


def clone_json(value):
    return json.loads(json.dumps(value))


def normalize_state(payload) -> dict:
    state = clone_json(payload) if isinstance(payload, dict) else create_empty_state()
    if not isinstance(state.get("influencers"), list):
        state["influencers"] = []
    if not isinstance(state.get("brands"), list):
        state["brands"] = []
    if not state.get("version"):
        state["version"] = "db-seed-1"
    state["brands"] = [
        brand
        for brand in state["brands"]
        if (brand.get("brandName", "").strip().lower() != "brandream")
    ]
    return state


def load_env_files(paths: list[Path]) -> None:
    for path in paths:
        if not path.exists():
            continue
        for raw_line in path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


def load_state_from_sqlite(sqlite_path: Path) -> tuple[dict, str]:
    if not sqlite_path.exists():
        raise FileNotFoundError(f"SQLite file not found: {sqlite_path}")

    with sqlite3.connect(sqlite_path) as conn:
        row = conn.execute("SELECT json, updated_at FROM app_state WHERE id = 1").fetchone()

    if row is None:
        raise RuntimeError("SQLite app_state table is empty.")

    payload, updated_at = row
    return normalize_state(json.loads(payload)), updated_at or ""


def load_state_from_json(json_path: Path) -> tuple[dict, str]:
    if not json_path.exists():
        raise FileNotFoundError(f"JSON file not found: {json_path}")
    payload = json.loads(json_path.read_text(encoding="utf-8"))
    return normalize_state(payload), payload.get("updatedAt", "")


def load_source_state(source: str, sqlite_path: Path, json_path: Path) -> tuple[dict, str, str]:
    if source == "sqlite":
        state, updated_at = load_state_from_sqlite(sqlite_path)
        return state, updated_at, "sqlite"

    if source == "json":
        state, updated_at = load_state_from_json(json_path)
        return state, updated_at, "json"

    if sqlite_path.exists():
        state, updated_at = load_state_from_sqlite(sqlite_path)
        return state, updated_at, "sqlite"

    state, updated_at = load_state_from_json(json_path)
    return state, updated_at, "json"


def summarize_state(state: dict) -> dict:
    influencers = state.get("influencers", [])
    brands = state.get("brands", [])
    deleted_influencers = sum(1 for item in influencers if item.get("isDeleted"))
    selected_for_report = sum(1 for item in influencers if item.get("isSelectedForReport"))
    platforms = sorted({item.get("platform", "").strip() for item in influencers if item.get("platform")})
    countries = sorted({item.get("country", "").strip() for item in influencers if item.get("country")})
    return {
        "influencers": len(influencers),
        "brands": len(brands),
        "deleted_influencers": deleted_influencers,
        "selected_for_report": selected_for_report,
        "platforms": platforms,
        "countries": countries,
    }


def read_required_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def read_supabase_server_key() -> str:
    secret_key = os.environ.get("SUPABASE_SECRET_KEY", "").strip()
    legacy_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    value = secret_key or legacy_key
    if not value:
        raise RuntimeError(
            "Missing required environment variable: SUPABASE_SECRET_KEY "
            "(or legacy SUPABASE_SERVICE_ROLE_KEY)"
        )
    return value


def post_state_to_supabase(
    state: dict,
    supabase_url: str,
    server_key: str,
    state_table: str,
    state_key: str,
    timeout_seconds: int,
) -> dict:
    request_url = f"{supabase_url.rstrip('/')}/rest/v1/{state_table}?on_conflict=id"
    payload = json.dumps(
        [
            {
                "id": state_key,
                "payload": normalize_state(state),
                "updated_at": utc_now(),
            }
        ],
        ensure_ascii=False,
    ).encode("utf-8")

    request = urllib.request.Request(
        request_url,
        data=payload,
        method="POST",
        headers={
            "apikey": server_key,
            "Authorization": f"Bearer {server_key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=representation",
            "Accept": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            body = response.read().decode("utf-8")
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Supabase import failed with {error.code}: {detail}") from error
    except urllib.error.URLError as error:
        raise RuntimeError(f"Supabase request failed: {error.reason}") from error

    rows = json.loads(body or "[]")
    if not rows:
        return {"id": state_key, "updated_at": ""}
    return rows[0]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Import the current local Brandream state from SQLite or JSON into Supabase.",
    )
    parser.add_argument("--source", choices=["auto", "sqlite", "json"], default="auto")
    parser.add_argument("--sqlite-path", default=str(DEFAULT_SQLITE_PATH))
    parser.add_argument("--json-path", default=str(DEFAULT_JSON_PATH))
    parser.add_argument("--state-table", default=os.environ.get("SUPABASE_STATE_TABLE", "app_state"))
    parser.add_argument("--state-key", default=os.environ.get("SUPABASE_STATE_KEY", "brandream-main"))
    parser.add_argument("--timeout", type=int, default=30)
    parser.add_argument("--dry-run", action="store_true", help="Preview the import without calling Supabase.")
    return parser


def print_summary(summary: dict, source_used: str, updated_at: str) -> None:
    print("Local state summary")
    print(f"- Source: {source_used}")
    print(f"- Influencers: {summary['influencers']}")
    print(f"- Brands: {summary['brands']}")
    print(f"- Deleted influencers: {summary['deleted_influencers']}")
    print(f"- Selected for report: {summary['selected_for_report']}")
    print(f"- Platforms: {', '.join(summary['platforms']) or 'None'}")
    print(f"- Country values: {len(summary['countries'])}")
    print(f"- Local updatedAt: {updated_at or 'Unknown'}")


def main() -> int:
    load_env_files(DEFAULT_ENV_FILES)
    parser = build_parser()
    args = parser.parse_args()

    sqlite_path = Path(args.sqlite_path)
    json_path = Path(args.json_path)
    state, updated_at, source_used = load_source_state(args.source, sqlite_path, json_path)
    summary = summarize_state(state)
    print_summary(summary, source_used, updated_at)

    if args.dry_run:
        print("Dry run complete. No data was uploaded.")
        return 0

    supabase_url = read_required_env("SUPABASE_URL")
    server_key = read_supabase_server_key()
    state_table = args.state_table or read_required_env("SUPABASE_STATE_TABLE")
    state_key = args.state_key or read_required_env("SUPABASE_STATE_KEY")

    row = post_state_to_supabase(
        state=state,
        supabase_url=supabase_url,
        server_key=server_key,
        state_table=state_table,
        state_key=state_key,
        timeout_seconds=args.timeout,
    )

    print("Supabase import completed successfully.")
    print(f"- Table: {state_table}")
    print(f"- State key: {state_key}")
    print(f"- Supabase row id: {row.get('id', state_key)}")
    print(f"- Cloud updatedAt: {row.get('updated_at') or 'Unknown'}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:  # noqa: BLE001
        print(f"Error: {error}", file=sys.stderr)
        raise SystemExit(1)
