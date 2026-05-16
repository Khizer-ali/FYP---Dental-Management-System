/**
 * Fetch and parse JSON safely. Avoids "Unexpected end of JSON input" when the
 * body is empty or the server returns HTML (wrong proxy, 502, SPA fallback).
 */
export async function fetchJson(url, init) {
  let res;
  try {
    res = await fetch(url, init);
  } catch (e) {
    const err = new Error(
      'Cannot reach the server. Start the Flask backend on port 5000, or check Docker / Vite proxy settings.'
    );
    err.code = 'NETWORK';
    err.cause = e;
    throw err;
  }

  const text = await res.text();
  if (!text.trim()) {
    return { res, data: null };
  }

  try {
    return { res, data: JSON.parse(text) };
  } catch {
    const err = new Error(
      'The server returned a non-JSON response. If you use "npm run dev", ensure the Vite proxy targets your backend (see vite.config.js).'
    );
    err.code = 'BAD_JSON';
    err.status = res.status;
    throw err;
  }
}
