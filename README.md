# Registro de Automóviles (Flask + MongoDB)

Pequeña aplicación web en Python (Flask) que permite registrar automóviles en una base de datos MongoDB.

Características:
- Formulario simple para registrar: marca, modelo, año, color, motor, numero de puertas y costo.
- Botón para guardar en MongoDB.
- Tabla que muestra los registros y se actualiza dinámicamente (fetch API).

Requisitos:
- Python 3.9+
- MongoDB (local o Mongo Atlas)

Instalación rápida (Windows PowerShell):

powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

Configurar la conexión a MongoDB (opcional):
- Crear un archivo `.env` en la raíz con el contenido de `.env.example` y ajustar `MONGO_URI` si usas Atlas.

Ejecutar la aplicación:

powershell
activar entorno si no está activo
.\.venv\Scripts\Activate.ps1
ejecutar
python app.py
