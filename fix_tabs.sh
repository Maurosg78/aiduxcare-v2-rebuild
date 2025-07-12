#!/bin/bash

# Ruta al archivo
FILE="/Users/mauriciosobarzo/Desktop/AIDUXCARE-V.2/src/components/ui/tabs.tsx"

# Crear copia de seguridad
cp "$FILE" "${FILE}.bak"

# Cambiar importación de useState
sed -i '' 's/import { \(.*\)useState\(.*\) } from "react";/import { \1_useState as useState\2 } from "react";/' "$FILE"

echo "Cambios aplicados a $FILE"
