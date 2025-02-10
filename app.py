from flask import Flask
from routes import routes  # Importamos el Blueprint
from db import init_app  # Importamos la inicialización de la base de datos

app = Flask(__name__)
init_app(app)  # Inicializa la configuración de MySQL
app.register_blueprint(routes)  # Registra las rutas del Blueprint

if __name__ == '__main__':
    app.run(debug=True)
