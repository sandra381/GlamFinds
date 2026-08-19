// Punto de entrada del backend: carga variables de entorno, monta las rutas y arranca el servidor
require('dotenv').config();

const app = require('./config/server');
app.use('/', require('./app/rutas/glamfinds')); // Todas las rutas de la app se registran bajo la raíz "/"
const PORT = app.get("puerto") || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});