import csv
import random
from datetime import datetime, timedelta

# Configuración
NUM_RECORDS = 500
OUTPUT_FILE = "SafeDistrict_MockData.csv"

# Datos de muestra
sectores = ["Comas Norte", "Comas Sur", "Collique", "San Agustín", "La Balanza"]
tipos_emergencia = ["Robo", "Accidente de Tránsito", "Emergencia Médica", "Incendio", "Sospecha"]
estados_reporte = ["Pendiente", "En Proceso", "Atendido"]

# Rango geográfico aproximado para Comas, Lima
# Latitud: -11.95 a -11.88
# Longitud: -77.06 a -77.01
LAT_MIN, LAT_MAX = -11.95, -11.88
LON_MIN, LON_MAX = -77.06, -77.01

def random_date_last_24h():
    now = datetime.now()
    delta = timedelta(minutes=random.randint(0, 24 * 60))
    return (now - delta).strftime("%Y-%m-%d %H:%M:%S")

def assign_priority(ia_score):
    if ia_score >= 80:
        return "Alta"
    elif ia_score >= 40:
        return "Media"
    else:
        return "Baja"

# Generar datos
data = []
for i in range(1, NUM_RECORDS + 1):
    id_reporte = f"#{1000 + i}"
    timestamp = random_date_last_24h()
    sector = random.choice(sectores)
    tipo = random.choice(tipos_emergencia)
    
    # Coordenadas
    lat = round(random.uniform(LAT_MIN, LAT_MAX), 6)
    lon = round(random.uniform(LON_MIN, LON_MAX), 6)
    
    confiabilidad = random.randint(10, 100)
    
    # Simular tasa de filtrado: ~15% son descartados
    estado_ia = "Descartado" if random.random() < 0.15 else "Validado"
    
    prioridad_ia = random.randint(10, 100)
    nivel_prioridad = assign_priority(prioridad_ia)
    
    # Tiempo de respuesta en minutos (si fue descartado, 0 o nulo, pondremos 0)
    # Si es Validado, tiempo entre 1 y 25 minutos
    tiempo_respuesta = round(random.uniform(1.0, 25.0), 1) if estado_ia == "Validado" else 0.0
    
    # Si fue descartado, estado es Atendido/Cerrado. Si no, random.
    if estado_ia == "Descartado":
        estado_reporte = "Atendido"
    else:
        estado_reporte = random.choice(estados_reporte)

    data.append([
        id_reporte, timestamp, sector, tipo, lat, lon, confiabilidad, 
        prioridad_ia, nivel_prioridad, estado_ia, tiempo_respuesta, estado_reporte
    ])

# Escribir a CSV
with open(OUTPUT_FILE, mode='w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow([
        "ID", "Timestamp", "Sector", "Tipo_Emergencia", "Latitud", "Longitud", 
        "Confiabilidad_Usuario", "Prioridad_IA", "Nivel_Prioridad", "Estado_IA", 
        "Tiempo_Respuesta_Min", "Estado_Reporte"
    ])
    writer.writerows(data)

print(f"Archivo {OUTPUT_FILE} generado exitosamente con {NUM_RECORDS} registros.")
