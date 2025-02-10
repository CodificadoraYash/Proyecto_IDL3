from flask_mysqldb import MySQL

mysql = MySQL()  # Solo creamos la instancia, sin Flask

def init_app(app):
    # Configuración de conexión con MySQL
    app.config['MYSQL_HOST'] = 'localhost'
    app.config['MYSQL_USER'] = 'root'  # Cambia si tienes otro usuario
    app.config['MYSQL_PASSWORD'] = ''  # Agrega tu contraseña si es necesario
    app.config['MYSQL_DB'] = 'gestion_productos'
    
    mysql.init_app(app)  # Inicializamos MySQL con la app Flask
