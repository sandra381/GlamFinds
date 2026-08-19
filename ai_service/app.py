# Microservicio de IA (FastAPI) que analiza imágenes de outfits: detecta prendas, joyería/accesorios
# y maquillaje, usando varios modelos de IA en conjunto (Segformer, OwlViT y MediaPipe).
from fastapi import FastAPI, HTTPException
from transformers import SegformerImageProcessor, AutoModelForSemanticSegmentation  # Modelo de segmentación de prendas
from transformers import OwlViTProcessor, OwlViTForObjectDetection  # Modelo de detección de joyería/accesorios por texto
from PIL import Image
import torch
import torch.nn as nn
import numpy as np
import cv2
from sklearn.cluster import KMeans  # Agrupa píxeles para hallar los colores dominantes de una prenda/zona
import io
import base64
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from skimage import color  # Conversión RGB <-> LAB, usado para medir diferencia de color de forma perceptual
import math
from urllib.parse import quote
from typing import Optional   # si no lo tienes ya


app = FastAPI()

# ========== CARGA DE MEDIAPIPE CON MÚLTIPLES FALLBACKS ==========
# MediaPipe se usa solo para detectar el rostro y sus puntos clave (landmarks), necesarios
# para el análisis de maquillaje. Se intenta importar de 3 formas distintas porque según la
# versión instalada el paquete expone sus módulos de manera diferente.
MEDIAPIPE_AVAILABLE = False
mp_face_mesh = None

# Intento 1: importación estándar
try:
    import mediapipe as mp
    if hasattr(mp, 'solutions') and hasattr(mp.solutions, 'face_mesh'):
        mp_face_mesh = mp.solutions.face_mesh
        MEDIAPIPE_AVAILABLE = True
        print("✅ MediaPipe cargado (método 1: 'import mediapipe as mp')")
except (ImportError, AttributeError) as e:
    print(f"⚠️ Intento 1 falló: {e}")

# Si falló, intento 2: importar directamente desde el submódulo
if not MEDIAPIPE_AVAILABLE:
    try:
        import mediapipe.python.solutions as mp_solutions
        mp_face_mesh = mp_solutions.face_mesh
        MEDIAPIPE_AVAILABLE = True
        print("✅ MediaPipe cargado (método 2: 'import mediapipe.python.solutions')")
    except (ImportError, AttributeError) as e:
        print(f"⚠️ Intento 2 falló: {e}")

# Si aún falla, intento 3
if not MEDIAPIPE_AVAILABLE:
    try:
        from mediapipe.python.solutions import face_mesh as mp_face_mesh
        MEDIAPIPE_AVAILABLE = True
        print("✅ MediaPipe cargado (método 3: 'from mediapipe.python.solutions import face_mesh')")
    except (ImportError, AttributeError) as e:
        print(f"⚠️ Intento 3 falló: {e}")

if not MEDIAPIPE_AVAILABLE:
    print("⚠️ MediaPipe no está disponible. El endpoint /detect-makeup no funcionará.")
    print("   Instala MediaPipe con: pip install mediapipe")
else:
    try:
        # Detector de rostro: se configura para imágenes estáticas y un único rostro por foto
        face_mesh = mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            min_detection_confidence=0.5
        )
        print("✅ FaceMesh inicializado correctamente")
    except Exception as e:
        print(f"⚠️ Error al inicializar FaceMesh: {e}")
        MEDIAPIPE_AVAILABLE = False

# ========== MODELOS ==========
# Usa GPU (cuda) si está disponible, si no cae a CPU
device = 'cuda' if torch.cuda.is_available() else 'cpu'
seg_model_name = "sayeed99/segformer-b3-fashion"

# Modelo Segformer (Hugging Face): segmenta la imagen y clasifica cada píxel como una prenda
# (camisa, pantalón, zapato, etc.), usado por los endpoints de segmentación/análisis de outfit
print(f"Cargando modelo de segmentación {seg_model_name}...")
seg_processor = SegformerImageProcessor.from_pretrained(seg_model_name)
seg_model = AutoModelForSemanticSegmentation.from_pretrained(seg_model_name).to(device)
seg_model.eval()
print("✅ Modelo de segmentación cargado")

owlvit_model_name = "google/owlvit-base-patch32"

# Modelo OwlViT (Hugging Face): detección de objetos guiada por texto, usado para localizar
# joyería y accesorios (aretes, collares, anillos, etc.) a partir de la lista JEWELRY_LABELS
print(f"Cargando modelo de joyería/accesorios {owlvit_model_name}...")
owlvit_processor = OwlViTProcessor.from_pretrained(owlvit_model_name)
owlvit_model = OwlViTForObjectDetection.from_pretrained(owlvit_model_name).to(device)
owlvit_model.eval()
print("✅ Modelo de accesorios cargado")

# Etiquetas de texto que se le pasan a OwlViT para que busque estos tipos de joyería/accesorios
JEWELRY_LABELS = [
    "earring", "earrings",
    "necklace", "pendant",
    "ring", "rings",
    "bracelet", "bracelets",
    "anklet",
    "watch",
    "brooch",
    "hair clip", "hairpin", "barrette", "bobby pin", "hair comb",
    "headband", "hair accessory", "hair tie", "scrunchie"
]

# Mapea el id de clase que devuelve Segformer al nombre de la prenda correspondiente
GARMENT_CATEGORIES = {
    1: "shirt, blouse",
    2: "top, t-shirt, sweatshirt",
    3: "sweater",
    4: "cardigan",
    5: "jacket",
    6: "vest",
    7: "pants",
    8: "shorts",
    9: "skirt",
    10: "coat",
    11: "dress",
    12: "jumpsuit",
    13: "cape",
    14: "glasses",
    15: "hat",
    16: "headband, head covering, hair accessory",
    17: "tie",
    18: "glove",
    19: "watch",
    20: "belt",
    21: "leg warmer",
    22: "tights, stockings",
    23: "sock",
    24: "shoe",
    25: "bag, wallet",
    26: "scarf",
    27: "umbrella",
}

# Colores de referencia (nombre -> RGB) usados para nombrar el color detectado de maquillaje
# (se compara por distancia LAB contra estos valores, ver color_mas_cercano)
COLOR_NAMES_RGB = {
    "red": [200, 30, 30],
    "coral": [255, 111, 97],
    "berry": [140, 20, 60],
    "burgundy": [128, 0, 32],
    "nude": [200, 150, 120],
    "brown": [101, 67, 33],
    "pink": [255, 182, 193],
    "hot pink": [255, 20, 147],
    "gold": [212, 175, 55],
    "bronze": [140, 100, 60],
    "green": [60, 130, 60],
    "olive green": [128, 128, 0],
    "purple": [128, 0, 128],
    "orange": [255, 140, 0],
    "peach": [255, 218, 185],
    "beige": [222, 202, 176],
}

# Qué tipo de producto corresponde a cada zona del rostro
ZONE_TO_PRODUCT = {
    "lips": "lipstick",
    "left_eye": "eyeshadow",
    "right_eye": "eyeshadow",
    "left_cheek": "blush",
    "right_cheek": "blush"
}

# ========== ESQUEMAS (request/response) ==========
# Estas clases definen la forma de las respuestas JSON que devuelve cada endpoint

# Una prenda detectada por el modelo de segmentación (Segformer)
class SegmentedGarment(BaseModel):
    label: str
    label_id: int
    confidence: float
    bbox: List[int]
    colors: Dict[str, List[int]]
    mask_b64: Optional[str] = None

class SegmentationResponse(BaseModel):
    garments: List[SegmentedGarment]
    image_width: int
    image_height: int

# Un accesorio/joya detectado por OwlViT
class JewelryItem(BaseModel):
    label: str
    confidence: float
    bbox: List[int]
    colors: Dict[str, List[int]]

class JewelryResponse(BaseModel):
    jewelry: List[JewelryItem]
    image_width: int
    image_height: int

# Resultado del análisis de maquillaje para una zona del rostro (labios, ojos, mejillas)
class MakeupZone(BaseModel):
    zone: str
    colors: Dict[str, List[int]]
    has_makeup: bool
    distance_to_skin: float
    color_name: Optional[str] = None
    product_link: Optional[str] = None

class MakeupResponse(BaseModel):
    zones: List[MakeupZone]
    skin_reference_color: List[int]
    image_width: int
    image_height: int

# Respuesta combinada del análisis completo del outfit: prendas + joyería + maquillaje
class OutfitAnalysisResponse(BaseModel):
    garments: List[SegmentedGarment]
    jewelry: List[JewelryItem]
    makeup_zones: List[MakeupZone]
    face_detected: bool
    skin_reference_color: Optional[List[int]] = None
    image_width: int
    image_height: int

# Distancia mínima de color (LAB) respecto a la piel para considerar que hay maquillaje en la zona
MAKEUP_THRESHOLDS = {
    "lips": 18.0,
    "left_eye": 15.0,
    "right_eye": 15.0,
    "left_cheek": 10.0,
    "right_cheek": 10.0
}
# ========== FUNCIONES AUXILIARES ==========
# Calcula los k colores dominantes de un recorte de imagen agrupando píxeles con KMeans en
# espacio de color LAB (más fiel a cómo el ojo humano percibe diferencias de color que RGB).
# Entrada: array de imagen (BGR u otro) y k = cantidad de colores a extraer.
# Salida: lista de hasta k colores en RGB, ordenados del cluster más grande al más chico.
def get_dominant_colors_from_array(img_array, k=3):
    if img_array.shape[2] == 3:
        img_rgb = cv2.cvtColor(img_array, cv2.COLOR_BGR2RGB)
    else:
        img_rgb = img_array

    img_lab = color.rgb2lab(img_rgb)
    mask = ~np.all(img_rgb == [0, 0, 0], axis=2)
    pixels_lab = img_lab[mask]

    if len(pixels_lab) < 3:
        return [[0,0,0], [0,0,0], [0,0,0]]

    kmeans = KMeans(n_clusters=min(k, len(pixels_lab)), n_init=10, random_state=42)
    kmeans.fit(pixels_lab)
    centers_lab = kmeans.cluster_centers_

    colors_rgb = []
    for center in centers_lab:
        rgb = color.lab2rgb([[center]])[0, 0]
        rgb_255 = (rgb * 255).astype(int)
        colors_rgb.append(rgb_255.tolist())

    while len(colors_rgb) < 3:
        colors_rgb.append([0,0,0])

    return colors_rgb[:3]

# Separa el objeto (ej. una joya) del fondo dentro de un recorte usando umbral de Otsu (OpenCV),
# para que get_dominant_colors_from_array no mezcle el color del fondo con el del objeto.
# Entrada: recorte de imagen en BGR. Salida: máscara binaria y la imagen recortada solo con el objeto.
def isolate_foreground_otsu(crop_bgr):
    if crop_bgr.shape[0] < 10 or crop_bgr.shape[1] < 10:
        mask = np.ones(crop_bgr.shape[:2], dtype=np.uint8) * 255
        return mask, crop_bgr.copy()

    gray = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    white_ratio = np.sum(thresh == 255) / thresh.size
    if white_ratio < 0.5:
        mask = cv2.bitwise_not(thresh)
    else:
        mask = thresh

    masked_crop = cv2.bitwise_and(crop_bgr, crop_bgr, mask=mask)
    return mask, masked_crop

# === Funciones para MediaPipe (solo si está disponible) ===
if MEDIAPIPE_AVAILABLE:
    LIPS_INDICES = sorted(set(i for par in mp_face_mesh.FACEMESH_LIPS for i in par))
    LEFT_EYE_INDICES = [33, 133, 157, 158, 159, 160, 161, 173]
    RIGHT_EYE_INDICES = [362, 398, 384, 385, 386, 387, 388, 466]
    LEFT_CHEEK_INDICES = [117, 118, 119, 120, 227, 234]
    RIGHT_CHEEK_INDICES = [347, 348, 349, 350, 447, 454]
    SKIN_REF_INDICES = [10, 67, 104, 151, 332]

    # Convierte los landmarks de MediaPipe (coordenadas 0-1 normalizadas) a coordenadas de píxel
    # reales según el tamaño de la imagen, para los índices de puntos indicados
    def get_landmark_points(landmarks, indices, img_shape):
        h, w = img_shape[:2]
        points = []
        for idx in indices:
            landmark = landmarks.landmark[idx]
            x = int(landmark.x * w)
            y = int(landmark.y * h)
            points.append((x, y))
        return points

    # A partir de un conjunto de puntos (ej. contorno de labios u ojos) arma la región de interés
    # (ROI): calcula el polígono convexo que los envuelve y recorta esa zona de la imagen original.
    # Entrada: imagen BGR y lista de puntos. Salida: máscara y recorte de esa zona del rostro.
    def get_roi_mask_and_crop(img_bgr, points):
        h, w = img_bgr.shape[:2]
        mask = np.zeros((h, w), dtype=np.uint8)
        if len(points) < 3:
            return mask, np.zeros_like(img_bgr)
        pts = np.array(points, dtype=np.int32)
        hull = cv2.convexHull(pts)
        cv2.fillConvexPoly(mask, hull, 255)
        x, y, w_box, h_box = cv2.boundingRect(hull)
        cropped = img_bgr[y:y+h_box, x:x+w_box]
        mask_cropped = mask[y:y+h_box, x:x+w_box]
        masked_cropped = cv2.bitwise_and(cropped, cropped, mask=mask_cropped)
        return mask_cropped, masked_cropped

    # Distancia euclidiana entre dos colores en espacio LAB: mide qué tan diferentes se ven a
    # simple vista dos colores RGB. Se usa para saber si una zona del rostro tiene maquillaje
    # (color distinto al de la piel) y para identificar el color de maquillaje más parecido.
    def compute_lab_distance(color1_rgb, color2_rgb):
        lab1 = color.rgb2lab(np.array(color1_rgb).reshape(1,1,3)/255.0).flatten()
        lab2 = color.rgb2lab(np.array(color2_rgb).reshape(1,1,3)/255.0).flatten()
        return math.sqrt(np.sum((lab1 - lab2)**2))

    # Busca en COLOR_NAMES_RGB el nombre de color más parecido (menor distancia LAB) a un RGB dado
    def color_mas_cercano(rgb):
        mejor_nombre = None
        menor_distancia = float("inf")
        for nombre, ref_rgb in COLOR_NAMES_RGB.items():
            dist = compute_lab_distance(rgb, ref_rgb)
            if dist < menor_distancia:
                menor_distancia = dist
                mejor_nombre = nombre
        return mejor_nombre


    # Arma un link de búsqueda en Sephora para el producto de maquillaje y color detectados
    def generar_link_producto(producto, nombre_color):
        query = quote(f"{nombre_color} {producto}")
        return f"https://www.sephora.com/search?keyword={query}"

# ========== ENDPOINTS ==========

# Detecta y recorta cada prenda visible en una foto de outfit.
# Modelo de IA: Segformer ("sayeed99/segformer-b3-fashion"), segmentación semántica por píxel.
# Entrada (body JSON): {"image_path": ruta local de la imagen a analizar}.
# Salida: lista de prendas encontradas, cada una con su categoría, nivel de confianza, la caja
# (bbox) que la delimita, sus colores dominantes y la máscara de segmentación en base64.
@app.post("/segment-outfit", response_model=SegmentationResponse)
async def segment_outfit(request: dict):
    # (código existente, sin cambios)
    image_path = request.get("image_path")
    if not image_path:
        raise HTTPException(status_code=400, detail="Se requiere 'image_path'")

    try:
        image = Image.open(image_path).convert("RGB")
        img_width, img_height = image.size

        # Pasa la imagen por Segformer: devuelve un "logit" (puntaje) por clase de prenda para cada píxel
        inputs = seg_processor(images=image, return_tensors="pt").to(device)
        with torch.no_grad():
            outputs = seg_model(**inputs)
            logits = outputs.logits

        # Reescala los logits al tamaño original de la imagen (el modelo trabaja en baja resolución)
        upsampled_logits = nn.functional.interpolate(
            logits,
            size=(img_height, img_width),
            mode="bilinear",
            align_corners=False
        )

        # probs: confianza por clase en cada píxel; pred_seg: clase ganadora (id de prenda) por píxel
        probs = nn.functional.softmax(upsampled_logits, dim=1)[0].cpu().numpy()
        pred_seg = upsampled_logits.argmax(dim=1)[0].cpu().numpy()

        img_array = np.array(image)
        img_array_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)

        garments = []
        total_pixels = img_height * img_width
        MIN_AREA_RATIO = 0.0005  # Ignora clases que ocupan una porción insignificante de la imagen (ruido)

        for label_id, label_name in GARMENT_CATEGORIES.items():
            mask = (pred_seg == label_id).astype(np.uint8) * 255
            area_ratio = np.sum(mask > 0) / total_pixels

            if area_ratio < MIN_AREA_RATIO:
                continue

            # Calcula el rectángulo (bbox) que contiene toda la prenda, con un margen de 10px
            coords = np.argwhere(mask)
            y_min, x_min = coords.min(axis=0)
            y_max, x_max = coords.max(axis=0)

            x_min = max(0, x_min - 10)
            y_min = max(0, y_min - 10)
            x_max = min(img_width, x_max + 10)
            y_max = min(img_height, y_max + 10)

            # Recorta solo los píxeles de esta prenda (el resto queda en negro) para analizar su color
            masked_img = np.zeros_like(img_array_bgr)
            masked_img[mask > 0] = img_array_bgr[mask > 0]
            cropped = masked_img[y_min:y_max, x_min:x_max]

            class_probs = probs[label_id][mask > 0]
            confidence = float(np.mean(class_probs)) if len(class_probs) > 0 else 0.0

            colors = get_dominant_colors_from_array(cropped)

            # Codifica la máscara de la prenda como imagen PNG en base64 (para pintarla en el frontend)
            mask_pil = Image.fromarray(mask)
            mask_buffer = io.BytesIO()
            mask_pil.save(mask_buffer, format="PNG")
            mask_b64 = base64.b64encode(mask_buffer.getvalue()).decode("utf-8")

            garments.append(SegmentedGarment(
                label=label_name,
                label_id=label_id,
                confidence=confidence,
                bbox=[int(x_min), int(y_min), int(x_max), int(y_max)],
                colors={
                    "vibrant": colors[0],
                    "muted": colors[1],
                    "third": colors[2]
                },
                mask_b64=mask_b64
            ))

        garments.sort(key=lambda x: x.confidence, reverse=True)  # Prendas más seguras primero
        return SegmentationResponse(garments=garments, image_width=img_width, image_height=img_height)

    except FileNotFoundError:
        raise HTTPException(status_code=400, detail="No se encontró la imagen")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Detecta joyería y accesorios (aretes, collares, anillos, relojes, etc.) en una foto.
# Modelo de IA: OwlViT ("google/owlvit-base-patch32"), detección de objetos guiada por texto
# (busca en la imagen cada una de las etiquetas de JEWELRY_LABELS).
# Entrada (body JSON): {"image_path": ruta local de la imagen a analizar}.
# Salida: lista de accesorios detectados con su etiqueta, confianza, bbox y colores dominantes.
@app.post("/detect-jewelry", response_model=JewelryResponse)
async def detect_jewelry(request: dict):
    # (código existente, sin cambios)
    image_path = request.get("image_path")
    if not image_path:
        raise HTTPException(status_code=400, detail="Se requiere 'image_path'")

    CONFIDENCE_THRESHOLD = 0.05

    try:
        image = Image.open(image_path).convert("RGB")
        img_width, img_height = image.size

        # Le pide a OwlViT que busque en la imagen cada una de las etiquetas de JEWELRY_LABELS
        inputs = owlvit_processor(text=[JEWELRY_LABELS], images=image, return_tensors="pt").to(device)

        with torch.no_grad():
            outputs = owlvit_model(**inputs)

        target_sizes = torch.tensor([[img_height, img_width]])
        # Convierte la salida cruda del modelo en cajas (bbox), puntajes y etiquetas de texto,
        # descartando detecciones por debajo de CONFIDENCE_THRESHOLD
        results = owlvit_processor.post_process_grounded_object_detection(
            outputs=outputs,
            threshold=CONFIDENCE_THRESHOLD,
            target_sizes=target_sizes,
            text_labels=[JEWELRY_LABELS]
        )[0]

        img_array = np.array(image)
        img_array_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)

        jewelry_items = []
        for box, score, text_label in zip(results["boxes"], results["scores"], results["text_labels"]):
            x_min, y_min, x_max, y_max = [int(v) for v in box.tolist()]
            x_min = max(0, x_min)
            y_min = max(0, y_min)
            x_max = min(img_width, x_max)
            y_max = min(img_height, y_max)

            cropped_bgr = img_array_bgr[y_min:y_max, x_min:x_max]
            if cropped_bgr.size == 0:
                continue

            # Aísla la joya del fondo antes de sacar su color, para que no se mezcle con la piel/ropa
            _, cropped_foreground = isolate_foreground_otsu(cropped_bgr)
            colors = get_dominant_colors_from_array(cropped_foreground)

            jewelry_items.append(JewelryItem(
                label=text_label,
                confidence=float(score),
                bbox=[x_min, y_min, x_max, y_max],
                colors={
                    "vibrant": colors[0],
                    "muted": colors[1],
                    "third": colors[2]
                }
            ))

        jewelry_items.sort(key=lambda x: x.confidence, reverse=True)
        return JewelryResponse(jewelry=jewelry_items, image_width=img_width, image_height=img_height)

    except FileNotFoundError:
        raise HTTPException(status_code=400, detail="No se encontró la imagen")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Detecta si hay maquillaje aplicado en distintas zonas del rostro (labios, ojos, mejillas) y,
# si lo hay, estima el color usado y sugiere un producto similar.
# Modelo de IA: MediaPipe FaceMesh, ubica los puntos (landmarks) del rostro; la detección de
# maquillaje en sí se hace comparando colores (distancia LAB) contra el tono de piel de referencia.
# Entrada (body JSON): {"image_path": ruta local de la imagen a analizar}.
# Salida: color de piel de referencia y, por cada zona, sus colores dominantes, si tiene
# maquillaje, la distancia de color respecto a la piel y (si aplica) nombre de color + link de producto.
@app.post("/detect-makeup", response_model=MakeupResponse)
async def detect_makeup(request: dict):
    if not MEDIAPIPE_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="MediaPipe no está disponible. Instálalo con 'pip install mediapipe' y reinicia el servidor."
        )

    image_path = request.get("image_path")
    if not image_path:
        raise HTTPException(status_code=400, detail="Se requiere 'image_path'")

    try:
        img_bgr = cv2.imread(image_path)
        if img_bgr is None:
            raise HTTPException(status_code=400, detail="No se pudo leer la imagen")

        h, w = img_bgr.shape[:2]
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

        results = face_mesh.process(img_rgb)
        if not results.multi_face_landmarks:
            raise HTTPException(status_code=400, detail="No se detectó ningún rostro")

        landmarks = results.multi_face_landmarks[0]

        # Toma el color de una zona de piel sin maquillaje (frente/mejillas) como referencia
        skin_points = get_landmark_points(landmarks, SKIN_REF_INDICES, img_bgr.shape)
        _, skin_cropped = get_roi_mask_and_crop(img_bgr, skin_points)
        skin_colors = get_dominant_colors_from_array(skin_cropped)
        skin_ref_rgb = skin_colors[0]

        zones_config = {
            "lips": LIPS_INDICES,
            "left_eye": LEFT_EYE_INDICES,
            "right_eye": RIGHT_EYE_INDICES,
            "left_cheek": LEFT_CHEEK_INDICES,
            "right_cheek": RIGHT_CHEEK_INDICES
        }

        makeup_zones = []
        # Por cada zona del rostro, compara su color contra el de la piel de referencia:
        # si la diferencia (distancia LAB) supera el umbral de esa zona, se considera que tiene maquillaje
        for zone_name, indices in zones_config.items():
            points = get_landmark_points(landmarks, indices, img_bgr.shape)
            _, masked_crop = get_roi_mask_and_crop(img_bgr, points)
            if masked_crop.size == 0 or np.sum(masked_crop) == 0:
                continue
            colors = get_dominant_colors_from_array(masked_crop)
            zone_color_rgb = colors[0]
            dist = compute_lab_distance(skin_ref_rgb, zone_color_rgb)
            umbral = MAKEUP_THRESHOLDS.get(zone_name, 20.0)
            has_makeup = dist > umbral

            umbral = MAKEUP_THRESHOLDS.get(zone_name, 20.0)
            has_makeup = dist > umbral

            color_name = None
            product_link = None
            if has_makeup:
                color_name = color_mas_cercano(zone_color_rgb)
                producto = ZONE_TO_PRODUCT.get(zone_name, "makeup")
                product_link = generar_link_producto(producto, color_name)

            makeup_zones.append(MakeupZone(
                zone=zone_name,
                colors={
                    "vibrant": colors[0],
                    "muted": colors[1],
                    "third": colors[2]
                },
                has_makeup=has_makeup,
                distance_to_skin=round(dist, 2),
                color_name=color_name,
                product_link=product_link
            ))

        return MakeupResponse(
            zones=makeup_zones,
            skin_reference_color=skin_ref_rgb,
            image_width=w,
            image_height=h
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Genera una imagen de depuración/visualización con la segmentación de prendas superpuesta
# en color sobre la foto original (útil para verificar visualmente qué detectó el modelo).
# Modelo de IA: Segformer ("sayeed99/segformer-b3-fashion"), el mismo de /segment-outfit.
# Entrada (body JSON): {"image_path": ruta local de la imagen a analizar}.
# Salida: {"segmentation_overlay": imagen PNG en base64 con la segmentación pintada encima}.
@app.post("/visualize-segmentation")
async def visualize_segmentation(request: dict):
    image_path = request.get("image_path")
    if not image_path:
        raise HTTPException(status_code=400, detail="Se requiere 'image_path'")
    try:
        image = Image.open(image_path).convert("RGB")
        inputs = seg_processor(images=image, return_tensors="pt").to(device)
        with torch.no_grad():
            outputs = seg_model(**inputs)
            logits = outputs.logits

        upsampled_logits = nn.functional.interpolate(
            logits,
            size=image.size[::-1],
            mode="bilinear",
            align_corners=False
        )
        pred_seg = upsampled_logits.argmax(dim=1)[0].cpu().numpy()

        # Asigna un color aleatorio (pero fijo por clase, gracias a la seed) a cada categoría detectada
        overlay = np.zeros((*pred_seg.shape, 3), dtype=np.uint8)
        unique_labels = np.unique(pred_seg)
        for label in unique_labels:
            if label == 0:
                continue
            np.random.seed(label)
            color = np.random.randint(0, 255, 3).tolist()
            overlay[pred_seg == label] = color

        img_array = np.array(image)
        blended = cv2.addWeighted(img_array, 0.5, overlay, 0.5, 0)

        blended_pil = Image.fromarray(blended)
        buffer = io.BytesIO()
        blended_pil.save(buffer, format="PNG")
        img_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        return {"segmentation_overlay": img_b64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class InputText(BaseModel):
    text: str

# Endpoint principal: hace el análisis completo de una foto de outfit en un solo llamado,
# combinando los tres modelos de IA usados por los demás endpoints (evita 3 llamadas separadas).
# Modelos de IA: Segformer (prendas), OwlViT (joyería/accesorios) y MediaPipe FaceMesh (rostro/maquillaje).
# Entrada (body JSON): {"image_path": ruta local de la imagen a analizar}.
# Salida: prendas detectadas, joyería/accesorios detectados, zonas de maquillaje analizadas,
# si se detectó rostro y el color de piel de referencia (si lo hay).
@app.post("/analyze-outfit", response_model=OutfitAnalysisResponse)
async def analyze_outfit(request: dict):
    """
    Analiza una imagen completa:
    - Prendas
    - Joyería/accesorios
    - Maquillaje
    - Rostro
    - Color de referencia de piel
    """

    image_path = request.get("image_path")

    if not image_path:
        raise HTTPException(
            status_code=400,
            detail="Se requiere 'image_path'"
        )

    try:
        # ============================================================
        # 1. CARGAR IMAGEN
        # ============================================================

        image = Image.open(image_path).convert("RGB")

        img_width, img_height = image.size

        img_array = np.array(image)

        img_array_bgr = cv2.cvtColor(
            img_array,
            cv2.COLOR_RGB2BGR
        )

        # ============================================================
        # 2. SEGMENTACIÓN DE PRENDAS (modelo: Segformer, ver /segment-outfit)
        # ============================================================

        garments = []

        inputs = seg_processor(
            images=image,
            return_tensors="pt"
        ).to(device)

        with torch.no_grad():
            outputs = seg_model(**inputs)
            logits = outputs.logits

        upsampled_logits = nn.functional.interpolate(
            logits,
            size=(img_height, img_width),
            mode="bilinear",
            align_corners=False
        )

        probs = (
            nn.functional.softmax(
                upsampled_logits,
                dim=1
            )[0]
            .cpu()
            .numpy()
        )

        pred_seg = (
            upsampled_logits
            .argmax(dim=1)[0]
            .cpu()
            .numpy()
        )

        total_pixels = img_height * img_width

        MIN_AREA_RATIO = 0.0005

        for label_id, label_name in GARMENT_CATEGORIES.items():

            mask = (
                pred_seg == label_id
            ).astype(np.uint8) * 255

            area_ratio = (
                np.sum(mask > 0) /
                total_pixels
            )

            if area_ratio < MIN_AREA_RATIO:
                continue

            coords = np.argwhere(mask)

            if coords.size == 0:
                continue

            y_min, x_min = coords.min(axis=0)
            y_max, x_max = coords.max(axis=0)

            x_min = max(0, x_min - 10)
            y_min = max(0, y_min - 10)

            x_max = min(img_width, x_max + 10)
            y_max = min(img_height, y_max + 10)

            masked_img = np.zeros_like(
                img_array_bgr
            )

            masked_img[mask > 0] = (
                img_array_bgr[mask > 0]
            )

            cropped = masked_img[
                y_min:y_max,
                x_min:x_max
            ]

            class_probs = probs[label_id][mask > 0]

            confidence = (
                float(np.mean(class_probs))
                if len(class_probs) > 0
                else 0.0
            )

            colors = get_dominant_colors_from_array(
                cropped
            )

            # Crear máscara Base64
            mask_pil = Image.fromarray(mask)

            mask_buffer = io.BytesIO()

            mask_pil.save(
                mask_buffer,
                format="PNG"
            )

            mask_b64 = base64.b64encode(
                mask_buffer.getvalue()
            ).decode("utf-8")

            garments.append(
                SegmentedGarment(
                    label=label_name,
                    label_id=label_id,
                    confidence=confidence,
                    bbox=[
                        int(x_min),
                        int(y_min),
                        int(x_max),
                        int(y_max)
                    ],
                    colors={
                        "vibrant": colors[0],
                        "muted": colors[1],
                        "third": colors[2]
                    },
                    mask_b64=mask_b64
                )
            )

        garments.sort(
            key=lambda x: x.confidence,
            reverse=True
        )

        # ============================================================
        # 3. DETECCIÓN DE JOYERÍA (modelo: OwlViT, ver /detect-jewelry)
        # ============================================================

        jewelry_items = []

        CONFIDENCE_THRESHOLD = 0.05

        inputs_owl = owlvit_processor(
            text=[JEWELRY_LABELS],
            images=image,
            return_tensors="pt"
        ).to(device)

        with torch.no_grad():
            outputs_owl = owlvit_model(
                **inputs_owl
            )

        target_sizes = torch.tensor([
            [img_height, img_width]
        ])

        results_owl = (
            owlvit_processor
            .post_process_grounded_object_detection(
                outputs=outputs_owl,
                threshold=CONFIDENCE_THRESHOLD,
                target_sizes=target_sizes,
                text_labels=[JEWELRY_LABELS]
            )[0]
        )

        for box, score, text_label in zip(
            results_owl["boxes"],
            results_owl["scores"],
            results_owl["text_labels"]
        ):

            x_min, y_min, x_max, y_max = [
                int(v)
                for v in box.tolist()
            ]

            x_min = max(0, x_min)
            y_min = max(0, y_min)

            x_max = min(img_width, x_max)
            y_max = min(img_height, y_max)

            cropped_bgr = img_array_bgr[
                y_min:y_max,
                x_min:x_max
            ]

            if cropped_bgr.size == 0:
                continue

            _, cropped_foreground = (
                isolate_foreground_otsu(
                    cropped_bgr
                )
            )

            colors = get_dominant_colors_from_array(
                cropped_foreground
            )

            jewelry_items.append(
                JewelryItem(
                    label=text_label,
                    confidence=float(score),
                    bbox=[
                        x_min,
                        y_min,
                        x_max,
                        y_max
                    ],
                    colors={
                        "vibrant": colors[0],
                        "muted": colors[1],
                        "third": colors[2]
                    }
                )
            )

        jewelry_items.sort(
            key=lambda x: x.confidence,
            reverse=True
        )

        # ============================================================
        # 4. DETECCIÓN DE MAQUILLAJE (modelo: MediaPipe FaceMesh, ver /detect-makeup)
        # ============================================================

        makeup_zones = []

        face_detected = False

        skin_ref_rgb = None

        if MEDIAPIPE_AVAILABLE:

            try:

                # IMPORTANTE:
                # img_array está en RGB
                results_face = face_mesh.process(
                    img_array
                )

                if results_face.multi_face_landmarks:

                    face_detected = True

                    landmarks = (
                        results_face
                        .multi_face_landmarks[0]
                    )

                    # --------------------------------------------
                    # Color de referencia de piel
                    # --------------------------------------------

                    skin_points = get_landmark_points(
                        landmarks,
                        SKIN_REF_INDICES,
                        img_array_bgr.shape
                    )

                    _, skin_cropped = (
                        get_roi_mask_and_crop(
                            img_array_bgr,
                            skin_points
                        )
                    )

                    skin_colors = (
                        get_dominant_colors_from_array(
                            skin_cropped
                        )
                    )

                    skin_ref_rgb = skin_colors[0]

                    # --------------------------------------------
                    # Zonas del rostro
                    # --------------------------------------------

                    zones_config = {

                        "lips":
                            LIPS_INDICES,

                        "left_eye":
                            LEFT_EYE_INDICES,

                        "right_eye":
                            RIGHT_EYE_INDICES,

                        "left_cheek":
                            LEFT_CHEEK_INDICES,

                        "right_cheek":
                            RIGHT_CHEEK_INDICES

                    }

                    for zone_name, indices in (
                        zones_config.items()
                    ):

                        points = get_landmark_points(
                            landmarks,
                            indices,
                            img_array_bgr.shape
                        )

                        _, masked_crop = (
                            get_roi_mask_and_crop(
                                img_array_bgr,
                                points
                            )
                        )

                        if (
                            masked_crop.size == 0
                            or np.sum(masked_crop) == 0
                        ):
                            continue

                        # Obtener colores de ESTA zona
                        colors_zone = (
                            get_dominant_colors_from_array(
                                masked_crop
                            )
                        )

                        zone_color_rgb = (
                            colors_zone[0]
                        )

                        # ----------------------------------------
                        # Distancia respecto a la piel
                        # ----------------------------------------

                        dist = compute_lab_distance(
                            skin_ref_rgb,
                            zone_color_rgb
                        )

                        umbral = MAKEUP_THRESHOLDS.get(
                            zone_name,
                            20.0
                        )

                        has_makeup = (
                            dist > umbral
                        )

                        # ----------------------------------------
                        # Color y producto
                        # ----------------------------------------

                        color_name = None

                        product_link = None

                        if has_makeup:

                            color_name = color_mas_cercano(
                                zone_color_rgb
                            )

                            producto = (
                                ZONE_TO_PRODUCT.get(
                                    zone_name,
                                    "makeup"
                                )
                            )

                            product_link = (
                                generar_link_producto(
                                    producto,
                                    color_name
                                )
                            )

                        makeup_zones.append(
                            MakeupZone(
                                zone=zone_name,

                                colors={
                                    "vibrant":
                                        colors_zone[0],

                                    "muted":
                                        colors_zone[1],

                                    "third":
                                        colors_zone[2]
                                },

                                has_makeup=has_makeup,

                                distance_to_skin=round(
                                    dist,
                                    2
                                ),

                                color_name=color_name,

                                product_link=product_link
                            )
                        )

            except Exception as e:

                print(
                    "⚠️ Error analizando maquillaje:",
                    e
                )

                face_detected = False

                makeup_zones = []

                skin_ref_rgb = None

        # ============================================================
        # 5. RESPUESTA FINAL
        # ============================================================

        print(
            f"✅ ANÁLISIS COMPLETO: "
            f"{len(garments)} prendas | "
            f"{len(jewelry_items)} accesorios | "
            f"{len(makeup_zones)} zonas maquillaje | "
            f"rostro={face_detected}"
        )

        return OutfitAnalysisResponse(

            garments=garments,

            jewelry=jewelry_items,

            makeup_zones=makeup_zones,

            face_detected=face_detected,

            skin_reference_color=skin_ref_rgb,

            image_width=img_width,

            image_height=img_height
        )

    except FileNotFoundError:

        raise HTTPException(
            status_code=400,
            detail="No se encontró la imagen"
        )

    except Exception as e:

        print(
            "❌ Error general en analyze-outfit:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
# @app.post("/moderate")
# def moderate(input: InputText):
#     result = moderate_text(input.text)
#     if result["status"] == "error":
#         raise HTTPException(500, detail=result.get("message", "Error desconocido"))
#     return result