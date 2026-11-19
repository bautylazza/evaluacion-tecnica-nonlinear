# CLAUDE.md

Reglas y decisiones del proyecto para la implementación asistida con IA.

## Contexto

Ejercicio de evaluación técnica (take-home) para Desarrollador Junior — Full Stack: un sistema de gestión de inventario con categorías, productos y movimientos de stock. El desarrollador tiene que defender cada línea en una entrevista, así que el código tiene que ser simple y explicable.

Todas las decisiones de este archivo ya fueron discutidas y aprobadas. No se reabren sin una razón fuerte. Las respuestas conceptuales están en `README.md`.

## Reglas de trabajo

- No suponer nada: ante cualquier duda, preguntar antes de avanzar.
- Si una propuesta del usuario es floja, discutirla. No darle siempre la razón.
- Justificar toda decisión.
- Si algo no está definido en este archivo, preguntar antes de implementarlo.
- Trabajar de a una rama por vez, en el orden del plan de implementación, y esperar la aprobación del usuario antes de pasar a la siguiente.
- Al explicar, no usar analogías.

## Stack

- **Backend:** Java 25, Spring Boot en su última versión estable, Spring Data JPA (Hibernate), Flyway, Lombok, Bean Validation. Maven, siempre a través del wrapper (`mvnw` / `mvnw.cmd`).
- **Base de datos:** PostgreSQL 18, instalado localmente (sin Docker).
- **Frontend:** React con TypeScript, generado con Vite. Gráficos con Recharts.
- **Tests:** JUnit 5 y Mockito.

## Estructura del repositorio

```
backend/
frontend/
CLAUDE.md
README.md
```

El PDF del enunciado no se versiona (está en el `.gitignore`).

## Reglas de código

- Mantener el código simple. Evitar la complejidad innecesaria.
- Sin comentarios: el código se tiene que entender solo.
- Identificadores en español, igual que el enunciado (`producto`, `stockActual`, `TipoMovimiento`).
- Funciones de un solo propósito, con un máximo de 20 líneas y 3 parámetros.
- Nombres completamente descriptivos (`productoId`, no `pId`).
- Evitar llamadas encadenadas largas y streams de varios pasos. Usar variables intermedias con nombre.
- Errores logueados con SLF4J en el nivel adecuado. Nunca `printStackTrace()`.

## Backend

### Estructura de paquetes

Organización por capas. Cada capa solo conoce a la de abajo: controller → service → repository.

```
backend/src/main/java/com/inventario/
├── InventarioApplication.java
├── controller/
├── service/
├── repository/
├── entity/
├── dto/
└── exception/
backend/src/main/resources/
├── application.yml
├── application-dev.yml
├── db/migration/V1__esquema_inicial.sql
└── db/seed/V2__datos_iniciales.sql
```

- Los servicios son clases concretas, sin interfaz (hay una sola implementación).
- Inyección de dependencias por constructor, con campos `final`.
- Las entidades JPA nunca se exponen en la API: siempre se devuelven DTOs.
- Los DTOs son `record` de Java, con un método estático `from(entidad)` para convertir. No se usa MapStruct.
- Entidades con Lombok `@Getter`, `@Setter` y `@NoArgsConstructor`. Nunca `@Data` en entidades (problemas de `equals`/`hashCode`/`toString` con los proxies de Hibernate).
- Las relaciones `@ManyToOne` se declaran con `fetch = FetchType.LAZY`.
- `TipoMovimiento` es un enum (`ENTRADA`, `SALIDA`) mapeado con `@Enumerated(EnumType.STRING)`.
- Las reglas de negocio viven en la capa de servicio. No se duplican en el servicio los controles que ya hace la base, salvo los conflictos que un usuario va a provocar realmente (stock insuficiente, producto inexistente).

### Configuración

- `application.yml`: configuración común. `spring.jpa.hibernate.ddl-auto: validate`; el esquema lo maneja solo Flyway.
- `spring.jpa.open-in-view: false`: la sesión de Hibernate no se extiende al controller, así una relación `LAZY` no se carga sin que se note. La conversión a DTO se hace en el servicio.
- La conexión a la base se define en `application.yml` con los placeholders `${SPRING_DATASOURCE_URL}`, `${SPRING_DATASOURCE_USERNAME}` y `${SPRING_DATASOURCE_PASSWORD}`. Ninguna credencial va en el repositorio.
  - En local, los valores salen de `backend/.env` (en el `.gitignore`), importado con `spring.config.import: optional:file:.env[.properties]`. `backend/.env.example` se versiona como plantilla. No se usan variables de entorno del usuario de Windows porque las leería cualquier otro proyecto Spring Boot.
  - En producción, los valores salen de variables de entorno reales; el `.env` no existe y el import es opcional.
- `application-dev.yml`: muestra el SQL ejecutado (con `logging.level.org.hibernate.SQL: DEBUG`, para que pase por SLF4J) y agrega `classpath:db/seed` a las ubicaciones de Flyway, para cargar los datos de prueba solo en desarrollo.
- Se ejecuta en local con `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`.

### Modelo de datos

`db/migration/V1__esquema_inicial.sql`:

```sql
CREATE TABLE categoria (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL UNIQUE,
    descripcion  TEXT
);

CREATE TABLE producto (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre           VARCHAR(150)  NOT NULL,
    categoria_id     BIGINT        NOT NULL REFERENCES categoria(id) ON DELETE RESTRICT,
    precio_unitario  NUMERIC(12,2) NOT NULL CHECK (precio_unitario >= 0),
    stock_actual     INTEGER       NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo     INTEGER       NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0)
);

CREATE TABLE movimiento (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    producto_id  BIGINT       NOT NULL REFERENCES producto(id) ON DELETE RESTRICT,
    tipo         VARCHAR(10)  NOT NULL CHECK (tipo IN ('ENTRADA','SALIDA')),
    cantidad     INTEGER      NOT NULL CHECK (cantidad > 0),
    fecha        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    motivo       VARCHAR(255),
    usuario      VARCHAR(100) NOT NULL
);
```

- Sin índices adicionales: se mencionan en el README como el primer paso si el sistema crece.
- La tabla `producto_historial` no se implementa: solo está descripta en el README.
- Ids con `GenerationType.IDENTITY`.
- `precio_unitario` se mapea a `BigDecimal`.
- La columna `fecha` la completa la base: en la entidad se mapea con `insertable = false, updatable = false`.
- Un producto tiene stock bajo cuando `stock_actual <= stock_minimo`. Lo calcula un método `tieneStockBajo()` en la entidad `Producto`.

### Datos de prueba

`db/seed/V2__datos_iniciales.sql`, cargado solo en el perfil `dev`:

- Tres categorías: Electrónica, Ropa y Alimentos.
- Entre 8 y 10 productos repartidos entre las categorías, varios con stock bajo y al menos uno sin stock.
- Todo stock entra por movimientos: cada producto con stock mayor a 0 tiene un movimiento `ENTRADA` con motivo "Carga inicial" y usuario "sistema", por la misma cantidad que su `stock_actual`. Esto mantiene la coherencia con el cálculo de stock histórico descripto en el README.

### `GET /productos`

- Parámetro opcional `categoria` (id de la categoría): `@RequestParam(name = "categoria", required = false) Long categoriaId`.
- Respuesta: lista de `ProductoResponse`, plana:

```java
public record ProductoResponse(
        Long id,
        String nombre,
        Long categoriaId,
        String categoriaNombre,
        BigDecimal precioUnitario,
        Integer stockActual,
        Integer stockMinimo,
        Boolean stockBajo) { }
```

- Dos métodos en el repositorio, ambos con `JOIN FETCH` (para evitar el N+1) y ordenados por nombre. El servicio llama a uno u otro según venga o no el filtro:

```java
@Query("SELECT p FROM Producto p JOIN FETCH p.categoria ORDER BY p.nombre")
List<Producto> findAllConCategoria();

@Query("SELECT p FROM Producto p JOIN FETCH p.categoria WHERE p.categoria.id = :categoriaId ORDER BY p.nombre")
List<Producto> findByCategoriaIdConCategoria(@Param("categoriaId") Long categoriaId);
```

- Categoría inexistente → `200` con lista vacía. Parámetro no numérico → `400`.
- Sin paginación (justificado en el README).

### `POST /movimientos`

- Request `MovimientoRequest` (record) con Bean Validation:
  - `productoId`: `@NotNull`
  - `tipo`: `@NotNull TipoMovimiento`
  - `cantidad`: `@NotNull @Positive Integer`
  - `motivo`: opcional, `@Size(max = 255)`
  - `usuario`: `@NotBlank @Size(max = 100)`
- Servicio con `@Transactional`:
  1. Si el producto no existe → `ProductoNoEncontradoException` (404).
  2. Si es `SALIDA`: UPDATE condicional. Si modificó 0 filas → `StockInsuficienteException` (409).
  3. Si es `ENTRADA`: UPDATE que suma.
  4. Guardar el movimiento, referenciando el producto con `getReferenceById`.
- Repositorio:

```java
@Modifying
@Query("UPDATE Producto p SET p.stockActual = p.stockActual - :cantidad WHERE p.id = :id AND p.stockActual >= :cantidad")
int descontarStock(@Param("id") Long id, @Param("cantidad") int cantidad);

@Modifying
@Query("UPDATE Producto p SET p.stockActual = p.stockActual + :cantidad WHERE p.id = :id")
int sumarStock(@Param("id") Long id, @Param("cantidad") int cantidad);
```

- Logs: `INFO` al registrar un movimiento, `WARN` al rechazar por stock insuficiente.
- Respuestas: `201` registrado, `409` stock insuficiente, `400` datos inválidos, `404` producto inexistente.

### Manejo de errores

Un `@RestControllerAdvice` (`GlobalExceptionHandler`) centraliza las respuestas de error. El cuerpo es un `ProblemDetail` (RFC 9457) de Spring. El handler extiende `ResponseEntityExceptionHandler`, que ya responde 400 con `ProblemDetail` para los errores de request (cuerpo inválido, validación, parámetro de tipo incorrecto); solo se agregan los handlers propios:

| Excepción | Código |
|---|---|
| `StockInsuficienteException` | 409 |
| `ProductoNoEncontradoException` | 404 |
| `MethodArgumentNotValidException` y `HttpMessageNotReadableException` | 400 |
| `DataIntegrityViolationException` (caso genérico, conflictos raros con restricciones de la base) | 409 |

## Frontend

- Proyecto Vite + React + TypeScript en `frontend/`.
- Proxy de Vite: las rutas `/productos` y `/movimientos` se reenvían a `http://localhost:8080`. No hay configuración de CORS en el backend.
- Un tipo `Producto` en TypeScript que refleja exactamente `ProductoResponse`.
- El usuario usó poco TypeScript: explicarle cada tipo y cada parte no trivial al implementar.

### Pantalla de productos

Una sola pantalla, con estos componentes:

- **Alerta de stock bajo:** banner arriba de la pantalla. Se calcula sobre el listado completo (no sobre el filtrado), filtrando `stockBajo = true`. Muestra la cantidad de productos con stock bajo y la lista de cada uno con su stock actual y su mínimo, ordenada por gravedad (primero los más lejos de su mínimo). Cada producto tiene un botón que abre el formulario con el producto y el tipo `ENTRADA` preseleccionados. Si no hay productos con stock bajo, el banner no se muestra.
- **Filtro por categoría:** desplegable. Las categorías se derivan del listado completo (sin endpoint de categorías). Al elegir una, se llama a `GET /productos?categoria={id}`.
- **Tabla:** columnas nombre, categoría, precio unitario, stock actual y stock mínimo. Sin id. Etiqueta roja "Stock bajo" junto al stock actual. Botón "Registrar movimiento" en cada fila, que abre el formulario con el producto preseleccionado.
- **Gráfico:** barras horizontales con Recharts, una por producto, con el stock actual. Las barras de los productos con stock bajo van en rojo. Muestra los mismos productos que la tabla (respeta el filtro).

Flujo de datos: al abrir la pantalla se carga el listado completo (para la alerta y las categorías). Si hay un filtro activo, se carga además el listado filtrado (para la tabla y el gráfico). Después de registrar un movimiento, se recargan los dos.

### Formulario de movimiento

- Ventana modal sobre la tabla.
- Campos: producto (desplegable, preseleccionable), tipo (dos opciones visibles: Entrada / Salida), cantidad (entero mayor a 0), motivo (texto opcional), usuario (texto obligatorio). Sin fecha.
- Debajo de la cantidad: "Stock actual: X → quedará en Y".
- Si el tipo es Salida y la cantidad supera el stock actual: mensaje debajo de la cantidad ("Stock insuficiente: hay X unidades"), vista previa en rojo y botón de enviar deshabilitado.
- Botones abajo a la derecha: "Cancelar" (secundario) y a su derecha el principal, que dice "Registrar entrada" o "Registrar salida" según el tipo. Sin ventana de confirmación extra.
- El botón principal se deshabilita mientras se envía, para evitar registros duplicados por doble clic.
- Si el backend responde 409: mostrar el mensaje y recargar el stock.
- Al registrar con éxito: cerrar el modal y recargar la tabla, el gráfico y la alerta.

## Tests

Tests unitarios con JUnit 5 y Mockito, sin base de datos. Un test por motivo de falla, con nombres descriptivos (por ejemplo, `deberiaRechazarSalidaCuandoStockEsInsuficiente`). Solo los necesarios para verificar que funciona:

- `ProductoService`: sin filtro llama a `findAllConCategoria`; con filtro llama a `findByCategoriaIdConCategoria`; la respuesta incluye el nombre de la categoría y `stockBajo`.
- `MovimientoService`: rechaza la salida cuando `descontarStock` devuelve 0; registra la entrada; rechaza el movimiento de un producto inexistente.

Los tests no se mencionan en el README.

## Git

- Gitflow simplificado: `main` (versión entregada), `develop` (integración), `feature/*` (una rama por funcionalidad).
- Cada `feature/*` se integra a `develop` con un Pull Request, usando commit de merge (sin squash). Claude integra el PR cuando el usuario da el OK. Al terminar, `develop` se integra a `main`.
- Conventional Commits con la descripción en español: `feat`, `fix`, `docs`, `test`, `chore`, `refactor`. Ejemplo: `feat(productos): agregar endpoint GET /productos con filtro por categoría`.

## Plan de implementación

Una rama por vez, en este orden:

1. `feature/configuracion-inicial`: proyecto Spring Boot y proyecto Vite generados, `.gitignore`, `CLAUDE.md` y `README.md`.
2. `feature/modelo-datos`: migración V1, entidades, datos de prueba del perfil `dev`.
3. `feature/endpoint-productos`: `GET /productos` con repositorio, servicio, DTO, controller, manejo de errores y tests.
4. `feature/frontend-productos`: alerta, filtro, tabla y gráfico.
5. `feature/movimientos`: `POST /movimientos`, tests y formulario.
6. `feature/documentacion`: completar el README con las instrucciones reales y revisar todas las respuestas.

## Pendientes de decidir con el usuario

Preguntar antes de implementar:

- Cuerpo de la respuesta `201` de `POST /movimientos`, y cómo obtener la fecha que genera la base.
- Cliente HTTP del frontend (`fetch` nativo o una librería).
- Forma de manejar los estilos del frontend.
