# Eventos UNSa

Sistema para gestionar los eventos de la facultad (charlas, talleres, congresos). Los organizadores publican eventos y los alumnos se inscriben; el sistema controla el cupo y registra la asistencia.

## Qué se puede hacer por ahora

- Listado de eventos con búsqueda, filtros por categoría y estado, orden y paginación.
- Alta de charlas por parte del organizador: lugar, cupo, disertantes, guardar como borrador o publicar.
- Detalle del evento con disertantes, lugar, organizador y cupo ocupado.
- Inscripción y cancelación del alumno, con control de cupo, de inscripciones repetidas y de fechas.
- Toma de asistencia por parte del organizador del evento.
- ABM de categorías y lugares (administrador).
- Roles y permisos: administrador, organizador y alumno.

## Tecnologías

- Laravel 13 (PHP 8.4)
- React + TypeScript con Inertia
- Tailwind CSS
- Spatie Laravel Permission para roles y permisos
- MySQL / MariaDB

## Instalación

Requisitos: PHP 8.4, Composer, Node.js LTS, Git y MySQL o MariaDB (por ejemplo con XAMPP).

```bash
git clone https://github.com/Sluur/eventos-unsa.git
cd eventos-unsa

composer install
npm install

cp .env.example .env
php artisan key:generate
```

Crear la base de datos `eventos_unsa` (por ejemplo desde phpMyAdmin, con cotejamiento `utf8mb4_unicode_ci`), o desde la consola:

```bash
mysql -u root -e "CREATE DATABASE eventos_unsa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
```

En el `.env` quedan los datos de conexión (los de XAMPP por defecto: usuario `root`, sin contraseña):

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=eventos_unsa
DB_USERNAME=root
DB_PASSWORD=
```

MySQL tiene que estar corriendo antes de levantar el proyecto.

Crear las tablas y cargar los datos de prueba:

```bash
php artisan migrate:fresh --seed
```

Levantar el servidor, Vite y las colas en una sola terminal:

```bash
php artisan dev
```

El sistema queda en http://localhost:8000.

> Si Composer pide PHP 8.4.1 o superior, usar `composer install --ignore-platform-req=php`.

## Usuarios de prueba

Todos con contraseña `password`.

| Rol | Nombre | Email |
|---|---|---|
| Administrador | Rodrigo Haro | rodrigo@eventos.test |
| Organizador | Neo | organizador@eventos.test |
| Alumno | Oriana Figueroa | oriana@eventos.test |
| Alumno | Alejandro Haro | alejandro@eventos.test |
| Alumno | Franco Castilla | franco@eventos.test |

- **Administrador:** configura categorías y lugares y puede hacer todo.
- **Organizador:** carga disertantes, crea charlas y toma asistencia.
- **Alumno:** se inscribe a las charlas y cancela su inscripción.

Los disertantes se cargan desde su sección y no inician sesión.

Los datos de prueba incluyen cinco eventos organizados por Neo: una charla próxima con un solo lugar libre, una que ya pasó con la asistencia sin tomar, otra próxima con cupo amplio, una en borrador y un taller finalizado.
