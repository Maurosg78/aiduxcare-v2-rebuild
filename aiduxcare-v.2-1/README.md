# AIDUXCARE V.2

## Descripción del Proyecto
AIDUXCARE V.2 es una aplicación de flujo de trabajo de fisioterapia que integra inteligencia artificial para optimizar el proceso de evaluación y tratamiento de pacientes. La aplicación permite grabar conversaciones, procesar datos clínicos y generar notas SOAP y listas de verificación de acciones.

## Estructura del Proyecto
El proyecto está organizado en varias carpetas y archivos, cada uno con una función específica:

- **src/components/ui**: Contiene componentes reutilizables de la interfaz de usuario.
  - `badge.tsx`: Componente para mostrar etiquetas o distintivos.
  - `button.tsx`: Componente de botón reutilizable.
  - `card.tsx`: Componente de tarjeta para mostrar contenido.
  - `tabs.tsx`: Componente de pestañas para la navegación entre secciones.

- **src/components/index.ts**: Exporta todos los componentes de la carpeta `ui`.

- **src/pages**: Contiene las páginas de la aplicación.
  - `PhysiotherapyWorkflowPage.tsx`: Página principal que implementa el flujo de trabajo de fisioterapia.

- **src/services**: Contiene la lógica de servicio para interactuar con la API de fisioterapia.
  - `PhysiotherapyWorkflowService.ts`: Funciones para generar preguntas, pruebas diagnósticas y listas de verificación.

- **src/types**: Define y exporta las interfaces de tipos utilizadas en el proyecto.
  - `index.ts`: Contiene las interfaces para un sistema de tipado estricto.

- **package.json**: Configuración de npm, incluyendo dependencias y scripts.

- **tsconfig.json**: Configuración de TypeScript, especificando opciones del compilador y archivos a incluir.

## Instalación
Para instalar el proyecto, sigue estos pasos:

1. Clona el repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   ```

2. Navega a la carpeta del proyecto:
   ```
   cd aiduxcare-v.2
   ```

3. Instala las dependencias:
   ```
   npm install
   ```

## Uso
Para iniciar la aplicación, ejecuta el siguiente comando:
```
npm start
```

La aplicación se abrirá en tu navegador predeterminado en `http://localhost:3000`.

## Contribuciones
Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia
Este proyecto está bajo la Licencia MIT.