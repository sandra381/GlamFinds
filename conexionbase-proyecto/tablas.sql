use glamfinds;

create table usuarios(
id_user int auto_increment,
usuario varchar(200),
nombre varchar(200),
apellido varchar(200),
edad int ,
sexo varchar(200),
correo varchar(400),
contrase varchar(400),
imagen varchar(1000),
unique(usuario),
primary key(id_user)
);
SELECT * FROM USUARIOS;
drop table usuarios;

create table categorias(
id_categoria int auto_increment,
name_categoria varchar(200),
primary key(id_categoria)
);
select * from categorias;
insert into categorias(name_categoria) values("Tendencias");
insert into categorias(name_categoria) values("Ropa");
insert into categorias(name_categoria) values("Maquillaje");
insert into categorias(name_categoria) values("Accesorios");
insert into categorias(name_categoria) values("Zapatos");
insert into categorias(name_categoria) values("Descuentos");
insert into categorias(name_categoria) values("Dups");

create table posts_generales(
id_post int auto_increment,
descripcion longtext,
imagen varchar(1000),
autor int not null,
categoria int not null,
primary key(id_post),
foreign key(autor) references usuarios(id_user),
foreign key(categoria) references categorias(id_categoria)
);
insert into posts_generales(descripcion,imagen,autor,categoria) values ("Los jean morranes están arrasando en la moda este año y no puedo evitar unirme a la tendencia. 💙💫 Son la combinación perfecta de estilo y comodidad. ¿Quién más está obsesionado/a con estos jeans? #TendenciaJeansMorranes #Moda2023 #EstiloÚnico","https://i.pinimg.com/564x/39/65/e1/3965e16deb4bbf533fe4479441ce50fe.jpg",1,1);
insert into posts_generales(descripcion,imagen,autor,categoria)values ("🌞👚 ¡Las blusas para brunch de verano son un must-have en mi guardarropa! Son frescas, versátiles y perfectas para cualquier ocasión bajo el sol. Esta temporada, los estampados florales y los tonos pastel son los favoritos, ¡pero siempre es importante añadir tu toque personal! 🌸✨ ¿Cuál es tu elección de blusa para el brunch de hoy? ¡Muéstranos tu estilo de verano! ☕🥐 #ModaVeraniega #Brunch #EstiloVerano #TendenciaDeBlusas" ,"https://i.pinimg.com/564x/79/5e/be/795ebee6b816b21e5629b77a270d8ae0.jpg",2,2);
insert into posts_generales(descripcion,imagen,autor,categoria)values ("¡El 'graphic liner' está llevando el mundo del maquillaje a un nivel completamente nuevo! Es una explosión de creatividad en tus ojos, y me encanta cómo permite expresar tu personalidad de manera audaz y artística. ¿Has probado esta tendencia? ¡Enséñanos tus looks y comparte tu inspiración! 👁️🎨 #MaquillajeArtístico #GraphicLiner #ExpresaTuEstilo #InnovaciónDeMaquillaje","https://i.pinimg.com/564x/33/b7/35/33b7352adc97e4dbfd5d405905048cc4.jpg",2,3);
insert into posts_generales(descripcion,imagen,autor,categoria) values (" ¡Las mini bags son definitivamente un gran amor en esta temporada! Estas adorables piezas no solo complementan tu atuendo, sino que también hacen una declaración de moda por sí mismas. ¿Quién más se siente obsesionado/a con estas pequeñas maravillas? ¡Muéstranos tu mini bag favorita y cuéntanos cómo la incorporas en tu estilo! 💁‍♀️💫 #MiniBags #TendenciaDeAccesorios #PequeñasMaravillas #EstiloÚnico","https://i.pinimg.com/564x/07/f4/8a/07f48a740608b39d89f20c93a9cc9225.jpg",1,4);
insert into posts_generales(descripcion,imagen,autor,categoria) values (" ¡Las suelas destroyer están haciendo temblar el mundo de la moda! Estos zapatos no solo son cómodos, sino que también añaden un toque audaz y moderno a cualquier look. ¿Tienes un par de estos en tu armario? ¡Comparte tu estilo y dinos cómo los luces! 👣💥 #ZapatosConSuelaDestroyer #TendenciaDeCalzado #EstiloAudaz #ComodidadConEstilo","https://i.pinimg.com/564x/69/a1/51/69a1512f2380df86792f1c0671679cf0.jpg",1,5);
SELECT p.id_post,p.descripcion,p.imagen,u.usuario,c.name_categoria FROM  posts_generales p, usuarios u , categorias c 
where p.autor=u.id_user and p.categoria = c.id_categoria and id_categoria = 1;

create table posts_publicidad(
id_post int auto_increment,
descripcion longtext,
imagen varchar(1000),
link varchar(1000),
categoria int not null,
primary key(id_post),
foreign key(categoria) references categorias(id_categoria)
);





