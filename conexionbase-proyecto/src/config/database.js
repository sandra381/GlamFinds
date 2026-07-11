const mysql = require('mysql');

const conn = mysql.createConnection({
    host: 'localhost',
    database: 'glamfinds',
    user: 'root',
    password: ''
});


conn.connect((error) =>{
    if(error){
        console.log("Error en el servidor");
    }else{
        console.log("Servidor fue conectado exitosamente con Mysql");
    }
});
module.exports = conn;
