# CLAUDE.md

Reglas y decisiones del proyecto para la implementación asistida con IA. Las justificaciones de cada decisión están en `README.md`.

## Contexto

Ejercicio de evaluación técnica (take-home) para Desarrollador Junior — Full Stack: sistema de gestión de inventario con categorías, productos y movimientos de stock. El desarrollador tiene que defender cada línea en una entrevista: el código tiene que ser simple y explicable.

Las decisiones de este archivo ya están aprobadas. No se reabren sin una razón fuerte.

## Reglas de trabajo

- No suponer nada: ante cualquier duda, preguntar antes de avanzar.
- Si una propuesta del usuario es floja, discutirla. No darle siempre la razón.
- Justificar toda decisión.
- Si algo no está definido en este archivo, preguntar antes de implementarlo.
- Trabajar de a una rama por vez, en el orden del plan, y esperar la aprobación del usuario antes de pasar a la siguiente.
- Al explicar, no usar analogías.
- El usuario usó poco TypeScript: explicarle cada tipo y cada parte no trivial.
- Las explicaciones para estudiar van en `NOTAS.md` (raíz, en el `.gitignore`).

## Stack

- **Backend:** Java 25, Spring Boot (última estable), Spring Data JPA, Flyway, Lombok, Bean Validation. Maven siempre con el wrapper.
- **Base de datos:** PostgreSQL 18 local, sin Docker.
- **Frontend:** React con TypeScript (Vite) y Recharts.
- **Tests:** JUnit 5 y Mockito.

## Estructura del repositorio

```
backend/
frontend/
docs/capturas/
CLAUDE.md
README.md
```

El PDF del enunciado no se versiona.

## Reglas de código

- Código simple, sin comentarios.
- Identificadores en español, como el enunciado.
- Funciones de un solo propósito, con máximo 3 parámetros. En el backend, máximo 20 líneas.
- Nombres completamente descriptivos (`productoId`, no `pId`).
- Sin llamadas encadenadas largas ni streams de varios pasos: variables intermedias con nombre.
- Errores logueados con SLF4J en el nivel adecuado. Nunca `printStackTrace()`.

## Backend

Paquetes por capas en `com.inventario`: `controller`, `service`, `repository`, `entity`, `dto`, `exception`. Cada capa solo conoce a la de abajo.

- Servicios como clases concretas, sin interfaz.
- Inyección por constructor con campos `final`.
- Las entidades nunca se exponen: se devuelven DTOs como `record` con `from(entidad)`. Sin MapStruct.
- Entidades con `@Getter`, `@Setter` y `@NoArgsConstructor`. Nunca `@Data`.
- `@ManyToOne` con `FetchType.LAZY`.
- Reglas de negocio en el servicio. No duplicar los controles de la base, salvo stock insuficiente y producto inexistente.

### Configuración

- `application.yml`: `ddl-auto: validate`, `open-in-view: false`. La conexión usa `${SPRING_DATASOURCE_URL}`, `${SPRING_DATASOURCE_USERNAME}` y `${SPRING_DATASOURCE_PASSWORD}`, que en local salen de `backend/.env` (importado con `spring.config.import: optional:file:.env[.properties]`; plantilla en `.env.example`).
- `application-dev.yml`: `logging.level.org.hibernate.SQL: DEBUG` y `classpath:db/seed` en las ubicaciones de Flyway.
- Ejecución local: `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`.

### Modelo de datos

- El esquema es `db/migration/V1__esquema_inicial.sql`. Sin índices adicionales. `producto_historial` no se implementa.
- `fecha` del movimiento la genera la base: `@Generated(event = EventType.INSERT)` y `insertable = false, updatable = false`.
- Stock bajo: `stock_actual <= stock_minimo`, calculado en `Producto.tieneStockBajo()`.
- Datos de prueba en `db/seed/V2__datos_iniciales.sql`, solo en `dev`. Todo stock entra por un movimiento `ENTRADA` de "Carga inicial" del usuario "sistema".

### Endpoints

- `GET /productos?categoria={id}`: parámetro opcional. Devuelve `ProductoResponse` plano, ordenado por nombre, con `JOIN FETCH`. Categoría inexistente → `200` vacío. Sin paginación.
- `POST /movimientos`: `MovimientoRequest` validado. Servicio `@Transactional`: producto inexistente → 404; salida con `UPDATE` condicional, 0 filas → 409; entrada con `UPDATE` que suma; movimiento guardado con `getReferenceById`. `201` con `MovimientoResponse`. Logs `INFO` al registrar y `WARN` al rechazar.

### Errores

`GlobalExceptionHandler` extiende `ResponseEntityExceptionHandler` y responde con `ProblemDetail`. Handlers propios:

| Excepción | Código |
|---|---|
| `StockInsuficienteException` | 409 |
| `ProductoNoEncontradoException` | 404 |
| `DataIntegrityViolationException` | 409 |

Los 400 de request los resuelve la clase base.

## Frontend

- Carpetas en `frontend/src/`: `api/`, `components/`, `hooks/`, `types/`.
- Proxy de Vite para `/productos` y `/movimientos` hacia `localhost:8080`. Sin CORS en el backend.
- `fetch` nativo en `src/api/`. Errores con `ErrorApi`, que lee el `detail` del `ProblemDetail`.
- Un único CSS plano (`src/index.css`), sin frameworks.
- Tipos de TypeScript que reflejan exactamente los DTOs.

### Pantalla de productos

- **Flujo de datos:** el listado completo se carga siempre (alerta y categorías); el filtrado, solo con filtro activo (tabla y gráfico). Después de un movimiento se recargan los dos. Carga en el hook `useProductos`.
- **Alerta:** sobre el listado completo. Una tarjeta por producto con stock y mínimo, ordenadas por gravedad, con botón "Registrar entrada". Oculta si no hay productos con stock bajo.
- **Filtro:** desplegable con categorías derivadas del listado completo, a la izquierda arriba de la tabla.
- **Tabla:** nombre, categoría, precio unitario, stock actual, stock mínimo y estado (etiqueta "Stock bajo"), y botón "Registrar movimiento" por fila. Sin id.
- **Gráfico:** barras horizontales ordenadas de menor a mayor stock, rojas si hay stock bajo, con el valor en la punta. Sin tooltip. Respeta el filtro.
- Títulos de sección fuera de las tarjetas.

### Formulario de movimiento

- Modal. Campos: producto (preseleccionado), tipo (Entrada / Salida, arranca en Entrada), cantidad, motivo (opcional) y usuario. Sin fecha.
- Obligatorios con asterisco rojo y `required`, con la aclaración "Los campos con * son obligatorios".
- Debajo de la cantidad: "Stock actual: X → quedará en Y". Salida mayor al stock: "Stock insuficiente: hay X unidades", vista previa en rojo y botón deshabilitado.
- Botones abajo a la derecha: "Cancelar" y "Registrar entrada" / "Registrar salida". El principal se deshabilita mientras envía.
- 409: muestra el mensaje y recarga el stock. Éxito: cierra el modal y recarga todo.

## Tests

Unitarios con JUnit 5 y Mockito, sin base. Un test por motivo de falla, con nombres descriptivos. No se mencionan en el README.

- `ProductoServiceTest`: sin filtro, con filtro, y la respuesta con categoría y `stockBajo`.
- `MovimientoServiceTest`: salida rechazada por stock, entrada registrada, producto inexistente.

## Git

- Gitflow simplificado: `main` (entregada), `develop` (integración), `feature/*`.
- Cada `feature/*` entra a `develop` con un PR y commit de merge. Claude integra cuando el usuario da el OK. Al terminar, `develop` entra a `main`.
- Conventional Commits con descripción en español.

## Plan de implementación

1. `feature/configuracion-inicial` ✓
2. `feature/modelo-datos` ✓
3. `feature/endpoint-productos` ✓
4. `feature/frontend-productos` ✓
5. `feature/movimientos` ✓
6. `feature/documentacion`: README con instrucciones reales, capturas en `docs/capturas/` y revisión de las respuestas.
