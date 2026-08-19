// Script de prueba: verifica que OpenCV esté instalado y accesible desde Node.js
const cv = require('opencv4nodejs');

// Verificar la versión de OpenCV
console.log(cv.version);