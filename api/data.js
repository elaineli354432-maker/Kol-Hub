const { normalizeState, readState, sendJson, writeState } = require("./_lib/state-store");

function parseRequestBody(request) {
  if (!request.body) return {};
  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch (error) {
      throw new Error("Invalid JSON payload.");
    }
  }
  return request.body;
}

module.exports = async function handler(request, response) {
  try {
    if (request.method === "GET") {
      const result = await readState();
      sendJson(response, 200, result);
      return;
    }

    if (request.method === "POST") {
      const payload = parseRequestBody(request);
      const result = await writeState(payload.data || payload);
      sendJson(response, 200, { ok: true, ...result });
      return;
    }

    response.setHeader("Allow", "GET, POST");
    sendJson(response, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(response, 500, {
      error: "Cloud storage request failed",
      detail: error.message,
    });
  }
};

