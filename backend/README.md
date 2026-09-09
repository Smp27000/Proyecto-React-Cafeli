# CafeLi Marketplace - Backend con FastAPI y MySQL

Backend completo desarrollado en **FastAPI**, **SQLAlchemy** y **MySQL** para la tienda y marketplace de café de especialidad **CafeLi**.

---

## 📁 Estructura del Proyecto

```
backend/
├── app/
│   ├── models/            # Modelos ORM SQLAlchemy (Usuario, Rol, Producto, Carrito, Pedido, Servicio)
│   ├── schemas/           # Esquemas Pydantic v2 de validación y serialización
│   ├── routes/            # Endpoints RESTful agrupados por dominio
│   ├── auth.py            # Hashing Bcrypt, Tokens JWT y control de roles (RBAC)
│   ├── config.py          # Configuración desde variables de entorno
│   ├── database.py        # Conexión SQLAlchemy y dependencias de sesión
│   └── main.py            # Instancia FastAPI, CORS y middleware
├── database.sql           # Script SQL para creación de tablas y datos semilla
├── requirements.txt       # Dependencias de Python
├── .env                   # Variables de entorno locales
├── .env.example           # Plantilla de variables de entorno
└── run.py                 # Script de arranque con Uvicorn
```

---

## 🚀 Instalación y Puesta en Marcha

### 1. Requisitos Previos
* Python 3.10 o superior
* MySQL Server / XAMPP / MariaDB (puerto por defecto 3306)

### 2. Crear y Activar Entorno Virtual

En Windows (PowerShell):
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

En Linux / MacOS:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar Dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar Base de Datos MySQL
1. Inicia tu servidor MySQL (ejemplo desde el panel de XAMPP).
2. Importa el archivo `database.sql` en tu gestor de base de datos favorito (phpMyAdmin, MySQL Workbench o consola):
```bash
mysql -u root -p < database.sql
```
*(Opcional: FastAPI también creará automáticamente las tablas faltantes al iniciar el servidor)*.

3. Revisa y ajusta los valores en `.env` si tu usuario o contraseña de MySQL son diferentes:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=db_jhm_tech_solutions
```

### 5. Iniciar el Servidor Backend
```bash
python run.py
```
O directamente con Uvicorn:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload
```

---

## 📖 Documentación Interactiva de la API

Una vez iniciado el servidor, accede a:
* **Swagger UI**: [http://localhost:3000/docs](http://localhost:3000/docs)
* **ReDoc**: [http://localhost:3000/redoc](http://localhost:3000/redoc)

---

## 🔑 Cuentas Semilla por Defecto (Seeders)

| Rol | Correo Electrónico | Contraseña | Permisos / Acceso |
|---|---|---|---|
| **Administrador** | `admin@cafeli.com` | `admin1234` | Gestión total de usuarios, catálogo, pedidos y métricas |
| **Empleado** | `empleado@cafeli.com` | `empleado1234` | Gestión de pedidos, estados e inventario de productos |
| **Cliente** | `cliente@cafeli.com` | `cliente1234` | Catálogo de café, carrito de compras y checkout |

---

## 🛡️ Resumen de Endpoints Principales

### Autenticación
* `POST /api/v1/auth/login` → Genera token JWT (`sub`, `rol_id`, `rol_nombre`, `exp`).
* `POST /api/v1/auth/register` → Registro de clientes con validaciones y hash seguro.
* `GET /api/v1/auth/me` → Información del usuario autenticado.

### Productos (Café)
* `GET /api/v1/productos` → Catálogo de cafés (búsqueda por nombre, categoría, tueste).
* `POST /api/v1/productos` → Crear producto *(Admin / Empleado)*.
* `PUT /api/v1/productos/{id}` → Editar producto *(Admin / Empleado)*.
* `DELETE /api/v1/productos/{id}` → Eliminar producto *(Admin / Empleado)*.

### Carrito de Compras
* `GET /api/v1/carrito` → Ver carrito actual con subtotales y total global.
* `POST /api/v1/carrito` → Agregar producto validando disponibilidad de stock.
* `PUT /api/v1/carrito/{item_id}` → Actualizar cantidad.
* `DELETE /api/v1/carrito/{item_id}` → Quitar producto del carrito.
* `DELETE /api/v1/carrito` → Vaciar carrito.

### Pedidos (Órdenes)
* `POST /api/v1/pedidos` → Generar pedido (checkout desde carrito con descuento automático de stock).
* `GET /api/v1/pedidos/mis-pedidos` → Historial de pedidos del cliente.
* `GET /api/v1/pedidos` → Listar todos los pedidos *(Admin / Empleado)*.
* `GET /api/v1/pedidos/{id}` → Detalle completo del pedido.
* `PATCH /api/v1/pedidos/{id}/estado` → Cambiar estado del pedido *(Admin / Empleado)*.

### Usuarios
* `GET /api/v1/usuarios` → Listar usuarios *(Admin)*.
* `POST /api/v1/usuarios` → Crear usuario *(Admin)*.
* `PUT /api/v1/usuarios/{id}` → Actualizar usuario.
* `PATCH /api/v1/usuarios/{id}/estado` → Activar / Inactivar usuario *(Admin)*.
* `DELETE /api/v1/usuarios/{id}` → Eliminar usuario *(Admin)*.

### Servicios
* `GET /api/v1/servicios` → Catálogo de servicios (catas, talleres, mantenimiento).
* `POST /api/v1/servicios` → Crear servicio *(Admin / Empleado)*.
* `PUT /api/v1/servicios/{id}` → Actualizar servicio *(Admin / Empleado)*.
* `DELETE /api/v1/servicios/{id}` → Eliminar servicio *(Admin / Empleado)*.
