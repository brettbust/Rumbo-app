/* ============================================================
   RUMBO - Cloudflare Worker (backend de IA)
   Tres acciones:
     1) (por defecto) Leer un cronograma (archivo/texto) y devolver etapas
     2) action:"motivate" -> frases motivadoras genericas
     3) action:"plan"     -> generar un plan de etapas desde una meta escrita
   La clave de Gemini va como secret: env.GEMINI_KEY  (NUNCA en el codigo)
   ============================================================ */

const MODELS = [
  "gemini-flash-latest",
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-flash-lite-latest",
  "gemini-2.0-flash"
];
const RETRY_STATUS = [404, 429, 500, 503];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json", ...CORS }
  });
}

const WORKER_VERSION = "w7"; // sube este numero cada vez que cambies el worker

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    // GET: chequeo de salud y version (para verificar que desplegaste lo ultimo)
    if (request.method === "GET") return json({ ok: true, version: WORKER_VERSION });
    if (request.method !== "POST") return json({ error: "Usa POST" }, 405);
    if (!env.GEMINI_KEY) return json({ error: "Falta la clave GEMINI_KEY en el servidor" }, 500);

    let body;
    try { body = await request.json(); }
    catch (e) { return json({ error: "JSON invalido" }, 400); }

    const action = body.action || "extract";
    try {
      if (action === "motivate") return await doMotivate(body, env);
      if (action === "plan")     return await doPlan(body, env);
      return await doExtract(body, env);
    } catch (e) {
      return json({ error: "Error del servidor", detail: String(e && e.message || e) }, 500);
    }
  }
};

/* ---------- Llamada a Gemini con cascada de modelos ---------- */
async function callModels(reqBody, env) {
  let last = { status: 0, raw: "" };
  for (const model of MODELS) {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" +
                model + ":generateContent?key=" + env.GEMINI_KEY;
    let resp;
    try {
      resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody)
      });
    } catch (e) {
      last = { status: 0, raw: String(e && e.message || e) };
      continue;
    }
    if (RETRY_STATUS.includes(resp.status)) {
      last = { status: resp.status, raw: await resp.text().catch(() => "") };
      continue;
    }
    const data = await resp.json().catch(() => null);
    if (!data) { last = { status: resp.status, raw: "respuesta no legible" }; continue; }
    const cand = data.candidates && data.candidates[0];
    const txt = cand && cand.content && cand.content.parts && cand.content.parts[0] && cand.content.parts[0].text;
    const finishReason = cand && cand.finishReason;
    if (txt) return { ok: true, text: txt, model, finishReason };
    last = { status: resp.status, raw: JSON.stringify(data).slice(0, 400), finishReason };
  }
  return { ok: false, ...last };
}

/* ---------- Rescatar JSON truncado ---------- */
function extractJson(txt) {
  if (!txt) return null;
  let s = txt.trim();
  s = s.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  try { return JSON.parse(s); } catch (e) {}
  // intentar recortar hasta el ultimo objeto/arreglo cerrado
  const first = s.indexOf("{");
  const firstArr = s.indexOf("[");
  const start = (first < 0) ? firstArr : (firstArr < 0 ? first : Math.min(first, firstArr));
  if (start < 0) return null;
  for (let end = s.length; end > start; end--) {
    const sub = s.slice(start, end);
    try { return JSON.parse(sub); } catch (e) {}
  }
  return null;
}

function rescueStages(txt) {
  // recupera etapas de un arreglo JSON cortado a la mitad
  const out = [];
  const re = /\{\s*"date"\s*:\s*"([^"]+)"\s*,\s*"label"\s*:\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(txt)) !== null) out.push({ date: m[1], label: m[2] });
  return out;
}

/* ============================================================
   1) EXTRAER CRONOGRAMA
   ============================================================ */
function extractPrompt(lang) {
  const L = lang || "Espanol";
  return [
    "Eres un asistente que convierte cronogramas en una lista de etapas.",
    "Te doy un archivo o un texto. Puede ser un calendario de clases, un plan de estudio,",
    "un plan de entrenamiento, un temario con fechas, etc.",
    "",
    "PRIMERO decide si el contenido ES REALMENTE un cronograma o plan con una secuencia de fechas o pasos.",
    "Si NO lo es (por ejemplo: una foto cualquiera, un meme, una captura de pantalla sin fechas,",
    "un recibo, un documento de texto sin plan, una imagen de personas, un paisaje, etc.),",
    "NO inventes fechas. Devuelve EXACTAMENTE este JSON:",
    '{"notSchedule": true}',
    "",
    "Si SI es un cronograma, devuelve SOLO un JSON con este formato, sin texto adicional:",
    '{"stages":[{"date":"YYYY-MM-DD","label":"nombre de la etapa"}, ...]}',
    "",
    "REGLA MAS IMPORTANTE SOBRE EL IDIOMA:",
    "Cada campo label DEBE estar escrito en " + L + ", SIEMPRE, sin excepcion.",
    "El archivo original puede venir en CUALQUIER idioma (hebreo, ingles, arabe, etc.).",
    "TRADUCE el contenido de cada label al idioma " + L + ". Nunca copies el texto en su idioma original.",
    "Ejemplo: si el idioma pedido es " + L + " y el archivo dice un tema en otro idioma,",
    "debes escribir ese tema traducido a " + L + ". Las FECHAS nunca se traducen, solo los textos.",
    "",
    "Otras reglas:",
    "- Una etapa por cada fecha o sesion del cronograma.",
    "- Las fechas SIEMPRE en formato YYYY-MM-DD.",
    "- El campo label es el tema, clase o actividad de esa fecha, breve, en " + L + ".",
    "- Si una fila no tiene fecha clara, omitela.",
    "- No agregues comentarios ni explicaciones, solo el JSON."
  ].join("\n");
}

async function doExtract(body, env) {
  const lang = body.lang || "Espanol";
  const parts = [{ text: extractPrompt(lang) }];

  if (body.fileBase64 && body.mimeType) {
    parts.push({ inline_data: { mime_type: body.mimeType, data: body.fileBase64 } });
  } else if (body.text) {
    parts.push({ text: "\n\nCONTENIDO:\n" + String(body.text).slice(0, 30000) });
  } else {
    return json({ error: "No llego ni archivo ni texto" }, 400);
  }

  const reqBody = {
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 32768,
      responseMimeType: "application/json"
    }
  };

  const r = await callModels(reqBody, env);
  if (!r.ok) {
    return json({ error: "Error de la IA", status: r.status, raw: r.raw, finishReason: r.finishReason }, 502);
  }

  const parsed = extractJson(r.text);
  // La IA dijo que no es un cronograma
  if (parsed && parsed.notSchedule === true) {
    return json({ notSchedule: true });
  }
  let stages = parsed && Array.isArray(parsed.stages) ? parsed.stages : null;
  if (!stages) stages = rescueStages(r.text);

  stages = (stages || [])
    .filter(s => s && s.date)
    .map(s => ({ date: String(s.date).trim(), label: String(s.label || "").trim() }));

  if (stages.length === 0) {
    // sin etapas y sin senal de "no es cronograma": lo tratamos como no-cronograma
    return json({ notSchedule: true });
  }
  return json({ stages });
}

/* ============================================================
   2) MOTIVAR
   ============================================================ */
function motivatePrompt(lang) {
  const L = lang || "Espanol";
  return [
    "Genera 8 frases motivadoras cortas, originales y variadas para alguien que avanza en una meta personal.",
    "Idioma: " + L + ".",
    "Reglas: cada frase entre 4 y 18 palabras; sin numeros de etapa; sin comillas dentro;",
    "tono calido pero no cursi; no repitas estructuras.",
    'Devuelve SOLO un JSON: {"msgs":["frase1","frase2", ...]}'
  ].join("\n");
}

async function doMotivate(body, env) {
  const lang = body.lang || "Espanol";
  const reqBody = {
    contents: [{ role: "user", parts: [{ text: motivatePrompt(lang) }] }],
    generationConfig: {
      temperature: 1.0,
      maxOutputTokens: 512,
      responseMimeType: "application/json"
    }
  };
  const r = await callModels(reqBody, env);
  if (!r.ok) return json({ error: "Error de la IA", status: r.status, raw: r.raw }, 502);
  const parsed = extractJson(r.text);
  const msgs = parsed && Array.isArray(parsed.msgs) ? parsed.msgs : [];
  return json({ msgs: msgs.filter(m => typeof m === "string" && m.trim()).map(m => m.trim()) });
}

/* ============================================================
   3) PLAN (generador de metas)
   ============================================================ */
function planPrompt(lang, goalText, startDate) {
  const L = lang || "Espanol";
  return [
    "Eres un entrenador experto que disena planes de accion por etapas, claros y realistas.",
    "Meta del usuario: \"" + String(goalText).slice(0, 500) + "\".",
    "Idioma de salida: " + L + ".",
    "La primera etapa empieza en la fecha: " + startDate + " (formato YYYY-MM-DD).",
    "",
    "Decide TU el numero de etapas segun lo LOGICO para esta meta concreta, sin inflarlo ni quedarte corto:",
    "- Metas simples (ej: cocinar un omelet) -> 4 a 6 etapas, en dias seguidos o muy cercanos.",
    "- Metas medianas (ej: correr 5K, armar un presupuesto) -> 6 a 12 etapas, repartidas en varias semanas.",
    "- Metas grandes (ej: aprender un idioma, aprender a programar) -> 12 a 25 etapas, repartidas en semanas o meses.",
    "Usa entre 4 y 25 etapas. El ritmo entre fechas debe tener sentido real para la meta.",
    "",
    "EMPIEZA POR LA PREPARACION. Antes de las etapas de practica, incluye (cuando la meta lo requiera) las etapas previas de:",
    "- Conseguir lo necesario: el material, equipo o herramienta base (ej: para piano, 'Consigue un teclado o piano de al menos 61 teclas'; para correr, 'Consigue zapatillas adecuadas').",
    "- Decidir el metodo o enfoque: como va a aprender o avanzar (ej: 'Decide como aprenderas: autodidacta con apps/videos, o con un profesor o clases').",
    "- Cualquier paso de arranque logico (abrir una cuenta, inscribirse, preparar el espacio).",
    "Solo incluye estos pasos previos si tienen sentido para la meta; para metas que no necesiten equipo ni decision, ve directo a la accion.",
    "Despues de la preparacion, continua con las etapas de practica de lo basico a lo avanzado.",
    "",
    "CADA ETAPA DEBE SER DETALLADA Y UTIL. El label NO es un titulo de una palabra.",
    "Escribe una instruccion concreta y accionable de 1 o 2 frases: QUE hacer en esa etapa y COMO o con que enfoque,",
    "de modo que el usuario sepa exactamente que hacer sin tener que investigar por su cuenta.",
    "Evita etapas vagas como 'practicar' o 'estudiar'; se especifico (que practicar, cuanto, con que recurso o tecnica).",
    "Haz que las etapas progresen de lo basico a lo avanzado, en un orden que de verdad lleve a la meta.",
    "",
    "Devuelve SOLO un JSON con este formato, sin texto adicional:",
    '{"title":"nombre corto de la meta","emoji":"un emoji","stages":[{"date":"YYYY-MM-DD","label":"instruccion detallada de 1 a 2 frases"}, ...]}',
    "",
    "Reglas:",
    "- title corto y claro, en " + L + ".",
    "- emoji: un solo emoji que represente la meta.",
    "- label: instruccion detallada y concreta de esa etapa (1 a 2 frases), en " + L + ".",
    "- fechas en orden ascendente, empezando en " + startDate + ".",
    "- solo el JSON, sin comentarios."
  ].join("\n");
}

async function doPlan(body, env) {
  const lang = body.lang || "Espanol";
  const goalText = body.goalText || "";
  const startDate = body.startDate || new Date().toISOString().slice(0, 10);
  if (!goalText.trim()) return json({ error: "Falta la meta" }, 400);

  const reqBody = {
    contents: [{ role: "user", parts: [{ text: planPrompt(lang, goalText, startDate) }] }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 32768,
      responseMimeType: "application/json"
    }
  };
  const r = await callModels(reqBody, env);
  if (!r.ok) return json({ error: "Error de la IA", status: r.status, raw: r.raw, finishReason: r.finishReason }, 502);

  const parsed = extractJson(r.text);
  let stages = parsed && Array.isArray(parsed.stages) ? parsed.stages : null;
  if (!stages) stages = rescueStages(r.text);
  stages = (stages || [])
    .filter(s => s && s.date)
    .map(s => ({ date: String(s.date).trim(), label: String(s.label || "").trim() }));

  if (stages.length === 0) return json({ error: "La IA no devolvio etapas validas." }, 502);

  return json({
    title: (parsed && parsed.title) ? String(parsed.title).trim() : "",
    emoji: (parsed && parsed.emoji) ? String(parsed.emoji).trim() : "",
    stages
  });
}
