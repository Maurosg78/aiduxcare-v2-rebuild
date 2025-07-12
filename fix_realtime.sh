#!/bin/bash

# Ruta al archivo
FILE="/Users/mauriciosobarzo/Desktop/AIDUXCARE-V.2/src/components/RealTimeAudioCapture.tsx"

# Crear copia de seguridad
cp "$FILE" "${FILE}.bak"

# Añadir constante AUDIO_STATES al inicio del archivo (después de las importaciones)
sed -i '' -e '/^import/!{0,/^const/s/^const/const AUDIO_STATES = {\n  RECORDING: "Recording audio...",\n  PROCESSING: "Processing audio...",\n  READY: "Ready to record"\n};\n\nconst/}' "$FILE"

# Cambiar currentSession a _currentSession
sed -i '' 's/const currentSession/const _currentSession/' "$FILE"

# Cambiar index a _index en la función de la línea 355
sed -i '' 's/\(([^)]*\)index\([^)]*)\)/\1_index\2/' "$FILE"

# Reemplazar strings duplicados con constantes
sed -i '' 's/"Recording audio..."/AUDIO_STATES.RECORDING/g' "$FILE"
sed -i '' 's/"Processing audio..."/AUDIO_STATES.PROCESSING/g' "$FILE"
sed -i '' 's/"Ready to record"/AUDIO_STATES.READY/g' "$FILE"

echo "Cambios aplicados a $FILE"
