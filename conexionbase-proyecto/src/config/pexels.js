const axios = require('axios');

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_URL = 'https://api.pexels.com/v1/search';

// Busca una foto de stock que coincida con la descripción de la prenda generada por la IA
async function buscarImagenPexels(consulta) {
  try {
    const response = await axios.get(PEXELS_URL, {
      params: {
        query: consulta,
        per_page: 1,
        orientation: 'portrait'
      },
      headers: {
        Authorization: PEXELS_API_KEY
      }
    });

    const foto = response.data.photos[0];
    if (!foto) return null;

    return {
      url: foto.src.large,
      fotografo: foto.photographer,
      fotografo_url: foto.photographer_url
    };
  } catch (error) {
    console.error(`Error buscando imagen en Pexels para "${consulta}":`, error.response?.data || error.message);
    return null;
  }
}

module.exports = { buscarImagenPexels };