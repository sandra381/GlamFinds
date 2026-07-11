
import sys
import os
sys.path.append(r'C:\Users\danie\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages')

from ultralytics import YOLO

model = YOLO('yolov8x.pt')

def detect_objects(image_path):
    if not os.path.exists(image_path):
        print("La imagen no se encuentra en la ruta especificada.")
        return []

    results = model(image_path)
    detections = []
    for r in results:
        for obj in r.boxes.data.tolist():
            x1, y1, x2, y2, conf, cls = obj
            detections.append({
                "class": model.names[int(cls)],  
                "confidence": float(conf),      
                "bbox": [x1, y1, x2, y2]        
            })
    return detections
if __name__ == "__main__":
    image_path = "C:\\Users\\danie\\OneDrive\\Escritorio\\Tareas\\Semestre 8\\SP2\\Proyecto\\Codigo Fuente\\conexionbase-proyecto\\conexionbase-proyecto\\uploads\\1726848333009.jpeg"  # Reemplaza con la ruta de tu imagen
    detections = detect_objects(image_path)
    if not detections:
        print("No se detectaron objetos en la imagen.")
    else:
        for det in detections:
            print(f"Prenda: {det['class']}, Confianza: {det['confidence']:.2f}, Caja: {det['bbox']}")
