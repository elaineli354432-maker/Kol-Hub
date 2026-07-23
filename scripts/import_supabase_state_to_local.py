from __future__ import annotations

import argparse
import json
import os
import shutil
import sqlite3
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
WORK_DIR = ROOT_DIR / "work"
OUTPUTS_DIR = ROOT_DIR / "outputs"
BACKUP_DIR = OUTPUTS_DIR / "backups"
DEFAULT_SQLITE_PATH = WORK_DIR / "app.db"
DEFAULT_JSON_PATH = WORK_DIR / "generated_data.json"
DEFAULT_ENV_FILES = [ROOT_DIR / ".env.local", ROOT_DIR / ".env"]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def backup_timestamp() -> str:
    return datetime.now().strftime("%Y%m%d-%H%M%S")


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


def fetch_state_from_supabase(
    supabase_url: str,
    server_key: str,
    state_table: str,
    state_key: str,
    timeout_seconds: int,
) -> tuple[dict, str]:
    request_url = (
        f"{supabase_url.rstrip('/')}/rest/v1/{state_table}"
        f"?id=eq.{urllib.parse.quote(state_key, safe='')}"
        "&select=id,payload,updated_at&limit=1"
    )
    request = urllib.request.Request(
        request_url,
        headers={
            "apikey": server_key,
            "Authorization": f"Bearer {server_key}",
            "Accept": "application/json",
            "Prefer": "count=exact",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            body = response.read().decode("utf-8")
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Supabase fetch failed with {error.code}: {detail}") from error
    except urllib.error.URLError as error:
        raise RuntimeError(f"Supabase request failed: {error.reason}") from error

    rows = json.loads(body or "[]")
    row = rows[0] if rows else None
    if not row:
        raise RuntimeError(f"No Supabase row found for state key: {state_key}")

    return normalize_state(row.get("payload")), row.get("updated_at") or ""


def ensure_local_db(sqlite_path: Path) -> None:
    sqlite_path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(sqlite_path) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS app_state (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


def backup_local_files(sqlite_path: Path, json_path: Path) -> dict:
    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    stamp = backup_timestamp()

    backup_info = {
        "db_backup": None,
        "json_backup": None,
    }

    if sqlite_path.exists():
        db_backup = BACKUP_DIR / f"before-cloud-restore-{stamp}.db"
        shutil.copy2(sqlite_path, db_backup)
        backup_info["db_backup"] = str(db_backup)

    if json_path.exists():
        json_backup = BACKUP_DIR / f"before-cloud-restore-{stamp}.json"
        shutil.copy2(json_path, json_backup)
        backup_info["json_backup"] = str(json_backup)

    return backup_info


def write_state_to_local(sqlite_path: Path, json_path: Path, state: dict, updated_at: str) -> None:
    ensure_local_db(sqlite_path)
    normalized = normalize_state(state)
    final_updated_at = updated_at or utc_now()

    with sqlite3.connect(sqlite_path) as conn:
        conn.execute(
            """
            INSERT INTO app_state (id, json, updated_at)
            VALUES (1, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                json = excluded.json,
                updated_at = excluded.updated_at
            """,
            (json.dumps(normalized, ensure_ascii=False), final_updated_at),
        )
        conn.commit()

    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(
        json.dumps(normalized, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def summarize_state(state: dict) -> dict:
    influencers = state.get("influencers", [])
    brands = state.get("brands", [])
    return {
        "influencers": len(influencers),
        "brands": len(brands),
        "deleted_influencers": sum(1 for item in influencers if item.get("isDeleted")),
        "selected_for_report": sum(1 for item in influencers if item.get("isSelectedForReport")),
        "platforms": sorted({item.get("platform", "").strip() for item in influencers if item.get("platform")}),
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Pull the current Brandream app state from Supabase back into local SQLite/JSON files.",
    )
    parser.add_argument("--sqlite-path", default=str(DEFAULT_SQLITE_PATH))
    parser.add_argument("--json-path", default=str(DEFAULT_JSON_PATH))
    parser.add_argument("--state-table", default=os.environ.get("SUPABASE_STATE_TABLE", "app_state"))
    parser.add_argument("--state-key", default=os.environ.get("SUPABASE_STATE_KEY", "brandream-main"))
    parser.add_argument("--timeout", type=int, default=30)
    parser.add_argument("--dry-run", action="store_true", help="Preview the cloud state without writing local files.")
    return parser


def main() -> int:
    load_env_files(DEFAULT_ENV_FILES)
    parser = build_parser()
    args = parser.parse_args()

    sqlite_path = Path(args.sqlite_path)
    json_path = Path(args.json_path)
    supabase_url = read_required_env("SUPABASE_URL")
    server_key = read_supabase_server_key()
    state_table = args.state_table or read_required_env("SUPABASE_STATE_TABLE")
    state_key = args.state_key or read_required_env("SUPABASE_STATE_KEY")

    state, updated_at = fetch_state_from_supabase(
        supabase_url=supabase_url,
        server_key=server_key,
        state_table=state_table,
        state_key=state_key,
        timeout_seconds=args.timeout,
    )
    summary = summarize_state(state)

    print("Cloud state summary")
    print(f"- Table: {state_table}")
    print(f"- State key: {state_key}")
    print(f"- Cloud updatedAt: {updated_at or 'Unknown'}")
    print(f"- Influencers: {summary['influencers']}")
    print(f"- Brands: {summary['brands']}")
    print(f"- Deleted influencers: {summary['deleted_influencers']}")
    print(f"- Selected for report: {summary['selected_for_report']}")
    print(f"- Platforms: {', '.join(summary['platforms']) or 'None'}")

    if args.dry_run:
        print("Dry run complete. No local files were changed.")
        return 0

    backup_info = backup_local_files(sqlite_path, json_path)
    write_state_to_local(sqlite_path, json_path, state, updated_at)

    print("Local restore completed successfully.")
    print(f"- SQLite path: {sqlite_path}")
    print(f"- JSON path: {json_path}")
    print(f"- DB backup: {backup_info['db_backup'] or 'None'}")
    print(f"- JSON backup: {backup_info['json_backup'] or 'None'}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:  # noqa: BLE001
        print(f"Error: {error}", file=sys.stderr)
        raise SystemExit(1)
