# Eventos Exactas

Sistema para gestionar las charlas, talleres y cursos de la Facultad de Ciencias Exactas (UNSa). Los organizadores publican eventos, los alumnos y el público se inscriben, y el sistema controla el cupo, manda los mails, registra la asistencia y genera los certificados y reportes.

## Funcionalidades

### Sin cuenta (público)

- Portada con los próximos eventos, cómo inscribirse y datos de contacto.
- Detalle público de cada evento.
- Inscripción como invitado (nombre, apellido, email y DNI) en los eventos abiertos al público.
- Encuesta y certificado de asistencia desde el enlace personal que llega por mail.

### Alumno

- Resumen con sus próximos eventos, inscripciones esperando revisión y certificados para descargar.
- Listado de eventos con pestañas (próximos, finalizados, todos), búsqueda, filtro por categoría y vista en tarjetas, tabla o calendario mensual.
- Inscripción con control de cupo, fechas y repetidas. Si la categoría lo pide, se sube documentación y la inscripción queda pendiente hasta que el organizador la revise.
- Cancelar la inscripción.
- Mis inscripciones: próximas, pendientes, pasadas y canceladas o rechazadas (con el motivo).
- Seguir categorías y disertantes para recibir un mail cuando se publica algo nuevo.
- Encuesta de satisfacción y certificado de asistencia en PDF.

### Organizador

- Resumen de sus eventos: próximos con el cupo ocupado, inscripciones para revisar y eventos finalizados sin asistencia cargada (el administrador lo ve de todos los eventos).
- Alta, edición, duplicado, cancelación y eliminación de sus eventos (borrador o publicado, imagen, cupo, disertantes, fecha límite de inscripción, abierto al público o solo registrados).
- Revisión de inscripciones: aceptar o rechazar con motivo, ver la documentación.
- Toma de asistencia.
- Mensajes por mail a los inscriptos.
- Carga de disertantes.
- Reportes: listado de inscriptos (PDF y Excel), planilla de asistencia para firmar (PDF), exportación del listado de eventos con los filtros aplicados (Excel) y resumen por evento (PDF y Excel).
- Resultados de la encuesta y porcentaje de no show en el detalle de cada evento.

### Administrador

- Todo lo del organizador, sobre todos los eventos.
- Categorías (con sus reglas de inscripción: aprobación y documentación) y lugares.
- Estadísticas de no show: tasa global, por categoría, eventos con más faltas y alumnos con 2 o más faltas.

### Automático

- Mails en cola: inscripción recibida, confirmada, aceptada o rechazada, evento modificado o cancelado, recordatorio, aviso a seguidores y enlace al certificado para invitados.
- Recordatorio a los inscriptos de los eventos de las próximas 24 horas.
- Los eventos publicados pasan solos a "finalizado" cuando terminan.

## Tecnologías

- Laravel 13 (PHP 8.4) con Inertia
- React + TypeScript, Tailwind CSS y componentes de shadcn/ui
- MySQL / MariaDB
- Spatie Laravel Permission (roles y permisos)
- barryvdh/laravel-dompdf (PDF) y maatwebsite/excel (Excel)
- Recharts (gráficos de estadísticas)

## Instalación

Requisitos: PHP 8.4, Composer, Node.js LTS, Git y MySQL o MariaDB (por ejemplo con XAMPP).

1. Clonar e instalar dependencias:

    ```bash
    git clone https://github.com/Sluur/eventos-unsa.git
    cd eventos-unsa
    composer install
    npm install
    ```

    Si Composer pide PHP 8.4.1 o superior, usar `composer install --ignore-platform-req=php`.

2. Crear el `.env`:

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

3. Crear la base `eventos_unsa` (desde phpMyAdmin con cotejamiento `utf8mb4_unicode_ci`, o por consola):

    ```bash
    mysql -u root -e "CREATE DATABASE eventos_unsa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    ```

    El `.env.example` ya trae la conexión de XAMPP por defecto (usuario `root`, sin contraseña):

    ```
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=eventos_unsa
    DB_USERNAME=root
    DB_PASSWORD=
    ```

4. Crear las tablas con los datos de demo y el enlace para las imágenes:

    ```bash
    php artisan migrate:fresh --seed
    php artisan storage:link
    ```

5. Levantar el servidor, Vite y la cola de mails en una sola terminal (MySQL tiene que estar corriendo):

    ```bash
    php artisan dev
    ```

El sistema queda en http://localhost:8000.

Para correr los tests: `php artisan test`.

## Usuarios de demo

Todos con contraseña `password`.

| Rol | Nombre | Email |
|---|---|---|
| Administrador | Rodrigo Haro | rodrigo@eventos.test |
| Organizador | Neo | organizador@eventos.test |
| Alumno | Oriana Figueroa | oriana@eventos.test |
| Alumno | Alejandro Haro | alejandro@eventos.test |
| Alumno | Franco Castilla | franco@eventos.test |

Los datos de demo (todos organizados por Neo) incluyen:

| Evento | Para mostrar |
|---|---|
| Git y GitHub para trabajos en grupo | Abierto al público, con un solo lugar libre (cupo lleno) |
| Primeros pasos con Docker | Empieza en menos de 24 horas (recordatorio) |
| Cómo funciona Internet | Inscripción ya cerrada |
| Curso de Python inicial | Documentación y aprobación: una pendiente, una aceptada y una rechazada |
| Introducción a las APIs REST | Borrador, con un disertante que sigue Alejandro |
| Seguridad informática básica | Evento cancelado |
| Introducción a SQL | Finalizado con no show |
| Taller de Linux desde cero | Finalizado, encuesta respondida (Alejandro) y sin responder (Franco) |
| Primeros pasos con Arduino | Finalizado, con una invitada sin asistencia tomada |

Oriana sigue la categoría Taller y tiene 2 faltas, por eso aparece en Estadísticas.

## Mails

Los mails se mandan en cola, así que `php artisan dev` tiene que estar corriendo (levanta el worker). Si no, se pueden procesar a mano con `php artisan queue:work --stop-when-empty`.

En desarrollo no salen de verdad: con `MAIL_MAILER=log` quedan escritos en `storage/logs/laravel.log`. Para seguirlos:

```powershell
Get-Content storage/logs/laravel.log -Tail 50 -Wait
```

Para mandarlos de verdad, cambiar en el `.env` los datos del SMTP. Por ejemplo con [Mailtrap](https://mailtrap.io) (bandeja de prueba):

```
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=usuario_de_mailtrap
MAIL_PASSWORD=clave_de_mailtrap
MAIL_FROM_ADDRESS="eventos@example.com"
```

Después de tocar el `.env`, correr `php artisan config:clear` y reiniciar `php artisan dev`.

## Tareas programadas

Hay dos comandos que se programan cada hora en `routes/console.php`:

- `php artisan eventos:enviar-recordatorios`: manda el recordatorio a los confirmados de los eventos que empiezan en las próximas 24 horas (una sola vez por inscripción).
- `php artisan eventos:finalizar`: pasa a "finalizado" los eventos publicados que ya terminaron.

Se pueden correr a mano en cualquier momento. Para que corran solos en desarrollo, dejar abierta otra terminal con:

```bash
php artisan schedule:work
```

En un servidor se agrega una sola tarea al cron que ejecute `php artisan schedule:run` cada minuto.
