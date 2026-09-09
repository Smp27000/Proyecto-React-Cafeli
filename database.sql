-- ==============================================================================
-- Script de Creación y Población de Base de Datos para CafeLi Marketplace
-- Tercer Trimestre - Integración React + Vite, FastAPI y MySQL
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `db_jhm_tech_solutions` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_jhm_tech_solutions`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `detalle_pedidos`;
DROP TABLE IF EXISTS `pedidos`;
DROP TABLE IF EXISTS `carrito`;
DROP TABLE IF EXISTS `roles_permisos`;
DROP TABLE IF EXISTS `permisos`;
DROP TABLE IF EXISTS `usuarios`;
DROP TABLE IF EXISTS `productos`;
DROP TABLE IF EXISTS `servicios`;
DROP TABLE IF EXISTS `roles`;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------------------------
-- 1. Tabla de Roles
-- ------------------------------------------------------------------------------
CREATE TABLE `roles` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL UNIQUE,
  `descripcion` VARCHAR(255) DEFAULT NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Administrador', 'Acceso total al sistema, gestión de usuarios, catálogo, pedidos y métricas'),
(2, 'Cliente', 'Acceso para explorar productos, gestionar carrito, generar pedidos y ver historial'),
(3, 'Empleado', 'Acceso a gestión de pedidos, actualización de inventario y catálogo de productos');

-- ------------------------------------------------------------------------------
-- 2. Tabla de Permisos
-- ------------------------------------------------------------------------------
CREATE TABLE `permisos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL UNIQUE,
  `descripcion` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `permisos` (`id`, `nombre`, `descripcion`) VALUES
(1, 'gestionar_usuarios', 'Crear, listar, actualizar, cambiar estado y eliminar usuarios'),
(2, 'gestionar_productos', 'Crear, modificar, listar y eliminar productos de café'),
(3, 'gestionar_pedidos', 'Consultar y cambiar estado de todos los pedidos'),
(4, 'gestionar_servicios', 'Crear, modificar y listar servicios complementarios');

-- ------------------------------------------------------------------------------
-- 3. Tabla Relacional Roles - Permisos (Muchos a Muchos)
-- ------------------------------------------------------------------------------
CREATE TABLE `roles_permisos` (
  `rol_id` INT(11) NOT NULL,
  `permiso_id` INT(11) NOT NULL,
  PRIMARY KEY (`rol_id`, `permiso_id`),
  CONSTRAINT `fk_rp_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rp_permiso` FOREIGN KEY (`permiso_id`) REFERENCES `permisos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles_permisos` (`rol_id`, `permiso_id`) VALUES
(1, 1), -- Admin: usuarios
(1, 2), -- Admin: productos
(1, 3), -- Admin: pedidos
(1, 4), -- Admin: servicios
(3, 2), -- Empleado: productos
(3, 3), -- Empleado: pedidos
(3, 4); -- Empleado: servicios

-- ------------------------------------------------------------------------------
-- 4. Tabla de Usuarios
-- ------------------------------------------------------------------------------
CREATE TABLE `usuarios` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombres` VARCHAR(50) NOT NULL,
  `apellidos` VARCHAR(50) NOT NULL,
  `tipo_documento` VARCHAR(10) NOT NULL,
  `numero_documento` VARCHAR(20) NOT NULL,
  `direccion` VARCHAR(100) DEFAULT NULL,
  `telefono` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `rol_id` INT(11) NOT NULL DEFAULT 2,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'Activo',
  `fecha_registro` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuario_documento` (`tipo_documento`, `numero_documento`),
  KEY `idx_usuario_rol` (`rol_id`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Semilla de Usuarios con hash Bcrypt (Claves por defecto):
-- admin@cafeli.com -> admin1234
-- empleado@cafeli.com -> empleado1234
-- cliente@cafeli.com -> cliente1234
INSERT INTO `usuarios` (`id`, `nombres`, `apellidos`, `tipo_documento`, `numero_documento`, `direccion`, `telefono`, `email`, `password`, `rol_id`, `estado`) VALUES
(1, 'Administrador', 'Principal', 'CC', '1000000001', 'Calle Principal #10-20', '3001234567', 'admin@cafeli.com', '$2b$12$e8s3YwGzV64r28q79Fk5uOIYmIu8K1L6uY6ZqjRkRkV9rXzH6d2e6', 1, 'Activo'),
(2, 'Carlos', 'Empleado', 'CC', '1000000002', 'Carrera 15 #45-30', '3109876543', 'empleado@cafeli.com', '$2b$12$e8s3YwGzV64r28q79Fk5uOIYmIu8K1L6uY6ZqjRkRkV9rXzH6d2e6', 3, 'Activo'),
(3, 'Samuel', 'Cliente', 'CC', '1000000003', 'Avenida Siempre Viva 123', '3205557788', 'cliente@cafeli.com', '$2b$12$e8s3YwGzV64r28q79Fk5uOIYmIu8K1L6uY6ZqjRkRkV9rXzH6d2e6', 2, 'Activo');

-- ------------------------------------------------------------------------------
-- 5. Tabla de Productos (Café de Especialidad y Artículos)
-- ------------------------------------------------------------------------------
CREATE TABLE `productos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `origen` VARCHAR(100) DEFAULT 'Colombia',
  `tipo_tueste` VARCHAR(50) DEFAULT 'Medio',
  `categoria` VARCHAR(50) NOT NULL DEFAULT 'Café en Grano',
  `precio` DECIMAL(10,2) NOT NULL,
  `stock` INT(11) NOT NULL DEFAULT 0,
  `imagen_url` VARCHAR(500) DEFAULT NULL,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'Activo',
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_producto_categoria` (`categoria`),
  KEY `idx_producto_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `origen`, `tipo_tueste`, `categoria`, `precio`, `stock`, `imagen_url`, `estado`) VALUES
(1, 'Café Geisha Especial', 'Variedad Geisha de alta montaña con notas florales a jazmín, bergamota y miel.', 'Huila, Colombia', 'Claro', 'Café en Grano', 45000.00, 25, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600', 'Activo'),
(2, 'Café Bourbon Rosado', 'Café exótico con notas a frutas tropicales, durazno y acidez brillante balanceada.', 'Nariño, Colombia', 'Medio', 'Café en Grano', 38000.00, 30, 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=600', 'Activo'),
(3, 'Café Castillo Tueste Oscuro', 'Cuerpo intenso, notas pronunciadas a chocolate amargo, caramelo y nueces tostadas.', 'Antioquia, Colombia', 'Oscuro', 'Café Molido', 28000.00, 50, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600', 'Activo'),
(4, 'Café Maragogipe Tradicional', 'Granos gigantes con sabor suave, delicadas notas dulces a panela y cítricos suaves.', 'Santander, Colombia', 'Medio', 'Café Molido', 32000.00, 20, 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600', 'Activo'),
(5, 'Cafetera Prensa Francesa 600ml', 'Prensa francesa de vidrio de borosilicato y acero inoxidable para extracción limpia.', 'Importado', 'N/A', 'Accesorios', 55000.00, 15, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600', 'Activo'),
(6, 'Molino Manual de Muelas Cerámicas', 'Molino de café graduable para molienda espresso, prensa francesa o filtrados.', 'Importado', 'N/A', 'Accesorios', 75000.00, 10, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600', 'Activo');

-- ------------------------------------------------------------------------------
-- 6. Tabla de Carrito de Compras
-- ------------------------------------------------------------------------------
CREATE TABLE `carrito` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` INT(11) NOT NULL,
  `producto_id` INT(11) NOT NULL,
  `cantidad` INT(11) NOT NULL DEFAULT 1,
  `fecha_agregado` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuario_producto` (`usuario_id`, `producto_id`),
  KEY `idx_carrito_usuario` (`usuario_id`),
  CONSTRAINT `fk_carrito_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_carrito_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. Tabla de Pedidos (Órdenes de Compra)
-- ------------------------------------------------------------------------------
CREATE TABLE `pedidos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` INT(11) NOT NULL,
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `estado` ENUM('Pendiente', 'Pagado', 'Preparando', 'Enviado', 'Entregado', 'Cancelado') NOT NULL DEFAULT 'Pendiente',
  `direccion_envio` VARCHAR(255) NOT NULL,
  `telefono_contacto` VARCHAR(20) DEFAULT NULL,
  `metodo_pago` VARCHAR(50) NOT NULL DEFAULT 'Contraentrega',
  `notas` TEXT DEFAULT NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pedido_usuario` (`usuario_id`),
  KEY `idx_pedido_estado` (`estado`),
  CONSTRAINT `fk_pedido_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. Tabla Detalle de Pedidos
-- ------------------------------------------------------------------------------
CREATE TABLE `detalle_pedidos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `pedido_id` INT(11) NOT NULL,
  `producto_id` INT(11) NOT NULL,
  `cantidad` INT(11) NOT NULL,
  `precio_unitario` DECIMAL(10,2) NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_detalle_pedido` (`pedido_id`),
  KEY `idx_detalle_producto` (`producto_id`),
  CONSTRAINT `fk_detalle_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. Tabla de Servicios (Para Compatibilidad con Módulos Existentes)
-- ------------------------------------------------------------------------------
CREATE TABLE `servicios` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `precio` DECIMAL(10,2) NOT NULL,
  `duracion` VARCHAR(50) NOT NULL DEFAULT '1 hora',
  `estado` VARCHAR(20) NOT NULL DEFAULT 'Activo',
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `servicios` (`id`, `nombre`, `descripcion`, `precio`, `duracion`, `estado`) VALUES
(1, 'Cata de Café Guiada (Presencial)', 'Experiencia sensorial descubriendo notas, orígenes y métodos de preparación artesanal.', 65000.00, '2 horas', 'Activo'),
(2, 'Taller de Barismo Básico', 'Aprende calibración de molino, emulsión perfecta de leche y extracción de espresso.', 120000.00, '4 horas', 'Activo'),
(3, 'Mantenimiento Preventivo de Cafeteras', 'Limpieza profunda, descalcificación y ajuste de sellos para máquinas espresso y molinos.', 80000.00, '1.5 horas', 'Activo');

-- ------------------------------------------------------------------------------
-- 10. Datos Semilla para Pedido de Demostración
-- ------------------------------------------------------------------------------
INSERT INTO `pedidos` (`id`, `usuario_id`, `total`, `estado`, `direccion_envio`, `telefono_contacto`, `metodo_pago`, `notas`) VALUES
(1, 3, 83000.00, 'Pagado', 'Avenida Siempre Viva 123', '3205557788', 'Tarjeta de Crédito', 'Por favor entregar en horario de la tarde');

INSERT INTO `detalle_pedidos` (`id`, `pedido_id`, `producto_id`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
(1, 1, 1, 1, 45000.00, 45000.00),
(2, 1, 2, 1, 38000.00, 38000.00);

