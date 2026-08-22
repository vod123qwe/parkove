var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
var ALLOWED = [
  "https://vod123qwe.github.io",
  "http://localhost:5183",
  "http://127.0.0.1:5183"
];
var cors = /* @__PURE__ */ __name((origin) => ({
  "Access-Control-Allow-Origin": ALLOWED.includes(origin) ? origin : ALLOWED[0],
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
}), "cors");
var json = /* @__PURE__ */ __name((body, status, origin) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json", ...cors(origin) }
}), "json");
var worker_default = {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") ?? "";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (request.method !== "POST") return json({ error: "Tylko POST" }, 405, origin);
    if (origin && !ALLOWED.includes(origin)) return json({ error: "Nie ten adres" }, 403, origin);
    if (!env.PLANTNET_KEY) return json({ error: "Brak klucza w Workerze" }, 500, origin);
    const len = Number(request.headers.get("Content-Length") ?? 0);
    if (len > 8 * 1024 * 1024) return json({ error: "Zdj\u0119cie za du\u017Ce" }, 413, origin);
    let form;
    try {
      form = await request.formData();
    } catch {
      return json({ error: "Nie umiem odczyta\u0107 zdj\u0119cia" }, 400, origin);
    }
    const images = form.getAll("images").filter((f) => typeof f !== "string");
    if (!images.length) return json({ error: "Nie ma zdj\u0119cia" }, 400, origin);
    const out = new FormData();
    for (const img of images.slice(0, 5)) out.append("images", img);
    for (const organ of form.getAll("organs")) out.append("organs", organ);
    const url = new URL("https://my-api.plantnet.org/v2/identify/all");
    url.searchParams.set("api-key", env.PLANTNET_KEY);
    url.searchParams.set("lang", "pl");
    url.searchParams.set("nb-results", "3");
    let res;
    try {
      res = await fetch(url, { method: "POST", body: out });
    } catch {
      return json({ error: "Pl@ntNet nie odpowiada" }, 502, origin);
    }
    if (res.status === 404) return json({ results: [], note: "To chyba nie ro\u015Blina" }, 200, origin);
    if (res.status === 429)
      return json({ error: "Dzienny limit wyczerpany, wr\xF3\u0107 jutro" }, 429, origin);
    if (!res.ok) return json({ error: `Pl@ntNet odpowiedzia\u0142 ${res.status}` }, 502, origin);
    const data = await res.json();
    return json(
      {
        results: (data.results ?? []).slice(0, 3).map((r) => ({
          score: r.score,
          latin: r.species?.scientificNameWithoutAuthor ?? r.species?.scientificName ?? "",
          common: r.species?.commonNames?.[0] ?? "",
          family: r.species?.family?.scientificNameWithoutAuthor ?? ""
        })),
        left: data.remainingIdentificationRequests ?? null
      },
      200,
      origin
    );
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
