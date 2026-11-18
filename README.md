# Invitación XV años de Emily Sofía Sanches Molina

Sitio web estático, responsivo y listo para publicar en GitHub Pages. No requiere instalación, compilación ni base de datos.

## Vista local

Desde esta carpeta, ejecuta:

```bash
python3 -m http.server 4173
```

Después abre `http://localhost:4173`.

## Datos del evento

Todos los datos editables están centralizados en `scripts/event-data.js`:

- nombre;
- fecha y hora;
- lugar y coordenadas;
- canción;
- fotografías y textos de la galería.

La fecha configurada actualmente es el **lunes 23 de noviembre de 2026 a las 5:00 p. m.**, hora de Honduras.

La confirmación de asistencia abre WhatsApp al **+504 8903-0844** con un mensaje predeterminado. La invitación indica un máximo de **2 personas**. El número, el límite y el texto se administran desde `scripts/event-data.js`.

## Publicar en GitHub Pages

1. Crear un repositorio nuevo en GitHub.
2. Subir todo el contenido de esta carpeta conservando su estructura.
3. Ir a **Settings → Pages**.
4. En **Build and deployment**, elegir **Deploy from a branch**.
5. Seleccionar la rama `main` y la carpeta `/ (root)`.
6. Guardar y esperar a que GitHub muestre la dirección pública.

La dirección prevista para compartir la invitación es:

```text
https://yesman4-dev.github.io/Emily/
```

Comparte esa dirección —no la URL del repositorio— para que WhatsApp pueda mostrar la fotografía, el título y la descripción configurados en la invitación.

## Estructura

```text
assets/
  audio/       Música de la invitación
  images/      Fotografías con nombres preparados para web
scripts/
  event-data.js  DTO y catálogo de datos del evento
  app.js         Componentes e interacciones
styles/
  main.css       Diseño responsivo
index.html       Página principal
```

Las fotografías y el audio originales que estaban en la carpeta raíz no fueron modificados.
