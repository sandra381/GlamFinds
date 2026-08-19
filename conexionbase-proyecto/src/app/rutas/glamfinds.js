// Este archivo define todas las rutas (endpoints) y la lógica de controlador de la API de GlamFinds
const conn = require('../../config/database'); // Conexión a la base de datos MySQL
const multer = require('multer'); // Middleware para subir archivos (imágenes)
const path = require('path');
const axios = require('axios');
const sharp = require('sharp'); // Librería para procesar/redimensionar imágenes

const express = require('express');
const fs = require('fs');


const Vibrant = require('node-vibrant'); // Extrae colores dominantes de una imagen
const getColors = require('get-image-colors'); // Extrae paleta de colores de una imagen


const { generarOutfitIA } = require('../../config/gemini'); // Genera outfits sugeridos con IA (Gemini)
const { buscarImagenPexels } = require('../../config/pexels'); // Busca fotos de stock para el outfit generado


// Configuración de multer: define dónde y con qué nombre se guardan las imágenes subidas
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'C:\\Users\\danie\\OneDrive\\Escritorio\\Proyecto Privado\\GlamFinds\\src\\assets\\img');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext); // Nombre único basado en la fecha/hora actual
    }
});
const upload = multer({ storage: storage });



// Paleta de colores predefinidos: cada tono base tiene variantes con nombre y su valor RGB,
// usada para identificar el color más parecido de una prenda a partir de un color detectado
const colorShades = {
    amarillo: [
        { name: 'almendra', rgb: [239, 222, 205] },
        { name: 'amarillo mostaza', rgb: [208, 166, 35] },
        { name: 'arena', rgb: [194, 178, 128] },
        { name: 'amarillo brillante', rgb: [255, 255, 0] },
        { name: 'amarillo palido', rgb: [255, 255, 153] },
        { name: 'amarillo dorado', rgb: [255, 223, 0] },
        { name: 'amarillo limon', rgb: [255, 247, 0] },
        { name: 'amarillo pastel', rgb: [255, 239, 170] },
        { name: 'amarillo oscuro', rgb: [204, 204, 0] },
        { name: 'dorado', rgb: [210, 180, 120] },
        { name: 'amarillo camel', rgb: [193, 154, 107] },
    ],
    azul: [
        { name: 'azul acero', rgb: [70, 130, 180] },
        { name: 'azul claro', rgb: [173, 216, 230] },
        { name: 'azul celeste', rgb: [135, 206, 235] },
        { name: 'azul cobalto', rgb: [61, 89, 171] },
        { name: 'azul marino', rgb: [0, 0, 128] },
        { name: 'azul marino', rgb: [0, 25, 57] },
        { name: 'azul oscuro', rgb: [23, 29, 48] },
        { name: 'azul oscuro', rgb: [0, 0, 139] },
        { name: 'azul rey', rgb: [65, 105, 225] },
        { name: 'azul turquesa', rgb: [64, 224, 208] },
        { name: 'azul grisaceo', rgb: [0, 128, 189] },
        { name: 'azul cielo', rgb: [135, 206, 235] },
        { name: 'azul real', rgb: [65, 105, 225] },
        { name: 'azul zafiro', rgb: [15, 82, 186] },
        { name: 'azul cobalto', rgb: [0, 71, 171] },
        { name: 'azul rey', rgb: [72, 61, 139] },
        { name: 'azul indigo', rgb: [75, 0, 130] },
        { name: 'azul vaquero', rgb: [33, 67, 95] },
        { name: 'azul petroleo', rgb: [0, 99, 126] },
        { name: 'azul aqua', rgb: [127, 255, 212] },
        { name: 'azul genciana', rgb: [30, 144, 255] },
        { name: 'azul denim', rgb: [21, 96, 189] },
        { name: 'azul noche', rgb: [25, 25, 112] },
        { name: 'azul electrico', rgb: [44, 117, 255] },
        { name: 'azul pastel', rgb: [174, 198, 207] },
        { name: 'azul lavanda', rgb: [230, 230, 250] },
        { name: 'azul hielo', rgb: [173, 216, 230] },
        { name: 'azul ceruleo', rgb: [42, 82, 190] },
        { name: 'azul Mediterraneo', rgb: [0, 121, 191] },
        { name: 'azul grisáceo', rgb: [96, 130, 182] },
        { name: 'azul cobalto oscuro', rgb: [61, 89, 171] },
        { name: 'azul pastel suave', rgb: [189, 183, 107] },
        { name: 'azul cian', rgb: [0, 255, 255] },
        { name: 'celeste', rgb: [153, 172, 182] },
        { name: 'azul oscuro', rgb: [39, 39, 48] },
        { name: 'azul turquesa clarito', rgb: [57, 85, 97] },
        { name: 'azul oscuro grisoso', rgb: [54, 69, 79] },
        { name: 'azul obscuro celeste', rgb: [112, 128, 144] },
    ],
    beige: [
        { name: 'beige', rgb: [183, 166, 149] },
        { name: 'beige claro', rgb: [245, 245, 220] },
        { name: 'beige claro', rgb: [230, 188, 137] },
        { name: 'beige grisaceo', rgb: [190, 187, 185] },
        { name: 'beige oscuro', rgb: [210, 180, 140] },
        { name: 'beige oscuro', rgb: [167, 116, 81] },
        { name: 'beige arenoso', rgb: [222, 202, 170] },
        { name: 'beige palido', rgb: [245, 245, 200] },
        { name: 'beige dorado', rgb: [210, 180, 120] },
        { name: 'beige intenso', rgb: [126, 116, 100] },
    ],
    blanco: [
        { name: 'blanco', rgb: [255, 255, 255] },
        { name: 'blanco hueso', rgb: [255, 250, 240] },
        { name: 'blanco perla', rgb: [252, 244, 248] },
        { name: 'blanco nieve', rgb: [255, 250, 250] },
        { name: 'blanco marfil', rgb: [255, 255, 240] },
        { name: 'blanco roto', rgb: [245, 245, 245] },
        { name: 'blanco suave', rgb: [225, 220, 219] },
        { name: 'blanco hueso gris', rgb: [214, 210, 212] },
    ],
    gris: [
        { name: 'gris', rgb: [197, 196, 196] },
        { name: 'gris azulado claro', rgb: [202, 206, 217] },
        { name: 'gris claro', rgb: [220, 225, 228] },
        { name: 'gris claro', rgb: [211, 211, 211] },
        { name: 'gris oscuro', rgb: [169, 169, 169] },
        { name: 'gris oscuro', rgb: [71, 65, 127] },
        { name: 'gris plata', rgb: [192, 192, 192] },
    ],
    marron: [
        { name: 'marron', rgb: [148, 134, 119] },
        { name: 'marron camel', rgb: [193, 154, 107] },
        { name: 'marron claro', rgb: [210, 180, 140] },
        { name: 'marron grisaceo', rgb: [139, 114, 103] },
        { name: 'marron oscuro', rgb: [139, 69, 19] },
        { name: 'marron palido', rgb: [189, 176, 185] },
        { name: 'marron rojizo', rgb: [57, 32, 26] },
        { name: 'marron terracota', rgb: [166, 104, 70] },
        { name: 'marron cobre', rgb: [184, 115, 51] },
        { name: 'marron castaño', rgb: [139, 69, 19] },
        { name: 'marron nuez', rgb: [150, 75, 0] },
        { name: 'marron tierra', rgb: [222, 184, 135] },
        { name: 'marron caramelo', rgb: [175, 111, 71] },
        { name: 'marron miel', rgb: [201, 140, 70] },
        { name: 'cafe', rgb: [165, 42, 42] },
        { name: 'chocolate', rgb: [210, 105, 30] },
        { name: 'marron camel', rgb: [193, 154, 107] },
        { name: 'marron claro', rgb: [210, 180, 140] },
        { name: 'marron grisaceo', rgb: [139, 114, 103] },
        { name: 'marron oscuro', rgb: [139, 69, 19] },
        { name: 'marron rojizo', rgb: [57, 32, 26] },
        { name: 'marron terracota', rgb: [166, 104, 70] },
        { name: 'marron cobre', rgb: [184, 115, 51] },
        { name: 'marron castaño', rgb: [139, 69, 19] },
        { name: 'marron nuez', rgb: [150, 75, 0] },
        { name: 'marron caoba', rgb: [128, 0, 0] },
        { name: 'marron caramelo', rgb: [175, 111, 71] },
        { name: 'marron miel', rgb: [201, 140, 70] },
        { name: 'marron tierra', rgb: [222, 184, 135] },
        { name: 'marron grisaceo', rgb: [105, 65, 62] },
        { name: 'marron suave', rgb: [192, 183, 173] },
        { name: 'marron arcilla', rgb: [198, 156, 109] },
        { name: 'cafe chocolate', rgb: [66, 59, 51] },
        { name: 'cafe apagado', rgb: [58, 38, 27] },
        { name: 'cafe clarito', rgb: [71, 67, 63] },
        { name: 'cafe medio', rgb: [86, 74, 81] },
        { name: 'cafe verdoso', rgb: [111, 105, 119] },
    ],
    morado: [
        { name: 'morado', rgb: [128, 0, 128] },
        { name: 'morado noche', rgb: [64, 0, 64] },
        { name: 'morado oscuro', rgb: [75, 0, 130] },
        { name: 'morado pastel', rgb: [218, 112, 214] },
        { name: 'morado real', rgb: [102, 51, 153] },
        { name: 'morado intenso', rgb: [30, 34, 48] },
        { name: 'morado lavanda', rgb: [230, 230, 250] },
        { name: 'morado ciruela', rgb: [142, 69, 133] },
        { name: 'morado berenjena', rgb: [97, 49, 103] },
        { name: 'lavanda', rgb: [230, 230, 250] },
        { name: 'lila', rgb: [200, 162, 200] },
        { name: 'lila suave', rgb: [217, 210, 215] },
        { name: 'lila', rgb: [188, 180, 196] },
        { name: 'malva', rgb: [224, 176, 255] },
        { name: 'violeta', rgb: [238, 130, 238] },
        { name: 'violeta claro', rgb: [199, 21, 133] },
        { name: 'violeta medio', rgb: [138, 43, 226] },
        { name: 'violeta oscuro', rgb: [148, 0, 211] },
        { name: 'violeta intenso', rgb: [110, 47, 145] },
        { name: 'orquidea media', rgb: [186, 85, 211] },
        { name: 'orquidea oscuro', rgb: [153, 50, 204] },
        { name: 'purpura', rgb: [128, 0, 128] },
        { name: 'purpura claro', rgb: [147, 112, 219] },
        { name: 'purpura oscuro', rgb: [104, 34, 139] },
        { name: 'purpura profundo', rgb: [102, 2, 60] },
        { name: 'purpura intenso', rgb: [71, 12, 107] }
    ],
    naranja: [
        { name: 'naranja', rgb: [215, 70, 11] },
        { name: 'naranja oscuro', rgb: [215, 115, 50] },
        { name: 'naranja brillante', rgb: [255, 165, 0] },
        { name: 'naranja pastel', rgb: [255, 195, 160] },
        { name: 'naranja quemado', rgb: [204, 85, 0] },
        { name: 'naranja mandarina', rgb: [255, 140, 0] },
        { name: 'naranja coral', rgb: [255, 127, 80] },
        { name: 'terracota', rgb: [198, 104, 70] }
    ],
    negro: [
        { name: 'negro', rgb: [0, 0, 0] },
        { name: 'negro suave', rgb: [26, 24, 23] },
        { name: 'negro carbon', rgb: [54, 69, 79] },
        { name: 'negro azabache', rgb: [0, 0, 0] },
        { name: 'negro onix', rgb: [36, 36, 36] }
    ],
    rojo: [
        { name: 'rojo brillante', rgb: [255, 0, 0] },
        { name: 'rojo carmesi', rgb: [220, 20, 60] },
        { name: 'rojo coral', rgb: [255, 127, 80] },
        { name: 'rojo oscuro', rgb: [139, 0, 0] },
        { name: 'rojo oscuro', rgb: [97, 21, 38] },
        { name: 'rojo ladrillo', rgb: [178, 34, 34] },
        { name: 'rojo oxido', rgb: [165, 42, 42] },
        { name: 'rojo sangre', rgb: [150, 7, 38] }
    ],
    rosa: [
        { name: 'rosa bebe', rgb: [255, 192, 203] },
        { name: 'rosa claro', rgb: [255, 182, 193] },
        { name: 'rosa claro', rgb: [225, 198, 231] },
        { name: 'rosa fuerte', rgb: [255, 20, 147] },
        { name: 'rosa intenso', rgb: [255, 105, 180] },
        { name: 'rosa mexicano', rgb: [226, 0, 116] },
        { name: 'rosa muy pálido', rgb: [255, 240, 245] },
        { name: 'rosa pastel', rgb: [255, 174, 185] },
        { name: 'rosa polvo', rgb: [219, 112, 147] },
        { name: 'rosa palido', rgb: [233, 225, 219] },
        { name: 'rosa viejo', rgb: [188, 143, 143] },
        { name: 'rosado palido', rgb: [200, 177, 176] },
        { name: 'rosa palido blanco', rgb: [214, 214, 215] },
    ],
    verde: [
        { name: 'verde azulado', rgb: [112, 96, 82] },
        { name: 'verde botella', rgb: [0, 106, 78] },
        { name: 'verde claro', rgb: [183, 232, 164] },
        { name: 'verde claro', rgb: [144, 238, 144] },
        { name: 'verde esmeralda', rgb: [80, 200, 120] },
        { name: 'verde intenso', rgb: [30, 34, 48] },
        { name: 'verde lima', rgb: [50, 205, 50] },
        { name: 'verde menta', rgb: [152, 251, 152] },
        { name: 'verde menta', rgb: [203, 219, 178] },
        { name: 'verde musgo', rgb: [85, 107, 47] },
        { name: 'verde musgo', rgb: [47, 39, 53] },
        { name: 'verde oliva', rgb: [163, 159, 141] },
        { name: 'verde oliva', rgb: [126, 88, 166] },
        { name: 'verde oliva claro', rgb: [203, 183, 187] },
        { name: 'verde oliva oscuro', rgb: [50, 40, 28] },
        { name: 'verde oliva oscuro', rgb: [180, 170, 157] },
        { name: 'verde seco', rgb: [140, 143, 100] },
        { name: 'verde azulado', rgb: [60, 55, 42] },
        { name: 'verde cafe', rgb: [53, 52, 46] },
    ]
};

// Funciones auxiliares

// Convierte el objeto colorShades (agrupado por tono) en una sola lista plana de colores
function getAllColors(colorShades) {
    let allColors = [];
    for (const category in colorShades) {
        allColors = allColors.concat(colorShades[category]);
    }
    return allColors;
}

// Calcula la distancia euclidiana entre dos colores RGB (qué tan parecidos son)
function colorDistance(c1, c2) {
    const [r1, g1, b1] = c1;
    const [r2, g2, b2] = c2;
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

// Busca en la lista de colores cuál es el nombre más cercano a un color RGB dado
function findClosestColor(rgbColor, colorList) {
    let closestColor = colorList[0];
    let minDistance = colorDistance(rgbColor, closestColor.rgb);
    for (const color of colorList) {
        const distance = colorDistance(rgbColor, color.rgb);
        if (distance < minDistance) {
            closestColor = color;
            minDistance = distance;
        }
    }
    return closestColor.name;
}

// Agrega a cada post la lista de prendas detectadas (por YOLO) con su color y posición, consultando post_prendas
function addPrendasToPosts(posts, callback) {
    if (!posts || posts.length === 0) return callback(null, posts);
    const postIds = posts.map(p => p.id_post);
    const placeholders = postIds.map(() => '?').join(',');
    const queryPrendas = `SELECT * FROM post_prendas WHERE id_post IN (${placeholders})`; // Trae las prendas detectadas de los posts dados
    conn.query(queryPrendas, postIds, (err, prendasRows) => {
        if (err) return callback(err);
        const prendasPorPost = {};
        prendasRows.forEach(p => {
            if (!prendasPorPost[p.id_post]) prendasPorPost[p.id_post] = [];
            prendasPorPost[p.id_post].push({
                label: p.label,
                label_id: p.label_id,
                confidence: p.confidence,
                bbox: [p.bbox_x1, p.bbox_y1, p.bbox_x2, p.bbox_y2],
                colors: {
                    vibrant: [p.color_vibrant_r, p.color_vibrant_g, p.color_vibrant_b],
                    muted: [p.color_muted_r, p.color_muted_g, p.color_muted_b],
                    third: [p.color_third_r, p.color_third_g, p.color_third_b]
                },
                mask_b64: p.mask_b64
            });
        });
        const postsConPrendas = posts.map(post => ({
            ...post,
            prendas: prendasPorPost[post.id_post] || []
        }));
        callback(null, postsConPrendas);
    });
}

// ========== MAPEO DE CATEGORÍAS ========== (NUEVO)
// Relaciona cada categoría de prenda (top, bottom, shoes, accessory) con las etiquetas que devuelve el modelo YOLO
const CATEGORIA_LABELS = {
  top: ['shirt, blouse', 'top, t-shirt, sweatshirt', 'sweater', 'cardigan', 'jacket', 'vest'],
  bottom: ['pants', 'shorts', 'skirt'],
  shoes: ['shoe'],
  accessory: ['glasses', 'hat', 'tie', 'glove', 'watch', 'belt', 'bag, wallet', 'scarf']
};



// Crear el router
const router = express.Router();

// ========== RUTAS ==========

// Obtiene noticias de moda desde NewsAPI y devuelve título, descripción, link e imagen de cada artículo
router.get('/api-fashion-trends', async (req, res) => {
    try {
        const response = await axios.get(
            `https://newsapi.org/v2/everything?q=fashion AND moda&sortBy=popularity&language=es&apiKey=2f06a1e547694e35a997abd109e72272`
        );
        const articles = response.data.articles.map(article => ({
            title: article.title,
            description: article.description,
            link: article.url,
            image: article.urlToImage,
            source: article.source.name
        }));
        res.json(articles);
    } catch (error) {
        console.error('Error fetching data from NewsAPI:', error.message);
        res.status(500).json({ message: 'Error fetching data from NewsAPI' });
    }
});

// Crea un post general: sube la imagen, la analiza con el microservicio de IA (prendas y zonas de maquillaje)
// y guarda el post junto con las prendas y zonas detectadas en la base de datos
router.post('/agregarPost', upload.single('imagen'), async (req, res) => {
    const mediaPath = req.file;
    if (!mediaPath) {
        return res.json({ status: 0, mensaje: "No se proporcionó una imagen o video", datos: [] });
    }
    const path_value = mediaPath.filename;
    const { descripcion, autor, categoria } = req.body;
    const fileExtension = path.extname(path_value).toLowerCase();

    if (fileExtension === '.jpg' || fileExtension === '.jpeg' || fileExtension === '.png' || fileExtension === '.gif') {
        const fullPath = path.join(
            'C:\\Users\\danie\\OneDrive\\Escritorio\\Proyecto Privado\\GlamFinds\\src\\assets\\img',
            path_value
        );
        try {
            // ---------- 1. Llamar al microservicio ----------
            let garments = [];
            let makeupZones = [];
            let image_width = null;
            let image_height = null;
            let face_detected = false;
            let skin_ref_rgb = null;

            try {
                // Llama al microservicio de Python que detecta prendas y zonas de maquillaje en la imagen
                const aiResponse = await axios.post("http://127.0.0.1:8000/analyze-outfit", {
                    image_path: fullPath
                });
                garments = aiResponse.data.garments || [];
                makeupZones = aiResponse.data.makeup_zones || [];
                image_width = aiResponse.data.image_width || null;
                image_height = aiResponse.data.image_height || null;
                face_detected = aiResponse.data.face_detected || false;
                skin_ref_rgb = aiResponse.data.skin_reference_color || null; // [r,g,b] o null

                console.log(`Prendas: ${garments.length}, Zonas maquillaje: ${makeupZones.length}, dimensiones: ${image_width}x${image_height}`);
            } catch (error) {
                console.error("Error llamando al microservicio de análisis:", error.message);
                // Si falla, seguimos sin datos de análisis, pero el post se guarda igual
            }

            // ---------- 2. Insertar el post con dimensiones y datos de rostro ----------
            // Si skin_ref_rgb es un array, lo descomponemos; si no, null
            let skin_r = null, skin_g = null, skin_b = null;
            if (skin_ref_rgb && Array.isArray(skin_ref_rgb) && skin_ref_rgb.length === 3) {
                [skin_r, skin_g, skin_b] = skin_ref_rgb;
            }

            // Inserta el post con su imagen, dimensiones y datos de rostro/tono de piel detectados
            const insertQuery = `
                INSERT INTO posts_generales
                (descripcion, imagen, autor, categoria, image_width, image_height,
                 face_detected, skin_ref_r, skin_ref_g, skin_ref_b)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const insertValues = [
                descripcion, path_value, autor, categoria,
                image_width, image_height,
                face_detected ? 1 : 0,
                skin_r, skin_g, skin_b
            ];

            const insertResult = await new Promise((resolve, reject) => {
                conn.query(insertQuery, insertValues, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            const postId = insertResult.insertId;

            // ---------- 3. Insertar prendas ----------
            // Guarda cada prenda detectada (etiqueta, posición y colores) asociada al post recién creado
            for (const g of garments) {
                const [x1, y1, x2, y2] = g.bbox;
                const insertPrendaQuery = `
                    INSERT INTO post_prendas
                    (id_post, label, label_id, confidence, bbox_x1, bbox_y1, bbox_x2, bbox_y2,
                     color_vibrant_r, color_vibrant_g, color_vibrant_b,
                     color_muted_r, color_muted_g, color_muted_b,
                     color_third_r, color_third_g, color_third_b, mask_b64)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                const valuesPrenda = [
                    postId,
                    g.label,
                    g.label_id,
                    g.confidence,
                    x1, y1, x2, y2,
                    g.colors.vibrant[0], g.colors.vibrant[1], g.colors.vibrant[2],
                    g.colors.muted[0], g.colors.muted[1], g.colors.muted[2],
                    g.colors.third[0], g.colors.third[1], g.colors.third[2],
                    g.mask_b64 || null
                ];
                await new Promise((resolve, reject) => {
                    conn.query(insertPrendaQuery, valuesPrenda, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
            }

            // ---------- 4. Insertar zonas de maquillaje ----------
            // Guarda cada zona de maquillaje detectada (labios, ojos, etc.) con sus colores y producto sugerido
            for (const zone of makeupZones) {
                // Asegurar que los colores existan
                const vibrant = zone.colors?.vibrant || [0,0,0];
                const muted   = zone.colors?.muted   || [0,0,0];
                const third   = zone.colors?.third   || [0,0,0];

                const insertMakeupQuery = `
                    INSERT INTO post_makeup_zones
                    (id_post, zone, has_makeup, distance_to_skin, color_name, product_link,
                     vibrant_r, vibrant_g, vibrant_b,
                     muted_r, muted_g, muted_b,
                     third_r, third_g, third_b)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                const valuesMakeup = [
                    postId,
                    zone.zone,
                    zone.has_makeup ? 1 : 0,
                    zone.distance_to_skin,
                    zone.color_name || null,
                    zone.product_link || null,
                    vibrant[0], vibrant[1], vibrant[2],
                    muted[0], muted[1], muted[2],
                    third[0], third[1], third[2]
                ];
                await new Promise((resolve, reject) => {
                    conn.query(insertMakeupQuery, valuesMakeup, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
            }

            return res.json({
                status: 1,
                mensaje: "Publicación creada correctamente",
                datos: { 
                    postId, 
                    prendas_detectadas: garments.length,
                    zonas_maquillaje: makeupZones.length
                }
            });

        } catch (error) {
            console.error("Error general procesando imagen:", error);
            return res.status(500).json({
                status: 0,
                mensaje: "Error al procesar la imagen",
                datos: []
            });
        }
    } else if (fileExtension === '.mp4' || fileExtension === '.avi' || fileExtension === '.mov') {
        // (sin cambios para videos, se mantiene igual)
        // Si es un video, se guarda el post sin analizar prendas ni maquillaje
        const query = `INSERT INTO posts_generales (descripcion, imagen, autor, categoria) VALUES (?, ?, ?, ?)`;
        const values = [descripcion, path_value, autor, categoria];
        conn.query(query, values, (error, filas) => {
            if (error) {
                console.error(error);
                return res.json({ status: 0, mensaje: "Error al insertar el video en la BD", datos: [] });
            }
            return res.json({ status: 1, mensaje: "Video insertado con éxito", datos: filas });
        });
    } else {
        return res.json({ status: 0, mensaje: "Formato de archivo no soportado", datos: [] });
    }
});

// Obtener posts de categoría 1 (tendencias)
// Obtener posts con prendas y zonas de maquillaje
// Trae todos los posts generales (con su autor y categoría) junto con las prendas y el maquillaje detectados en cada uno
router.get('/obtener', (req, res) => {

    // Trae todos los posts con los datos del usuario autor y de la categoría
    const queryPosts = `
        SELECT
            p.id_post,
            p.descripcion,
            p.imagen,
            p.autor,
            p.categoria,
            p.image_width,
            p.image_height,
            p.face_detected,
            p.skin_ref_r,
            p.skin_ref_g,
            p.skin_ref_b,
            u.id_user,
            u.usuario,
            c.id_categoria,
            c.name_categoria
        FROM posts_generales p
        JOIN usuarios u ON p.autor = u.id_user
        JOIN categorias c ON p.categoria = c.id_categoria
        ORDER BY p.id_post DESC
    `;

    conn.query(queryPosts, (error, posts) => {

        if (error) {
            console.error('Error en query de posts:', error);
            return res.json({
                status: 0,
                mensaje: "Error en BD",
                datos: []
            });
        }

        // ==========================================
        // OBTENER PRENDAS
        // ==========================================
        // Trae y formatea las prendas detectadas (posición y colores) de un post específico
        const obtenerPrendas = (id_post) => {

            return new Promise((resolve, reject) => {

                const queryPrendas = `
                    SELECT
                        label,
                        label_id,
                        confidence,
                        bbox_x1,
                        bbox_y1,
                        bbox_x2,
                        bbox_y2,
                        color_vibrant_r,
                        color_vibrant_g,
                        color_vibrant_b,
                        color_muted_r,
                        color_muted_g,
                        color_muted_b,
                        color_third_r,
                        color_third_g,
                        color_third_b,
                        mask_b64
                    FROM post_prendas
                    WHERE id_post = ?
                `;

                conn.query(queryPrendas, [id_post], (err, filas) => {

                    if (err) {
                        reject(err);
                    } else {

                        const prendasFormateadas = filas.map(p => ({
                            label: p.label,
                            label_id: p.label_id,
                            confidence: p.confidence,

                            bbox: [
                                p.bbox_x1,
                                p.bbox_y1,
                                p.bbox_x2,
                                p.bbox_y2
                            ],

                            colors: {
                                vibrant: [
                                    p.color_vibrant_r,
                                    p.color_vibrant_g,
                                    p.color_vibrant_b
                                ],

                                muted: [
                                    p.color_muted_r,
                                    p.color_muted_g,
                                    p.color_muted_b
                                ],

                                third: [
                                    p.color_third_r,
                                    p.color_third_g,
                                    p.color_third_b
                                ]
                            },

                            mask_b64: p.mask_b64
                        }));

                        resolve(prendasFormateadas);
                    }
                });
            });
        };


        // ==========================================
        // OBTENER ZONAS DE MAQUILLAJE
        // ==========================================
        // Trae y formatea las zonas de maquillaje detectadas de un post específico
        const obtenerMaquillaje = (id_post) => {
            return new Promise((resolve, reject) => {
                const queryMakeup = `
                    SELECT
                        id,
                        zone,
                        has_makeup,
                        distance_to_skin,
                        color_name,
                        product_link,
                        vibrant_r, vibrant_g, vibrant_b,
                        muted_r, muted_g, muted_b,
                        third_r, third_g, third_b
                    FROM post_makeup_zones
                    WHERE id_post = ? ;
                `;

                conn.query(queryMakeup, [id_post], (err, filas) => {
                    if (err) {
                        console.error('❌ Error en query de maquillaje:', err);
                        reject(err);
                    } else {
                        console.log(`✅ Filas encontradas para post ${id_post}: ${filas.length}`); // <--- LOG
                        const maquillajeFormateado = filas.map(m => ({

                            id: m.id,

                            zone: m.zone,

                            has_makeup: Boolean(m.has_makeup),

                            distance_to_skin: m.distance_to_skin,

                            color_name: m.color_name,

                            product_link: m.product_link,

                            colors: {

                                vibrant: [
                                    m.vibrant_r,
                                    m.vibrant_g,
                                    m.vibrant_b
                                ],

                                muted: [
                                    m.muted_r,
                                    m.muted_g,
                                    m.muted_b
                                ],

                                third: [
                                    m.third_r,
                                    m.third_g,
                                    m.third_b
                                ]

                            }

                        }));
                        resolve(maquillajeFormateado);
                    }
                });
            });
        };

        // ==========================================
        // ARMAR TODOS LOS POSTS
        // ==========================================
        // Combina cada post con sus prendas y zonas de maquillaje antes de responder
        Promise.all(

            posts.map(async (post) => {

                const prendas = await obtenerPrendas(post.id_post);

                const maquillaje = await obtenerMaquillaje(post.id_post);

                return {

                    ...post,

                    // Información de rostro
                    face_detected: Boolean(post.face_detected),

                    skin_reference_color:
                        post.skin_ref_r !== null
                            ? [
                                post.skin_ref_r,
                                post.skin_ref_g,
                                post.skin_ref_b
                            ]
                            : null,

                    // Prendas detectadas
                    prendas: prendas,

                    // Maquillaje detectado
                    makeup_zones: maquillaje

                };

            })

        )

        .then(resultado => {

            res.json({
                status: 1,
                mensaje: "Info obtenida",
                datos: resultado
            });

        })

        .catch(err => {

            console.error('Error al obtener prendas o maquillaje:', err);

            res.json({
                status: 0,
                mensaje: "Error al cargar información",
                datos: []
            });

        });

    });

});

// Otras rutas de posts por categoría (mantengo las que estaban)
// Obtiene los posts generales de la categoría "Ropa" (id_categoria = 2)
router.get('/getRopa', (req, res) => {
    let obtener = 'Select p.id_post,p.descripcion,p.imagen,u.id_user,u.usuario,c.id_categoria,c.name_categoria, p.color_vibrant, p.color_muted, p.color_third , p.vibrant_class, p.muted_class, p.third_class,p.prenda1,p.prenda2,p.prenda3,p.prenda4,p.prenda5,p.prenda6,p.link1,p.link2, p.link3, p.link4, p.link5,p.link6  FROM  posts_generales p, usuarios u , categorias c where p.autor=u.id_user and p.categoria = c.id_categoria and id_categoria = 2 order by p.id_post ASC';
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de ropa obtenida con exito", datos: filas});
        }
    });
});
// Obtiene los posts generales de la categoría "Zapatos" (id_categoria = 5)
router.get('/getZapatos', (req, res) => {
    let obtener = 'Select p.id_post,p.descripcion,p.imagen,u.id_user,u.usuario,c.id_categoria,c.name_categoria, p.color_vibrant, p.color_muted, p.color_third , p.vibrant_class, p.muted_class, p.third_class,p.prenda1,p.prenda2,p.prenda3,p.prenda4,p.prenda5,p.prenda6,p.link1,p.link2, p.link3, p.link4, p.link5,p.link6 FROM  posts_generales p, usuarios u , categorias c where p.autor=u.id_user and p.categoria = c.id_categoria and id_categoria = 5 order by p.id_post ASC';
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de zapatos obtenida con exito", datos: filas});
        }
    });
});
// Obtiene los posts generales de la categoría "Maquillaje" (id_categoria = 3)
router.get('/getMaquillaje', (req, res) => {
    let obtener = 'Select p.id_post,p.descripcion,p.imagen,u.id_user,u.usuario,c.id_categoria,c.name_categoria, p.color_vibrant, p.color_muted, p.color_third , p.vibrant_class, p.muted_class, p.third_class,p.prenda1,p.prenda2,p.prenda3,p.prenda4,p.prenda5,p.prenda6,p.link1,p.link2, p.link3, p.link4, p.link5,p.link6 FROM  posts_generales p, usuarios u , categorias c where p.autor=u.id_user and p.categoria = c.id_categoria and id_categoria = 3 order by p.id_post ASC';
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de maquillaje obtenida con exito", datos: filas});
        }
    });
});
// Obtiene los posts generales de la categoría "Accesorios" (id_categoria = 4)
router.get('/getAccesorios', (req, res) => {
    let obtener = 'Select p.id_post,p.descripcion,p.imagen,u.id_user,u.usuario,c.id_categoria,c.name_categoria, p.color_vibrant, p.color_muted, p.color_third , p.vibrant_class, p.muted_class, p.third_class,p.prenda1,p.prenda2,p.prenda3,p.prenda4,p.prenda5,p.prenda6,p.link1,p.link2, p.link3, p.link4, p.link5,p.link6 FROM  posts_generales p, usuarios u , categorias c where p.autor=u.id_user and p.categoria = c.id_categoria and id_categoria = 4 order by p.id_post ASC';
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de accesorios obtenida con exito", datos: filas});
        }
    });
});

// Likes, comentarios, saves, etc. (mantengo tu código pero con router)
// Cuenta cuántos likes tiene un post general
router.get('/countLike:id', (req, res) => {
    const {id} = req.params;
    let obtener = 'SELECT count(*) as cantidad from likes_postG l ,posts_generales p where p.id_post = l.post and p.id_post =?'; // Cuenta los likes asociados al post
    conn.query(obtener,[id], (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de cantidad likes obtenida con exito", datos: filas});
        }
    });
});
// Registra un "me gusta" de un usuario sobre un post general
router.post('/likes', (req, res) => {
    let query = `insert into likes_postG(post,navegante) VALUES('${req.body.post}','${req.body.navegante}')`; // Inserta el like en la tabla likes_postG
    conn.query(query, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores para insertar en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Like insertado con éxito", datos: []});
        }
    });
});
// Guarda ("save") un post general para un usuario
router.post('/save', (req, res) => {
    let query = `insert into save_postG(post,navegante) VALUES('${req.body.post}','${req.body.navegante}')`; // Inserta el guardado en save_postG
    conn.query(query, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores para insertar en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Post guardada con éxito", datos: []});
        }
    });
});
// Obtiene los comentarios de un post general junto con el nombre del usuario que comentó
router.get('/getComentarios:id', (req, res) => {
    const {id} = req.params;
    let obtener = 'SELECT c.post,c.navegante ,u.usuario, c.comments, c.id_comment FROM  posts_generales p, usuarios u , comments_postG c where p.id_post = c.post and c.navegante = u.id_user and p.id_post =?'; // Trae los comentarios del post con el nombre de usuario
    conn.query(obtener,[id], (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de comentarios obtenida con exito", datos: filas});
        }
    });
});
// Agrega un comentario a un post general, primero pasándolo por un servicio de moderación de texto
router.post('/comments', async (req, res) => {
    const { post, navegante, comments } = req.body;
    try {
        // Verifica con el microservicio de IA si el comentario contiene contenido inapropiado
        const moderationResponse = await axios.post("http://127.0.0.1:8000/moderate", { text: comments });
        const moderation = moderationResponse.data;
        if (moderation.status === "error") {
            return res.json({ status: 0, mensaje: "Error en moderación", datos: [] });
        }
        if (moderation.status === "bloqueado") {
            return res.json({ status: 0, mensaje: "Comentario inapropiado detectado", datos: [] });
        }
        let query = `INSERT INTO comments_postG(post, navegante, comments) VALUES(?, ?, ?)`; // Inserta el comentario aprobado
        conn.query(query, [post, navegante, comments], (error, filas) => {
            if (error) {
                return res.json({ status: 0, mensaje: "Error al insertar en la BD", datos: [] });
            }
            res.json({ status: 1, mensaje: "Comentario insertado con éxito", datos: [] });
        });
    } catch (error) {
        console.error("ERROR:", error.message);
        res.json({ status: 0, mensaje: "No se pudo conectar con el servicio de moderación", datos: [] });
    }
});
// Elimina el like de un usuario sobre un post general
router.delete('/borrarLikes/:id/:id2', (req, res) => {
    let consulta = `DELETE FROM likes_postg WHERE post = ${req.params.id} and navegante = ${req.params.id2}`; // Borra el like de ese usuario en ese post
    conn.query(consulta, (err, filas) => {
        if (err) {
            res.json({status: 0, mensaje: "Error en la eliminacion", datos: []});
        } else {
            res.json({status: 1, mensaje: "Dato eliminado satisfactoriamente", datos:[]});
        }
    });
});
// Elimina el guardado ("save") de un usuario sobre un post general
router.delete('/borrarSaves/:id/:id2', (req, res) => {
    let consulta = `DELETE FROM save_postg WHERE post = ${req.params.id} and navegante = ${req.params.id2}`; // Borra el guardado de ese usuario en ese post
    conn.query(consulta, (err, filas) => {
        if (err) {
            res.json({status: 0, mensaje: "Error en la eliminacion", datos: []});
        } else {
            res.json({status: 1, mensaje: "Dato eliminado satisfactoriamente", datos:[]});
        }
    });
});
// Modifica un comentario existente de un post general
router.post('/updateCom/:id3', (req, res) => {
    let obtener =` update comments_postg set post ='${req.body.post}' ,navegante ='${req.body.navegante}' , comments = '${req.body.comments}' where id_comment = ${req.params.id3}; `; // Actualiza los datos del comentario indicado
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Comentario modificado con exito", datos: filas});
        }
    });
});
// Elimina un comentario específico de un post general
router.delete('/borrarComment/:id/:id2/:id3', (req, res) => {
    let consulta = `DELETE FROM comments_postg WHERE post = ${req.params.id} and navegante = ${req.params.id2} and id_comment = ${req.params.id3}`; // Borra el comentario indicado
    conn.query(consulta, (err, filas) => {
        if (err) {
            res.json({status: 0, mensaje: "Error en la eliminacion", datos: []});
        } else {
            res.json({status: 1, mensaje: "Dato eliminado satisfactoriamente", datos:[]});
        }
    });
});
// Obtiene un comentario específico de un post general
router.get('/getComment/:id/:id2/:id3', (req, res) => {
    let obtener = `SELECT id_comment, post,navegante,comments FROM  comments_postG  where post = ${req.params.id} and navegante = ${req.params.id2} and id_comment = ${req.params.id3}`; // Trae el comentario indicado
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de comentarios obtenida con exito", datos: filas});
        }
    });
});

// Rutas de publicidad, usuario, etc. (similares, adaptadas a router)
// Obtiene los posts de publicidad de la categoría "Descuentos" (id_categoria = 6)
router.get('/getDescuentos', (req, res) => {
    let obtener = 'SELECT p.id_post,p.descripcion,p.imagen,u.id_user,u.usuario,c.id_categoria,c.name_categoria,p.link FROM  posts_publicidad p, usuarios u , categorias c where p.autor=u.id_user and p.categoria = c.id_categoria and id_categoria = 6';
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de descuentos obtenida con exito", datos: filas});
        }
    });
});
// Obtiene los posts de publicidad de la categoría "Dups" (id_categoria = 7)
router.get('/getDups', (req, res) => {
    let obtener = 'SELECT p.id_post,p.descripcion,p.imagen,u.id_user,u.usuario,c.id_categoria,c.name_categoria,p.link FROM  posts_publicidad p, usuarios u , categorias c where p.autor=u.id_user and p.categoria = c.id_categoria and id_categoria = 7';
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de dups obtenida con exito", datos: filas});
        }
    });
});
// Crea un nuevo post de publicidad (con imagen y link) y lo guarda en la base de datos
router.post('/agregarPostP', upload.single('imagen'), (req, res) => {
    const imagePath = req.file;
    if (!imagePath) {
        return res.json({ status: 0, mensaje: "No se proporcionó una imagen", datos: [] });
    }
    const path_value = imagePath.filename;
    const { descripcion, autor,link, categoria } = req.body;
    const query = 'INSERT INTO posts_publicidad(descripcion, imagen, autor,link,categoria) VALUES (?, ?, ?, ?,?)'; // Inserta el post de publicidad
    const values = [descripcion, path_value, autor,link, categoria];
    conn.query(query, values, (error, filas) => {
        if (error) {
            console.error(error);
            res.json({ status: 0, mensaje: "Error al insertar en la BD", datos: [] });
        } else {
            res.json({ status: 1, mensaje: "Post insertado con éxito", datos: [] });
        }
    });
});
// Cuenta cuántos likes tiene un post de publicidad
router.get('/countLikeP:id', (req, res) => {
    let obtener = `SELECT count(*) as cantidads from likes_postp l , posts_publicidad p where p.id_post = l.post and p.id_post = ${req.params.id}`; // Cuenta los likes asociados al post
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de cantidad likes obtenida con exito", datos: filas});
        }
    });
});
// Obtiene los comentarios de un post de publicidad junto con el nombre del usuario que comentó
router.get('/getCommentsP:id', (req, res) => {
    const {id} = req.params;
    let obtener = 'SELECT c.post,c.navegante ,u.usuario, c.comments , c.id_comment FROM  posts_publicidad p, usuarios u , comments_postP c where p.id_post = c.post and c.navegante = u.id_user and p.id_post =?'; // Trae los comentarios del post con el nombre de usuario
    conn.query(obtener,[id], (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de comentarios obtenida con exito", datos: filas});
        }
    });
});
// Agrega un comentario a un post de publicidad
router.post('/commentsP', (req, res) => {
    let query = `insert into comments_postp(post,navegante,comments) VALUES('${req.body.post}','${req.body.navegante}','${req.body.comments}')`; // Inserta el comentario
    conn.query(query, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores para insertar en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Comentario insertado con éxito", datos: []});
        }
    });
});
// Registra un "me gusta" de un usuario sobre un post de publicidad
router.post('/likesP', (req, res) => {
    let query = `insert into likes_postp(post,navegante) VALUES('${req.body.post}','${req.body.navegante}')`; // Inserta el like
    conn.query(query, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores para insertar en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Like insertado con éxito", datos: []});
        }
    });
});
// Guarda ("save") un post de publicidad para un usuario
router.post('/saveP', (req, res) => {
    let query = `insert into save_postp(post,navegante) VALUES('${req.body.post}','${req.body.navegante}')`; // Inserta el guardado
    conn.query(query, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores para insertar en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Post guardada con éxito", datos: []});
        }
    });
});
// Elimina el like de un usuario sobre un post de publicidad
router.delete('/borrarLikesP/:id/:id2', (req, res) => {
    let consulta = `DELETE FROM likes_postp WHERE post = ${req.params.id} and navegante = ${req.params.id2}`; // Borra el like de ese usuario en ese post
    conn.query(consulta, (err, filas) => {
        if (err) {
            res.json({status: 0, mensaje: "Error en la eliminacion", datos: []});
        } else {
            res.json({status: 1, mensaje: "Dato eliminado satisfactoriamente", datos:[]});
        }
    });
});
// Elimina el guardado ("save") de un usuario sobre un post de publicidad
router.delete('/borrarSavesP/:id/:id2', (req, res) => {
    let consulta = `DELETE FROM save_postp WHERE post = ${req.params.id} and navegante = ${req.params.id2}`; // Borra el guardado de ese usuario en ese post
    conn.query(consulta, (err, filas) => {
        if (err) {
            res.json({status: 0, mensaje: "Error en la eliminacion", datos: []});
        } else {
            res.json({status: 1, mensaje: "Dato eliminado satisfactoriamente", datos:[]});
        }
    });
});
// Modifica un comentario existente de un post de publicidad
router.post('/updateComP/:id3', (req, res) => {
    let obtener =` update comments_postp set post ='${req.body.post}' ,navegante ='${req.body.navegante}' , comments = '${req.body.comments}' where id_comment = ${req.params.id3}; `; // Actualiza los datos del comentario indicado
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Comentario modificado con exito", datos: filas});
        }
    });
});
// Elimina un comentario específico de un post de publicidad
router.delete('/borrarCommentP/:id/:id2/:id3', (req, res) => {
    let consulta = `DELETE FROM comments_postp WHERE post = ${req.params.id} and navegante = ${req.params.id2} and id_comment = ${req.params.id3}`; // Borra el comentario indicado
    conn.query(consulta, (err, filas) => {
        if (err) {
            res.json({status: 0, mensaje: "Error en la eliminacion", datos: []});
        } else {
            res.json({status: 1, mensaje: "Dato eliminado satisfactoriamente", datos:[]});
        }
    });
});
// Obtiene un comentario específico de un post de publicidad
router.get('/getCommentP/:id/:id2/:id3', (req, res) => {
    let obtener = `SELECT id_comment, post,navegante,comments FROM  comments_postp  where post = ${req.params.id} and navegante = ${req.params.id2} and id_comment = ${req.params.id3}`; // Trae el comentario indicado
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de comentarios obtenida con exito", datos: filas});
        }
    });
});

// Usuario
// Obtiene los datos de un usuario por su id
router.get('/user:id', (req, res) => {
    const {id} = req.params;
    let query = 'SELECT * FROM usuarios where id_user = ?'; // Trae el usuario con ese id
    conn.query(query,[id], (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de user obtenida con exito", datos: filas});
        }
    });
});
// Registra un nuevo usuario (con foto de perfil) en la base de datos
router.post('/login', upload.single('imagen'), (req, res) => {
    const imagePath = req.file;
    if (!imagePath) {
        return res.json({ status: 0, mensaje: "No se proporcionó una imagen", datos: [] });
    }
    const path_value = imagePath.filename;
    const { usuario, nombre, apellido, edad, sexo, correo, contrase ,descripcion} = req.body;
    const query = `INSERT INTO usuarios (usuario, nombre, apellido, edad, sexo, correo, contrase, imagen,descripcion) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`; // Inserta el nuevo usuario
    const values = [usuario, nombre, apellido, edad, sexo, correo, contrase, path_value, descripcion];
    conn.query(query, values, (error, filas) => {
        if (error) {
            res.json({ status: 0, mensaje: "Error al insertar usuario en la BD", datos: [] });
        } else {
            res.json({ status: 1, mensaje: "Usuario insertado con éxito", datos: filas});
        }
    });
});
// Verifica las credenciales de login (usuario y contraseña)
router.post("/verificar", (req, res) => {
    let consulta = `SELECT id_user,usuario,contrase FROM usuarios WHERE usuario = ? AND contrase = ?`; // Busca un usuario que coincida con usuario y contraseña
    conn.query(consulta, [req.body.usuario, req.body.contrase], (error,filas) =>{
        if(error){
            res.status(500).json({status:0, mensaje: "Err Base de datos"});
        }else{
            if(filas.length > 0){
                res.json({status: 1, mensaje: "Usuario exitoso", datos: filas});
            }else{
                res.status(400).json({status: 0, mensaje: "No se encontro usuario que coinsida con la clave"})
            }  
        }
    });
});
// Obtiene todos los posts (generales y de publicidad) que un usuario guardó
router.get('/getsave:id', (req, res) => {
    // Une los posts generales guardados con los posts de publicidad guardados por el mismo usuario
    let obtener =` SELECT p.id_post, p.descripcion,u.usuario,u.imagen, p.imagen,c.name_categoria,s.navegante FROM save_postG s
                    INNER JOIN posts_generales p ON p.id_post = s.post
                    INNER JOIN usuarios u ON u.id_user = p.autor
                    INNER JOIN categorias c ON c.id_categoria = p.categoria 
                    WHERE s.navegante = ${req.params.id}
                    UNION ALL
                    SELECT pb.id_post,pb.descripcion,u2.usuario,u2.imagen,pb.imagen,c2.name_categoria,sp.navegante FROM save_postP sp
                    INNER JOIN posts_publicidad pb ON pb.id_post = sp.post
                    INNER JOIN usuarios u2 ON u2.id_user = pb.autor
                    INNER JOIN categorias c2 ON c2.id_categoria = pb.categoria 
                    WHERE sp.navegante = ${req.params.id}`;
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de ropa obtenida con exito", datos: filas});
        }
    });
});
// Obtiene el usuario, su imagen y su descripción de perfil
router.get('/getdescripcion:id', (req, res) => {
    let obtener =` select usuario, imagen, descripcion  from  usuarios inner join descripcion on id_user = usuarios where id_user =  ${req.params.id} `; // Trae usuario, imagen y descripción
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de ropa obtenida con exito", datos: filas});
        }
    });
});
// Obtiene todos los posts generales publicados por un usuario (para su perfil)
router.get('/PostPerfil:id', (req, res) => {
    const {id} = req.params;
    let obtener =`SELECT p.id_post,p.descripcion,p.imagen,u.id_user,u.usuario,c.id_categoria,c.name_categoria FROM  posts_generales p, usuarios u , categorias c where p.autor=u.id_user and p.categoria = c.id_categoria and  u.id_user=?` ; // Trae los posts de ese usuario
    conn.query(obtener,[id], (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de ropa obtenida con exito", datos: filas});
        }
    });
});
// Obtiene la descripción de perfil asociada a un usuario
router.get('/PostDes:id', (req, res) => {
    let obtener =` SELECT  u.usuarios,d.descripcion FROM descripcion d , usuarios u where  d.usuarios = u.id_user and d.usuarios  = ${req.params.id} ` ; // Trae la descripción de ese usuario
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de ropa obtenida con exito", datos: filas});
        }
    });
});
// Actualiza el perfil de un usuario (nombre de usuario, descripción y opcionalmente la imagen)
router.post('/update2/:id', upload.single('imagen'), (req, res) => {
    const { id } = req.params;
    const { usuario, descripcion } = req.body;
    let path_value = req.body.imagen;
    if (req.file) {
        const imagePath = req.file;
        path_value = imagePath.filename; // Si se subió una nueva imagen, se usa su nombre de archivo
    }
    const query = `UPDATE usuarios SET usuario = ?, descripcion = ?, imagen = ? WHERE id_user = ?`; // Actualiza los datos del perfil
    conn.query(query, [usuario, descripcion, path_value, id], (error, filas) => {
        if (error) {
            res.json({ status: 0, mensaje: 'Error al actualizar el perfil', datos: [] });
        } else {
            res.json({ status: 1, mensaje: 'Perfil actualizado con éxito', datos: filas });
        }
    });
});
// Elimina un post general por su id
router.delete('/borrarPosts/:id', (req, res) => {
    let consulta = `DELETE FROM posts_generales WHERE id_post = ${req.params.id}`; // Borra el post indicado
    conn.query(consulta, (err, filas) => {
        if (err) {
            res.json({status: 0, mensaje: "Error en la eliminacion", datos: []});
        } else {
            res.json({status: 1, mensaje: "Dato eliminado satisfactoriamente", datos:[]});
        }
    });
});
// Obtiene los datos de un post general para precargarlos en el formulario de edición
router.get('/modificar1/:id', (req, res) => {
    let obtener =` select descripcion, imagen,autor,categoria  from posts_generales where id_post = ${req.params.id} ` ; // Trae los datos actuales del post
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de ropa obtenida con exito", datos: filas});
        }
    });
});
// Actualiza la descripción, imagen y categoría de un post general
router.post('/update1/:id', (req, res) => {
    let obtener =` update posts_generales set descripcion = '${req.body.descripcion}', imagen  = '${req.body.imagen}' , categoria = '${req.body.categoria}' where id_post = ${req.params.id}; ` ; // Actualiza los datos del post
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de ropa obtenida con exito", datos: filas});
        }
    });
});
// Extrae la paleta de colores dominantes de una imagen dada su URL
router.post('/extract-colors', async (req, res) => {
    const imageUrl = req.body.imageUrl;
    try {
        const palette = await Vibrant.from(imageUrl).getPalette(); // Analiza la imagen y obtiene sus colores predominantes
        res.json(palette);
    } catch (error) {
        console.error('Error al obtener los colores:', error);
        res.status(500).json({ error: 'Error al obtener los colores' });
    }
});
// Filtra posts generales por color (coincidencia con el color vibrante o el color apagado)
router.get('/filtrar', (req, res) => {
    const colorSeleccionado = req.query.color;
    const query = 'SELECT * FROM post_generales WHERE color_vibrant = ? OR color_muted = ?'; // Busca posts con ese color
    conn.query(query, [colorSeleccionado, colorSeleccionado], (err, results) => {
        if (err) throw err;
        res.json(results); 
    });
});

// Rutas de looks aleatorios
// Trae una fila aleatoria de la tabla indicada (usado para armar un look al azar)
function obtenerPrendaAleatoria(tabla, callback) {
    const query = `SELECT * FROM ${tabla} ORDER BY RAND() LIMIT 1`; // Selecciona una fila al azar
    conn.query(query, (err, result) => {
        if (err) throw err;
        callback(result[0]);
    });
}
// Genera un look aleatorio femenino combinando una prenda al azar de cada categoría (top, pantalón, accesorio, zapato, chaqueta)
router.get('/generar-look', (req, res) => {
    let look = {};
    obtenerPrendaAleatoria('tops', (top) => {
        look.top = top;
        obtenerPrendaAleatoria('pantalones', (pantalon) => {
            look.pantalon = pantalon;
            obtenerPrendaAleatoria('accesorios', (accesorio) => {
                look.accesorio = accesorio;
                obtenerPrendaAleatoria('zapatos', (zapato) => {
                    look.zapato = zapato;
                    obtenerPrendaAleatoria('chaquetas', (chaqueta) => {
                        look.chaqueta = chaqueta;
                        res.json(look);
                    });
                });
            });
        });
    });
});
// Igual que obtenerPrendaAleatoria pero para las tablas de ropa masculina (sufijo H)
function obtenerPrendaAleatoriaM(tabla, callback) {
    const query = `SELECT * FROM ${tabla} ORDER BY RAND() LIMIT 1`; // Selecciona una fila al azar
    conn.query(query, (err, result) => {
        if (err) throw err;
        callback(result[0]);
    });
}
// Genera un look aleatorio masculino combinando una prenda al azar de cada categoría
router.get('/generar-lookM', (req, res) => {
    let looks = {};
    obtenerPrendaAleatoriaM('topsH', (topsH) => {
        looks.topM = topsH;
        obtenerPrendaAleatoriaM('pantalonesH', (pantalonH) => {
            looks.pantalonM = pantalonH;
            obtenerPrendaAleatoriaM('accesoriosH', (accesorioH) => {
                looks.accesorioM = accesorioH;
                obtenerPrendaAleatoriaM('zapatosH', (zapatoH) => {
                    looks.zapatoM = zapatoH;
                    obtenerPrendaAleatoriaM('chaquetasH', (chaquetaH) => {
                        looks.chaquetaM = chaquetaH;
                        res.json(looks);
                    });
                });
            });
        });
    });
});
// Obtiene las imágenes de todos los posts generales
router.get('/obtenerprenda', (req, res) => {
    let obtener = 'SELECT imagen FROM  posts_generales'; // Trae solo la columna imagen de cada post
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de tendencias obtenida con exito", datos: filas});
        }
    });
});
// Obtiene las URLs de imagen de todas las prendas registradas
router.get('/prendas', (req, res) => {
    let obtener =  'SELECT url_imagen FROM  prendas'; // Trae solo la columna url_imagen de cada prenda
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de tendencias obtenida con exito", datos: filas});
        }
    });
});

// Artículos
// Crea un nuevo artículo (título, contenido, autor y categoría) en la base de datos
router.post('/agregarART', upload.single('imagen'), async (req, res) => {
    const {titulo,contenido, autor, categoria} = req.body;
    const query = `INSERT INTO posts_articulos (titulo,contenido,imagen,autor,categoria) VALUES (?,?,?,?,?)`; // Inserta el nuevo artículo
    const values = [titulo,contenido,"", autor, categoria];
    conn.query(query, values, (error, filas) => {
        if (error) {
            console.error(error);
            return res.json({ status: 0, mensaje: "Error al insertar en la BD", datos: [] });
        } else {
            return res.json({ status: 1, mensaje: "Artiulo ingresado con exito", datos: filas });
        }
    });
});
// Obtiene todos los artículos junto con su autor y categoría
router.get('/obtenerART', (req, res) => {
    let obtener = 'SELECT p.id_post,p.titulo,p.contenido,p.imagen,u.id_user,u.usuario,c.id_categoria,c.name_categoria FROM  posts_articulos p, usuarios u , categorias c where p.autor=u.id_user and p.categoria = c.id_categoria order by p.id_post ASC'; // Trae todos los artículos ordenados
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de tendencias obtenida con exito", datos: filas});
        }
    });
});
// Obtiene los comentarios de un artículo junto con el nombre del usuario que comentó
router.get('/getComentariosART/:id', (req, res) => {
    const {id} = req.params;
    let obtener = 'SELECT c.navegante ,u.usuario, c.comments, c.id_comment FROM  posts_articulos p, usuarios u , comments_articulos c where p.id_post = c.post and c.navegante = u.id_user and p.id_post = ?'; // Trae los comentarios del artículo
    conn.query(obtener,[id], (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de comentarios obtenida", datos: filas});
        }
    });
});
// Cuenta cuántos likes tiene un artículo
router.get('/countLikeART/:id', (req, res) => {
    const {id} = req.params;
    let obtener = 'SELECT count(*) as cantidad from likes_articulos l ,posts_articulos p where p.id_post = l.post and p.id_post =?'; // Cuenta los likes asociados al artículo
    conn.query(obtener,[id], (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de cantidad likes obtenida con exito", datos: filas});
        }
    });
});
// Registra un "me gusta" de un usuario sobre un artículo
router.post('/likesART', (req, res) => {
    let query = `insert into likes_articulos(post,navegante) VALUES('${req.body.post}','${req.body.navegante}')`; // Inserta el like
    conn.query(query, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores para insertar en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Like insertado con éxito", datos: []});
        }
    });
});
// Guarda ("save") un artículo para un usuario
router.post('/saveART', (req, res) => {
    let query = `insert into save_articulos(post,navegante) VALUES('${req.body.post}','${req.body.navegante}')`; // Inserta el guardado
    conn.query(query, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores para insertar en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Post guardada con éxito", datos: []});
        }
    });
});
// Agrega un comentario a un artículo, filtrando primero groserías/lenguaje inapropiado
router.post('/commentsART', (req, res) => {
    const { post, navegante} = req.body;
    if (filter.isProfane(req.body.comments)) {
        return res.json({status: 0, mensaje: "Comentario inapropiado detectado.", datos: []});
    }else{
        let query = `INSERT INTO comments_articulos(post, navegante, comments) VALUES(?, ?, ?)`; // Inserta el comentario aprobado
        conn.query(query, [post, navegante, req.body.comments], (error,filas) =>{
            if(error){
                res.json({status: 0, mensaje: "No hay valores para insertar en la BD", datos: []});
            }else{
                res.json({status: 1, mensaje: "Comentario insertado con éxito", datos: []});
            }
        });
    }   
});
// Elimina el like de un usuario sobre un artículo
router.delete('/borrarLikesART/:id/:id2', (req, res) => {
    let consulta = `DELETE FROM likes_articulos WHERE post = ${req.params.id} and navegante = ${req.params.id2}`; // Borra el like de ese usuario en ese artículo
    conn.query(consulta, (err, filas) => {
        if (err) {
            res.json({status: 0, mensaje: "Error en la eliminacion", datos: []});
        } else {
            res.json({status: 1, mensaje: "Dato eliminado satisfactoriamente", datos:[]});
        }
    });
});
// Elimina el guardado ("save") de un usuario sobre un artículo
router.delete('/borrarSavesART/:id/:id2', (req, res) => {
    let consulta = `DELETE FROM save_articulos WHERE post = ${req.params.id} and navegante = ${req.params.id2}`; // Borra el guardado de ese usuario en ese artículo
    conn.query(consulta, (err, filas) => {
        if (err) {
            res.json({status: 0, mensaje: "Error en la eliminacion", datos: []});
        } else {
            res.json({status: 1, mensaje: "Dato eliminado satisfactoriamente", datos:[]});
        }
    });
});
// Modifica un comentario existente de un artículo
router.post('/updateComART/:id3', (req, res) => {
    let obtener =` update comments_articulos set post ='${req.body.post}' ,navegante ='${req.body.navegante}' , comments = '${req.body.comments}' where id_comment = ${req.params.id3}; ` ; // Actualiza los datos del comentario indicado
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Comentario modificado con exito", datos: filas});
        }
    });
});
// Elimina un comentario específico de un artículo
router.delete('/borrarCommentART/:id/:id2/:id3', (req, res) => {
    let consulta = `DELETE FROM comments_articulos WHERE post = ${req.params.id} and navegante = ${req.params.id2} and id_comment = ${req.params.id3}`; // Borra el comentario indicado
    conn.query(consulta, (err, filas) => {
        if (err) {
            res.json({status: 0, mensaje: "Error en la eliminacion", datos: []});
        } else {
            res.json({status: 1, mensaje: "Dato eliminado satisfactoriamente", datos:[]});
        }
    });
});
// Obtiene un comentario específico de un artículo
router.get('/getCommentART/:id/:id2/:id3', (req, res) => {
    let obtener = `SELECT id_comment, post,navegante,comments FROM  comments_articulos  where post = ${req.params.id} and navegante = ${req.params.id2} and id_comment = ${req.params.id3}`; // Trae el comentario indicado
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de comentarios obtenida con exito", datos: filas});
        }
    });
});
// Obtiene todos los artículos que un usuario guardó
router.get('/getsaveA/:id', (req, res) => {
    // Trae los artículos guardados por ese usuario junto con autor y categoría
    let obtener =`SELECT p.id_post,p.titulo, p.contenido, u.usuario,p.imagen, c.name_categoria, s.navegante AS usuario_logueado
                    FROM save_articulos s
                    INNER JOIN posts_articulos p ON p.id_post = s.post
                    INNER JOIN usuarios u ON u.id_user = p.autor
                    INNER JOIN categorias c ON c.id_categoria = p.categoria
                    WHERE s.navegante = ${req.params.id};`;
    conn.query(obtener, (error,filas) =>{
        if(error){
            res.json({status: 0, mensaje: "No hay valores en la BD", datos: []});
        }else{
            res.json({status: 1, mensaje: "Info de ropa obtenida con exito", datos: filas});
        }
    });
});

//----------------------------FOLLOWS PARA EL PERFIL DE LA PERSONA----------------------------

// Nuevas rutas de follows y feeds
// Registra que un usuario (follower_id) empieza a seguir a otro (following_id)
router.post("/follow", (req, res) => {
    const { follower_id, following_id } = req.body;
    const sql = `INSERT INTO followers (follower_id, followed_id) VALUES (?, ?)`; // Inserta la relación de seguimiento
    conn.query(sql, [follower_id, following_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error following user" });
        }
        res.json({ message: "User followed successfully" });
    });
});
// Elimina la relación de seguimiento entre dos usuarios
router.post("/unfollow", (req, res) => {
    const { follower_id, following_id } = req.body;
    const sql = `DELETE FROM followers WHERE follower_id = ? AND followed_id = ?`; // Borra el seguimiento
    conn.query(sql, [follower_id, following_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error unfollowing user" });
        }
        res.json({ message: "User unfollowed" });
    });
});
// Obtiene la lista de usuarios que siguen a un usuario dado
router.get("/followers/:id", (req, res) => {
    const userId = req.params.id;
    const sql = `SELECT u.id_user, u.usuario, u.nombre FROM followers f JOIN usuarios u ON f.follower_id = u.id_user WHERE f.followed_id = ?`; // Trae los seguidores de ese usuario
    conn.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});
// Obtiene la lista de usuarios a los que sigue un usuario dado
router.get("/following/:id", (req, res) => {
    const userId = req.params.id;
    const sql = `SELECT u.id_user, u.usuario, u.nombre FROM followers f JOIN usuarios u ON f.followed_id = u.id_user WHERE f.follower_id = ?`; // Trae a quienes sigue ese usuario
    conn.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// Obtener estadísticas de un usuario (seguidores, seguidos, publicaciones)
router.get("/user-stats/:id", (req, res) => {
    const userId = req.params.id;
    const sqlFollowers = `SELECT COUNT(*) AS count FROM followers WHERE followed_id = ?`; // Cuenta cuántos seguidores tiene
    const sqlFollowing = `SELECT COUNT(*) AS count FROM followers WHERE follower_id = ?`; // Cuenta a cuántos sigue
    const sqlPosts = `SELECT COUNT(*) AS count FROM posts_generales WHERE autor = ?`; // Cuenta cuántos posts ha publicado

    conn.query(sqlFollowers, [userId], (err, followersRes) => {
        if (err) return res.status(500).json({ error: err.message });
        conn.query(sqlFollowing, [userId], (err, followingRes) => {
            if (err) return res.status(500).json({ error: err.message });
            conn.query(sqlPosts, [userId], (err, postsRes) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({
                    followers: followersRes[0].count,
                    following: followingRes[0].count,
                    posts: postsRes[0].count
                });
            });
        });
    });
});

//----------------------------FEEDS PARA EL PERFIL DE LA PERSONA----------------------------

// Feed de tendencias (basado en popularidad)
// Obtiene los 20 posts más "en tendencia": calcula un puntaje según likes/comentarios recientes y qué tan nuevo es el post
router.get('/trending', (req, res) => {
    console.log('Endpoint /feed/trending llamado');
    // Calcula un trending_score por post (likes + comentarios*2, dividido por horas desde la publicación)
    const query = `
        SELECT
            p.id_post,
            p.descripcion,
            p.imagen,
            p.autor,
            p.categoria,
            p.image_width,
            p.image_height,
            u.id_user,
            u.usuario,
            c.id_categoria,
            c.name_categoria,
            COUNT(DISTINCT l.id_like) AS likes_count,
            COUNT(DISTINCT com.id_comment) AS comments_count,
            (
                (COUNT(DISTINCT l.id_like) + COUNT(DISTINCT com.id_comment) * 2) /
                (TIMESTAMPDIFF(HOUR, p.fecha_publicacion, NOW()) + 1)
            ) AS trending_score
        FROM posts_generales p
        JOIN usuarios u ON p.autor = u.id_user
        JOIN categorias c ON p.categoria = c.id_categoria
        LEFT JOIN likes_postG l ON p.id_post = l.post
        LEFT JOIN comments_postG com ON p.id_post = com.post
        WHERE TIMESTAMPDIFF(DAY, p.fecha_publicacion, NOW()) <= 180
        GROUP BY
            p.id_post,
            u.usuario,
            u.imagen,
            c.name_categoria
        ORDER BY trending_score DESC
        LIMIT 20;
    `;
    conn.query(query, (error, posts) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return res.json({ status: 0, mensaje: "Error en la consulta", datos: [] });
        }
        console.log('Posts obtenidos:', posts.length);
        // Agrega a cada post en tendencia sus prendas detectadas antes de responder
        addPrendasToPosts(posts, (err, postsConPrendas) => {
            if (err) {
                console.error('Error en addPrendasToPosts:', err);
                return res.json({ status: 0, mensaje: "Error al cargar prendas", datos: [] });
            }
            console.log('Posts con prendas:', postsConPrendas.length);
            res.json({ status: 1, mensaje: "Tendencias obtenidas", datos: postsConPrendas });
        });
    });
});

// Feed de siguiendo
// Obtiene los posts de los usuarios que sigue el usuario dado, más recientes primero
router.get('/feed/:id', (req, res) => {
    const { id } = req.params;
    let obtener = `
        SELECT
            p.id_post,
            p.descripcion,
            p.imagen,
            p.autor,
            p.categoria,
            p.image_width,
            p.image_height,
            u.id_user,
            u.usuario,
            c.id_categoria,
            c.name_categoria
        FROM posts_generales p
        JOIN usuarios u ON p.autor = u.id_user
        JOIN categorias c ON p.categoria = c.id_categoria
        JOIN followers f ON p.autor = f.followed_id
        WHERE f.follower_id = ?
        ORDER BY p.id_post DESC
    `;
    conn.query(obtener, [id], (error, posts) => {
        if (error) {
            res.json({ status: 0, mensaje: "Error al obtener feed", datos: [] });
        } else {
            // Agrega a cada post del feed sus prendas detectadas antes de responder
            addPrendasToPosts(posts, (err, postsConPrendas) => {
                if (err) {
                    console.error('Error al añadir prendas:', err);
                    return res.json({ status: 0, mensaje: "Error al cargar prendas", datos: [] });
                }
                res.json({ status: 1, mensaje: "Feed obtenido correctamente", datos: postsConPrendas });
            });
        }
    });
});


// Feed de para ti

// Actualizar preferencias del usuario
// Cuando un usuario interactúa con un post, suma puntaje a las prendas (labels) de ese post en sus preferencias
router.post('/actualizarPreferencias', (req, res) => {
    const { id_user, id_post } = req.body;
    const obtenerPrendas = `
        SELECT label
        FROM post_prendas
        WHERE id_post = ?
    `; // Obtiene las etiquetas de las prendas del post
    conn.query(obtenerPrendas, [id_post], (error, prendas) => {
        if (error) {
            return res.json({status: 0, mensaje: "Error al obtener prendas" });
        }
        if (prendas.length === 0) {
            return res.json({
                status: 1,
                mensaje: "No hay prendas para este post"
            });
        }

        let pendientes = prendas.length;

        prendas.forEach(prenda => {

            // Inserta la preferencia con score 1, o si ya existe, le suma 1 al score actual
            const insertar = `
                INSERT INTO user_preferred_labels
                    (id_user, label, score)
                VALUES
                    (?, ?, 1)
                ON DUPLICATE KEY UPDATE
                    score = score + 1
            `;

            conn.query(insertar, [id_user, prenda.label], (err) => {

                if (err) {
                    console.error(err);
                }

                pendientes--;

                if (pendientes === 0) {
                    res.json({
                        status: 1,
                        mensaje: "Preferencias actualizadas"
                    });
                }

            });

        });

    });

});

// Feed Para Ti
// Obtiene posts recomendados según las prendas que el usuario prefiere (basado en su historial de interacciones)
router.get('/parati/:id', (req, res) => {

    const { id } = req.params;

    // Suma la relevancia (score) de las prendas del post que coinciden con las preferencias del usuario
    let obtener = `
        SELECT
            p.id_post,
            p.descripcion,
            p.imagen,
            p.autor,
            p.categoria,
            p.image_width,
            p.image_height,
            u.id_user,
            u.usuario,
            c.id_categoria,
            c.name_categoria,
            SUM(upl.score) AS relevancia

        FROM posts_generales p

        JOIN usuarios u
            ON p.autor = u.id_user

        JOIN categorias c
            ON p.categoria = c.id_categoria

        JOIN post_prendas pp
            ON p.id_post = pp.id_post

        JOIN user_preferred_labels upl
            ON pp.label = upl.label

        WHERE upl.id_user = ?

        GROUP BY p.id_post

        ORDER BY relevancia DESC,
                 p.id_post DESC;
    `;

    conn.query(obtener, [id], (error, posts) => {

        if (error) {
            return res.json({
                status: 0,
                mensaje: "Error al obtener recomendaciones",
                datos: []
            });
        }

        // Agrega a cada post recomendado sus prendas detectadas antes de responder
        addPrendasToPosts(posts, (err, postsConPrendas) => {

            if (err) {
                return res.json({
                    status: 0,
                    mensaje: "Error",
                    datos: []
                });
            }

            res.json({
                status: 1,
                mensaje: "OK",
                datos: postsConPrendas
            });

        });

    });

});
    //-------Categorías para los posts -------
    // Obtener todas las categorías
router.get('/categorias', (req, res) => {
        const sql = 'SELECT id_categoria, name_categoria FROM categorias ORDER BY id_categoria'; // Trae todas las categorías ordenadas
        conn.query(sql, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: 0, mensaje: "Error al obtener categorías" });
            }
            res.json({ status: 1, mensaje: "Categorías obtenidas", datos: results });
        });
});

// outfit del dia con ia

// Genera un outfit sugerido con IA (Gemini) según ocasión, clima y colores, y le busca una foto a cada prenda en Pexels
router.post('/outfit-ia/generar', async (req, res) => {
  const { ocasion, clima, colores } = req.body;

  if (!ocasion || !clima) {
    return res.json({ status: 0, mensaje: 'Ocasión y clima son obligatorios', datos: [] });
  }

  try {
    const outfitIA = await generarOutfitIA(ocasion, clima, colores); // Genera la descripción del outfit con IA

    // Busca en paralelo una foto de stock para cada prenda del outfit generado
    const [imagenTop, imagenBottom, imagenShoes, imagenAccessory] = await Promise.all([
    buscarImagenPexels(outfitIA.top_query),
    buscarImagenPexels(outfitIA.bottom_query),
    buscarImagenPexels(outfitIA.shoes_query),
    buscarImagenPexels(outfitIA.accessory_query)
    ]);

    const resultado = {
      top: { descripcion: outfitIA.top, imagen: imagenTop },
      bottom: { descripcion: outfitIA.bottom, imagen: imagenBottom },
      shoes: { descripcion: outfitIA.shoes, imagen: imagenShoes },
      accessory: { descripcion: outfitIA.accessory, imagen: imagenAccessory },
      reason: outfitIA.reason
    };

    res.json({ status: 1, mensaje: 'Outfit generado con éxito', datos: resultado });
  } catch (error) {
    console.error('Error al generar outfit con IA:', error.response?.data || error.message);
    res.json({ status: 0, mensaje: 'Error al generar el outfit con IA', datos: [] });
  }
});

// Guarda un outfit generado por la IA para que el usuario lo consulte después
router.post('/outfit-ia/guardar', (req, res) => {
  const { id_usuario, json_generado } = req.body;

  if (!id_usuario || !json_generado) {
    return res.json({ status: 0, mensaje: 'Faltan datos para guardar el outfit', datos: [] });
  }

  const jsonTexto = JSON.stringify(json_generado);
  const query = 'INSERT INTO outfits_guardados (id_usuario, json_generado) VALUES (?, ?)'; // Inserta el outfit como JSON

  conn.query(query, [id_usuario, jsonTexto], (err, resultado) => {
    if (err) {
      console.error('Error al guardar outfit:', err);
      return res.json({ status: 0, mensaje: 'Error al guardar el outfit', datos: [] });
    }
    res.json({ status: 1, mensaje: 'Outfit guardado con éxito', datos: { id_outfit: resultado.insertId } });
  });
});

// Devuelve los outfits guardados de un usuario
router.get('/outfit-ia/guardados/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;
  const query = 'SELECT id_outfit, id_usuario, fecha, json_generado FROM outfits_guardados WHERE id_usuario = ? ORDER BY fecha DESC'; // Trae los outfits guardados por ese usuario, más recientes primero

  conn.query(query, [id_usuario], (err, filas) => {
    if (err) {
      console.error('Error al obtener outfits guardados:', err);
      return res.json({ status: 0, mensaje: 'Error al obtener los outfits guardados', datos: [] });
    }
    res.json({ status: 1, mensaje: 'Outfits obtenidos con éxito', datos: filas });
  });
});

// Elimina un outfit guardado
router.delete('/outfit-ia/eliminar/:id_outfit', (req, res) => {
  const { id_outfit } = req.params;
  const query = 'DELETE FROM outfits_guardados WHERE id_outfit = ?'; // Borra el outfit guardado indicado

  conn.query(query, [id_outfit], (err) => {
    if (err) {
      console.error('Error al eliminar outfit guardado:', err);
      return res.json({ status: 0, mensaje: 'Error al eliminar el outfit', datos: [] });
    }
    res.json({ status: 1, mensaje: 'Outfit eliminado con éxito', datos: [] });
  });
});



module.exports = router;