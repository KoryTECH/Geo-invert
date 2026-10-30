// Minimal fetch helper for the C++ backend. In dev, Vite proxies /api and
// /health to http://localhost:8080 (see vite.config.js), so all calls are
// same-origin and no base URL is needed.
//
// Never throws: network failures come back as { ok: false, status: 0 }.

async function request(path, { method = 'GET', body } = {}) {
  try {
    const options = { method }
    if (body !== undefined) {
      options.headers = { 'Content-Type': 'application/json' }
      options.body = JSON.stringify(body)
    }

    const res = await fetch(path, options)
    const text = await res.text()

    let data = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = text // non-JSON body, hand it back raw
      }
    }

    return { ok: res.ok, status: res.status, data }
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err }
  }
}

export function apiGet(path) {
  return request(path)
}

export function apiPost(path, body) {
  return request(path, { method: 'POST', body })
}
