const { getEnvConfig, readState, sendJson } = require("./_lib/state-store");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const config = getEnvConfig();
    const state = await readState();
    sendJson(response, 200, {
      ok: true,
      storageMode: "cloud-supabase",
      table: config.table,
      stateKey: config.stateKey,
      updatedAt: state.updatedAt,
    });
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      storageMode: "cloud-supabase",
      error: error.message,
    });
  }
};

