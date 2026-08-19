// Configura y abre la conexión a la base de datos MySQL "glamfinds"
const mysql = require('mysql');

const conn = mysql.createConnection({
    host: 'localhost',
    database: 'glamfinds',
    user: 'root',
    password: ''
});

// Intenta conectar y avisa por consola si hubo error o si se conectó bien
conn.connect((error) =>{
    if(error){
        console.log("Error en el servidor");
    }else{
        console.log("Servidor fue conectado exitosamente con Mysql");
    }
});
module.exports = conn; // Se exporta la conexión para usarla en las rutas/consultas
