from flask import Blueprint, request, jsonify, render_template
from db import mysql
from werkzeug.security import generate_password_hash, check_password_hash

routes = Blueprint('routes', __name__)

### 🛒 CRUD de Productos ###

# Obtener todos los productos
@routes.route('/productos', methods=['GET'])
def get_productos():
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, nombre, descripcion, precio, stock FROM productos")
    productos = cur.fetchall()
    cur.close()

    productos_lista = [
        {"id": p[0], "nombre": p[1], "descripcion": p[2], "precio": p[3], "stock": p[4]}
        for p in productos
    ]

    return jsonify(productos_lista)


# Obtener un producto por ID
@routes.route('/productos/<int:id>', methods=['GET'])
def get_producto(id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM productos WHERE id = %s", (id,))
    producto = cur.fetchone()
    cur.close()
    return jsonify(producto)

# Crear un producto
@routes.route('/productos', methods=['POST'])
def create_producto():
    data = request.json
    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (%s, %s, %s, %s)", 
                (data['nombre'], data['descripcion'], data['precio'], data['stock']))
    mysql.connection.commit()
    cur.close()
    return jsonify({'mensaje': 'Producto creado'}), 201

# Actualizar un producto
@routes.route('/productos/<int:id>', methods=['PUT'])
def update_producto(id):
    data = request.json
    cur = mysql.connection.cursor()
    cur.execute("UPDATE productos SET nombre=%s, descripcion=%s, precio=%s, stock=%s WHERE id=%s", 
                (data['nombre'], data['descripcion'], data['precio'], data['stock'], id))
    mysql.connection.commit()
    cur.close()
    return jsonify({'mensaje': 'Producto actualizado'})

# Eliminar un producto
@routes.route('/productos/<int:id>', methods=['DELETE'])
def delete_producto(id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM productos WHERE id=%s", (id,))
    mysql.connection.commit()
    cur.close()
    return jsonify({'mensaje': 'Producto eliminado'})


### 👤 CRUD de Administradores ###

# Obtener todos los administradores
@routes.route('/administradores', methods=['GET'])
def get_administradores():
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, usuario, password, nombre_completo, email, telefono, creado_en FROM administradores")
    administradores = cur.fetchall()
    cur.close()
    
    admins_lista = [
        {"id": a[0], "usuario": a[1], "password": a[2], "nombre_completo": a[3], "email": a[4], "telefono": a[5], "creado_en": a[6]}
        for a in administradores
    ]
    
    return jsonify(admins_lista)

# Obtener un administrador por ID
@routes.route('/administradores/<int:id>', methods=['GET'])
def get_administrador(id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, usuario, password, nombre_completo, email, telefono, creado_en FROM administradores WHERE id = %s", (id,))
    administrador = cur.fetchone()
    cur.close()
    
    if administrador:
        admin_dict = {
            "id": administrador[0], "usuario": administrador[1], "password": administrador[2], 
            "nombre_completo": administrador[3], "email": administrador[4], "telefono": administrador[5], "creado_en": administrador[6]
        }
        return jsonify(admin_dict)
    else:
        return jsonify({'mensaje': 'Administrador no encontrado'}), 404

# Crear un nuevo administrador
@routes.route('/administradores', methods=['POST'])
def create_administrador():
    data = request.json
    hashed_password = generate_password_hash(data['password'])  # Encriptar contraseña
    
    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO administradores (usuario, password, nombre_completo, email, telefono) VALUES (%s, %s, %s, %s, %s)", 
                (data['usuario'], hashed_password, data['nombre_completo'], data['email'], data['telefono']))
    mysql.connection.commit()
    cur.close()
    return jsonify({'mensaje': 'Administrador creado'}), 201

# Actualizar un administrador
@routes.route('/administradores/<int:id>', methods=['PUT'])
def update_administrador(id):
    data = request.json
    cur = mysql.connection.cursor()
    
    # Si se actualiza la contraseña, encriptarla
    if "password" in data:
        hashed_password = generate_password_hash(data['password'])
        cur.execute("UPDATE administradores SET usuario=%s, password=%s, nombre_completo=%s, email=%s, telefono=%s WHERE id=%s", 
                    (data['usuario'], hashed_password, data['nombre_completo'], data['email'], data['telefono'], id))
    else:
        cur.execute("UPDATE administradores SET usuario=%s, nombre_completo=%s, email=%s, telefono=%s WHERE id=%s", 
                    (data['usuario'], data['nombre_completo'], data['email'], data['telefono'], id))
    
    mysql.connection.commit()
    cur.close()
    return jsonify({'mensaje': 'Administrador actualizado'})

# Eliminar un administrador
@routes.route('/administradores/<int:id>', methods=['DELETE'])
def delete_administrador(id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM administradores WHERE id=%s", (id,))
    mysql.connection.commit()
    cur.close()
    return jsonify({'mensaje': 'Administrador eliminado'})


### 🌐 Rutas para la Interfaz Web ###
@routes.route('/')
def home():
    return render_template('index.html')  # Carga la página principal

@routes.route('/admin')
def admin_panel():
    return render_template('admin.html')  # Carga el panel de administración

### 🔐 Ruta de Login ###
@routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    usuario_correcto = "admin"
    password_correcto = "123456"

    if not data:
        return jsonify({"mensaje": "Datos no enviados"}), 400

    if data.get("usuario") == usuario_correcto and data.get("password") == password_correcto:
        return jsonify({"mensaje": "Acceso concedido"}), 200
    else:
        return jsonify({"mensaje": "Usuario o contraseña incorrectos"}), 401

@routes.route('/actualizar-stock', methods=['POST'])
def actualizar_stock():
    data = request.json
    producto_id = data['id']
    cantidad = data['cantidad']

    cur = mysql.connection.cursor()
    
    # Obtener el stock actual del producto
    cur.execute("SELECT stock FROM productos WHERE id = %s", (producto_id,))
    producto = cur.fetchone()
    
    if producto:
        stock_actual = producto[0]
        nuevo_stock = stock_actual - cantidad
        
        if nuevo_stock >= 0:
            # Actualizar el stock en la base de datos
            cur.execute("UPDATE productos SET stock = %s WHERE id = %s", (nuevo_stock, producto_id))
            mysql.connection.commit()
            cur.close()
            return jsonify({'mensaje': 'Stock actualizado correctamente'}), 200
        else:
            cur.close()
            return jsonify({'mensaje': 'No hay suficiente stock disponible'}), 400
    else:
        cur.close()
        return jsonify({'mensaje': 'Producto no encontrado'}), 404
