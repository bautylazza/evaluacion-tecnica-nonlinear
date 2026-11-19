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
