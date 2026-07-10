const DEFAULT_STATE_TABLE = process.env.SUPABASE_STATE_TABLE || "app_state";
const DEFAULT_STATE_KEY = process.env.SUPABASE_STATE_KEY || "brandream-main";

function utcNow() {
  return new Date().toISOString();
}

function createEmptyState() {
  return {
    version: "db-seed-1",
    influencers: [],
    brands: [],
  };
}

function normalizeState(payload) {
  const state =
    payload && typeof payload === "object"
      ? JSON.parse(JSON.stringify(payload))
      : createEmptyState();

  if (!Array.isArray(state.influencers)) state.influencers = [];
  if (!Array.isArray(state.brands)) state.brands = [];
  if (!state.version) state.version = "db-seed-1";

  state.brands = state.brands.filter(
    (brand) => (brand?.brandName || "").trim().toLowerCase() !== "brandream",
  );

  return state;
}

function getEnvConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL and SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY).");
  }

  return {
    url: url.replace(/\/+$/, ""),
    serviceRoleKey,
    table: DEFAULT_STATE_TABLE,
    stateKey: DEFAULT_STATE_KEY,
  };
}

async function supabaseFetch(path, options = {}) {
  const { url, serviceRoleKey } = getEnvConfig();
  const response = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${errorText}`);
  }

  return response;
}

async function readState() {
  const { table, stateKey } = getEnvConfig();
  const response = await supabaseFetch(
    `/rest/v1/${table}?id=eq.${encodeURIComponent(stateKey)}&select=id,payload,updated_at&limit=1`,
    { method: "GET", headers: { Prefer: "count=exact" } },
  );
  const rows = await response.json();
  const row = rows[0];

  if (!row) {
    return { data: createEmptyState(), updatedAt: "" };
  }

  return {
    data: normalizeState(row.payload),
    updatedAt: row.updated_at || "",
  };
}

async function writeState(payload) {
  const { table, stateKey } = getEnvConfig();
  const updatedAt = utcNow();
  const normalized = normalizeState(payload);
  const response = await supabaseFetch(`/rest/v1/${table}?on_conflict=id`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([
      {
        id: stateKey,
        payload: normalized,
        updated_at: updatedAt,
      },
    ]),
  });
  const rows = await response.json();
  const row = rows[0];

  return {
    data: normalizeState(row?.payload || normalized),
    updatedAt: row?.updated_at || updatedAt,
  };
}

function sendJson(response, statusCode, payload) {
  response.setHeader("Cache-Control", "no-store");
  response.status(statusCode).json(payload);
}

module.exports = {
  createEmptyState,
  getEnvConfig,
  normalizeState,
  readState,
  sendJson,
  writeState,
};
