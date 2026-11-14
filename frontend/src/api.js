
const BASE = "";

async function request(path, method = "GET", body) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API error ${response.status}: ${message}`);
  }

  return response.json();
}

// Read-only mission requests
export const apiGetMissionStatus = () =>
  request("/api/mission/status");

export const apiGetMissionInfo = () =>
  request("/api/mission/info");

// Mission actions — called only after user interaction
export const apiStartMission = () =>
  request("/api/mission/start", "POST");

export const apiAdvanceSol = () =>
  request("/api/mission/advance", "POST");

export const apiApplyAction = (action) =>
  request("/api/mission/action", "POST", { action });
