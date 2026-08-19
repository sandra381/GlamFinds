// Servicio que arma el prompt para la IA (Gemini) y genera outfits sugeridos en formato JSON
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Pausa la ejecución "ms" milisegundos, usada entre reintentos
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Construye el prompt y llama a Gemini. Reintenta si el modelo está saturado (503).
async function generarOutfitIA(ocasion, clima, colores, intento = 1) {
  const colorTexto = (colores && colores.length) ? colores.join(', ') : 'sin preferencia de color';

  const prompt = `
  Eres un asesor de moda experto, con un profundo conocimiento de tendencias, combinaciones de colores, tejidos y siluetas adecuadas para cada ocasión y clima.

  El usuario te pide un outfit para:
  - Ocasión: ${ocasion}
  - Clima: ${clima}
  - Colores preferidos: ${colores || 'sin preferencia'}

  Tu tarea es sugerir un outfit completo que sea:
  - Estéticamente coherente (las prendas combinan entre sí en estilo y color).
  - Práctico para la ocasión y el clima.
  - Original y con personalidad, evitando clichés.

  Desglosa el outfit en estas cuatro categorías:
  - top: prenda superior (ej. "una blusa de seda azul celeste con cuello halter")
  - bottom: prenda inferior (ej. "pantalones de lino beige de talle alto")
  - shoes: calzado (ej. "sandalias de tacón medio en color nude")
  - accessory: accesorio principal (ej. "un bolso bandolera de cuero marrón claro")

  Además, para CADA una de esas cuatro prendas, dame también una consulta de búsqueda corta en INGLÉS (2 a 4 palabras, solo tipo de prenda + color + material si aplica, SIN adjetivos largos ni frases completas, pensada para un banco de fotos de stock, ej: "beige linen pants", "nude medium heels", "brown leather crossbody bag"). Estos van en los campos top_query, bottom_query, shoes_query, accessory_query.

  Además, incluye una razón (reason) que explique por qué este outfit es ideal: conecta la elección de cada prenda con la ocasión, el clima y los colores. Menciona cómo las texturas y los cortes favorecen la situación.

  IMPORTANTE:
  - Responde ÚNICAMENTE con un JSON válido.
  - No añadas texto antes ni después del JSON.
  - Usa descripciones detalladas, de al menos 5 palabras por prenda, incluyendo material, color y detalles de diseño, para los campos top/bottom/shoes/accessory (NO para los campos _query, esos deben quedarse cortos, 2 a 4 palabras).
  - La razón debe ser persuasiva y de 2 a 3 frases.

  Formato JSON exacto:
  {
    "top": "descripción corta",
    "top_query": "consulta corta en inglés",
    "bottom": "descripción corta",
    "bottom_query": "consulta corta en inglés",
    "shoes": "descripción corta",
    "shoes_query": "consulta corta en inglés",
    "accessory": "descripción corta",
    "accessory_query": "consulta corta en inglés",
    "reason": "explicación convincente"
  }
  `;

  try {
    // Envía el prompt a la API de Gemini y espera la respuesta generada
    const response = await axios.post(
      GEMINI_URL,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        }
      }
    );

    // Limpia el texto de la respuesta (quita marcas de bloque ```json) y lo convierte a objeto JS
    const textoRespuesta = response.data.candidates[0].content.parts[0].text;
    const jsonLimpio = textoRespuesta.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonLimpio);

  } catch (error) {
    // Si Gemini responde 503 (saturado), reintenta hasta MAX_INTENTOS veces con espera creciente
    const esSaturado = error.response?.data?.error?.code === 503;
    const MAX_INTENTOS = 3;

    if (esSaturado && intento < MAX_INTENTOS) {
      console.log(`Gemini saturado, reintentando... (intento ${intento + 1}/${MAX_INTENTOS})`);
      await esperar(1000 * intento); // espera 1s, luego 2s, luego 3s
      return generarOutfitIA(ocasion, clima, colores, intento + 1);
    }

    throw error;
  }
}

module.exports = { generarOutfitIA };