-- Tabla de usuarios registrados en el sistema
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` longtext NOT NULL,
  `usuario` longtext NOT NULL,
  `clave` longtext NOT NULL,
  `fecha_nac` date NOT NULL,
  `sexo` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario` (`usuario`) USING HASH,
  CONSTRAINT `CONSTRAINT_1` CHECK (`sexo` = 'M' or `sexo` = 'F')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Tabla de comics publicados, cada uno pertenece a un usuario
CREATE TABLE `comics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` longtext NOT NULL,
  `impresion` varchar(45) NOT NULL,
  `sinopsis` longtext DEFAULT NULL,
  `editorial` longtext DEFAULT NULL,
  `users` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `users` (`users`),
  CONSTRAINT `comics_ibfk_1` FOREIGN KEY (`users`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;






