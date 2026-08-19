// Configura la instancia de Express: middlewares, CORS, límites de tamaño y manejo de errores
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');



const app = express();

const { WebhookClient } = require('dialogflow-fulfillment'); // Cliente usado por el asistente/chatbot (Dialogflow)

app.use(express.json()); // Permite recibir JSON en el body de las peticiones
app.use('img', express.static(path.join(__dirname, 'img'))); // Sirve archivos estáticos de imágenes
app.use(cors()); // Habilita peticiones desde otros orígenes (frontend Angular)
app.use(bodyParser.json());

app.use(express.json({ limit: '10mb' })); // Aumenta el límite de tamaño del JSON (ej. imágenes en base64)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware final: captura errores no manejados y responde en formato JSON
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({ 'error': {
    message: err.message,
    error: {}
  }});
});

module.exports = app;