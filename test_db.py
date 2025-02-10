from db import obtener_conexion

conexion = obtener_conexion()

if conexion:
    print("✅ Conexión a MySQL exitosa")
    conexion.close()
else:
    print("❌ Error al conectar a MySQL")
