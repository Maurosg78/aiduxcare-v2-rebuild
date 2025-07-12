#!/bin/bash

# Buscar todas las variables no utilizadas y añadir prefijo _
find src -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "'[a-zA-Z0-9]\+' is defined but never used" | while read file; do
  echo "Procesando $file"
  # Obtener variables no utilizadas
  vars=$(npx eslint "$file" | grep "is defined but never used" | sed -E "s/.*'([^']+)' is defined but never used.*/\1/g")
  for var in $vars; do
    # Reemplazar la variable por _variable manteniendo mayúsculas/minúsculas
    sed -i '' -E "s/([^a-zA-Z0-9_])($var)([^a-zA-Z0-9_])/\1_\2\3/g" "$file"
    echo "  Reemplazada: $var por _$var"
  done
done
