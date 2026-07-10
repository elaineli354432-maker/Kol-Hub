import json
import os
import shutil
import socket
import sqlite3
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen


ROOT_DIR = Path(__file__).resolve().parent
WORK_DIR = ROOT_DIR / "work"
OUTPUTS_DIR = ROOT_DIR / "outputs"
BACKUP_DIR = OUTPUTS_DIR / "backups"
DB_PATH = WORK_DIR / "app.db"
SEED_PATH = WORK_DIR / "generated_data.json"
SERVER_HOST = "0.0.0.0"
DEFAULT_ENV_FILES = [ROOT_DIR / ".env.local", ROOT_DIR / ".env"]


def utc_now():
    return datetime.now(timezone.utc).isoformat()


def backup_timestamp():
    return datetime.now().strftime("%Y%m%d-%H%M%S")


def create_empty_state():
    return {"version": "db-seed-1", "influencers": [], "brands": []}


def get_server_port():
    raw = os.environ.get("KOL_HUB_PORT", "4173").strip()
    try:
        return int(raw)
    except ValueError:
        return 4173


def load_env_files(paths=DEFAULT_ENV_FILES):
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


def get_cloud_config():
    load_env_files()
    url = os.environ.get("SUPABASE_URL", "").strip().rstrip("/")
    server_key = (
        os.environ.get("SUPABASE_SECRET_KEY", "").strip()
        or os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    )
    if not url or not server_key:
        return None
    return {
        "url": url,
        "server_key": server_key,
        "table": os.environ.get("SUPABASE_STATE_TABLE", "app_state").strip() or "app_state",
        "state_key": os.environ.get("SUPABASE_STATE_KEY", "brandream-main").strip() or "brandream-main",
    }


def get_storage_mode():
    return "cloud-supabase" if get_cloud_config() else "local-sqlite"


def ensure_data_shape(payload):
    if not isinstance(payload, dict):
        return create_empty_state()

    state = dict(payload)
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


def load_seed_state():
    if not SEED_PATH.exists():
        return create_empty_state()


def supabase_request(method, path, payload=None, extra_headers=None):
    config = get_cloud_config()
    if not config:
        raise RuntimeError("Supabase cloud storage is not configured.")

    body = None
    headers = {
        "apikey": config["server_key"],
        "Authorization": f"Bearer {config['server_key']}",
        "Accept": "application/json",
    }
    if extra_headers:
        headers.update(extra_headers)
    if payload is not None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = Request(f"{config['url']}{path}", data=body, method=method, headers=headers)

    try:
        with urlopen(request, timeout=30) as response:
            raw = response.read().decode("utf-8")
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Supabase request failed with {error.code}: {detail}") from error
    except URLError as error:
        raise RuntimeError(f"Supabase request failed: {error.reason}") from error

    return json.loads(raw or "null")


def read_cloud_state():
    config = get_cloud_config()
    if not config:
        raise RuntimeError("Supabase cloud storage is not configured.")

    request_path = (
        f"/rest/v1/{config['table']}"
        f"?id=eq.{quote(config['state_key'], safe='')}"
        "&select=id,payload,updated_at&limit=1"
    )
    rows = supabase_request("GET", request_path, extra_headers={"Prefer": "count=exact"})
    row = rows[0] if rows else None
    if not row:
        return create_empty_state(), ""
    return ensure_data_shape(row.get("payload")), row.get("updated_at") or ""


def save_cloud_state(state):
    config = get_cloud_config()
    if not config:
        raise RuntimeError("Supabase cloud storage is not configured.")

    normalized = ensure_data_shape(state)
    updated_at = utc_now()
    request_path = f"/rest/v1/{config['table']}?on_conflict=id"
    rows = supabase_request(
        "POST",
        request_path,
        payload=[
            {
                "id": config["state_key"],
                "payload": normalized,
                "updated_at": updated_at,
            }
        ],
        extra_headers={"Prefer": "resolution=merge-duplicates,return=representation"},
    )
    row = rows[0] if rows else None
    return ensure_data_shape((row or {}).get("payload", normalized)), (row or {}).get("updated_at") or updated_at

    try:
        return ensure_data_shape(json.loads(SEED_PATH.read_text(encoding="utf-8")))
    except (OSError, json.JSONDecodeError):
        return create_empty_state()


def init_db():
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS app_state (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        row = conn.execute("SELECT id FROM app_state WHERE id = 1").fetchone()
        if row is None:
            conn.execute(
                "INSERT INTO app_state (id, json, updated_at) VALUES (1, ?, ?)",
                (json.dumps(load_seed_state(), ensure_ascii=False), utc_now()),
            )
        conn.commit()


def read_local_state():
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute("SELECT json, updated_at FROM app_state WHERE id = 1").fetchone()

    if row is None:
        state = load_seed_state()
        _, updated_at = save_local_state(state)
        return state, updated_at

    payload, updated_at = row
    return ensure_data_shape(json.loads(payload)), updated_at


def save_local_state(state):
    normalized = ensure_data_shape(state)
    updated_at = utc_now()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO app_state (id, json, updated_at)
            VALUES (1, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                json = excluded.json,
                updated_at = excluded.updated_at
            """,
            (json.dumps(normalized, ensure_ascii=False), updated_at),
        )
        conn.commit()
    return normalized, updated_at


def read_state():
    if get_storage_mode() == "cloud-supabase":
        try:
            return read_cloud_state()
        except Exception as error:  # noqa: BLE001
            print(f"[storage fallback] cloud read failed, using local SQLite: {error}")
            init_db()
            return read_local_state()

    return read_local_state()


def save_state(state):
    if get_storage_mode() == "cloud-supabase":
        try:
            return save_cloud_state(state)
        except Exception as error:  # noqa: BLE001
            print(f"[storage fallback] cloud write failed, saving to local SQLite: {error}")
            init_db()
            return save_local_state(state)

    return save_local_state(state)


def detect_storage_status():
    if get_storage_mode() != "cloud-supabase":
        return {
            "storageMode": "local-sqlite",
            "localIp": get_local_ip(),
            "port": get_server_port(),
            "dbPath": str(DB_PATH),
        }

    config = get_cloud_config() or {}
    try:
        _, updated_at = read_cloud_state()
        return {
            "storageMode": "cloud-supabase",
            "localIp": get_local_ip(),
            "port": get_server_port(),
            "table": config.get("table"),
            "stateKey": config.get("state_key"),
            "updatedAt": updated_at,
        }
    except Exception as error:  # noqa: BLE001
        init_db()
        return {
            "storageMode": "cloud-fallback-local",
            "localIp": get_local_ip(),
            "port": get_server_port(),
            "dbPath": str(DB_PATH),
            "table": config.get("table"),
            "stateKey": config.get("state_key"),
            "warning": str(error),
        }


def create_backup_files():
    state, updated_at = read_state()
    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    stamp = backup_timestamp()
    json_backup_path = BACKUP_DIR / f"brandream-kol-hub-{stamp}.json"
    json_backup_path.write_text(
        json.dumps(
            {
                "exportedAt": utc_now(),
                "updatedAt": updated_at,
                "storageMode": get_storage_mode(),
                "data": state,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    db_backup_path = None
    if get_storage_mode() == "local-sqlite":
        db_backup_path = BACKUP_DIR / f"brandream-kol-hub-{stamp}.db"
        shutil.copy2(DB_PATH, db_backup_path)

    return {
        "storageMode": get_storage_mode(),
        "backupDir": str(BACKUP_DIR),
        "dbBackupPath": str(db_backup_path) if db_backup_path else None,
        "jsonBackupPath": str(json_backup_path),
    }


def get_local_ip():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.connect(("8.8.8.8", 80))
        return sock.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        sock.close()


class BrandreamHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT_DIR), **kwargs)

    def send_json(self, status_code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/data":
            state, updated_at = read_state()
            self.send_json(HTTPStatus.OK, {"data": state, "updatedAt": updated_at})
            return

        if parsed.path == "/api/health":
            payload = {"ok": True, **detect_storage_status()}
            self.send_json(HTTPStatus.OK, payload)
            return

        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/backup":
            backup = create_backup_files()
            self.send_json(HTTPStatus.OK, {"ok": True, **backup})
            return

        if parsed.path != "/api/data":
            self.send_json(HTTPStatus.NOT_FOUND, {"error": "Not found"})
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0

        raw = self.rfile.read(length)
        try:
            payload = json.loads(raw.decode("utf-8") or "{}")
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_json(HTTPStatus.BAD_REQUEST, {"error": "Invalid JSON payload"})
            return

        state = payload.get("data", payload)
        saved_state, updated_at = save_state(state)
        self.send_json(HTTPStatus.OK, {"ok": True, "data": saved_state, "updatedAt": updated_at})

    def log_message(self, fmt, *args):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {self.address_string()} - {fmt % args}")


def run():
    init_db()
    server_port = get_server_port()
    server = ThreadingHTTPServer((SERVER_HOST, server_port), BrandreamHandler)
    local_ip = get_local_ip()
    print(f"Brandream KOL Hub server running on http://127.0.0.1:{server_port}/index.html")
    print(f"LAN access: http://{local_ip}:{server_port}/index.html")
    if get_storage_mode() == "cloud-supabase":
        config = get_cloud_config() or {}
        print("Storage mode: cloud-supabase")
        print(f"Supabase table: {config.get('table')}")
        print(f"Supabase state key: {config.get('state_key')}")
    else:
        print("Storage mode: local-sqlite")
        print(f"SQLite DB: {DB_PATH}")
    server.serve_forever()


if __name__ == "__main__":
    run()
