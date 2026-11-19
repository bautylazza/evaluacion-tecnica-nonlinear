INSERT INTO categoria (nombre, descripcion) VALUES
    ('Electrónica', 'Computadoras, periféricos y accesorios'),
    ('Ropa', 'Indumentaria y abrigo'),
    ('Alimentos', 'Productos de almacén no perecederos');

INSERT INTO producto (nombre, categoria_id, precio_unitario, stock_actual, stock_minimo) VALUES
    ('Notebook 15 pulgadas',    (SELECT id FROM categoria WHERE nombre = 'Electrónica'), 850000.00, 12, 5),
    ('Mouse inalámbrico',       (SELECT id FROM categoria WHERE nombre = 'Electrónica'),  15000.00,  3, 10),
    ('Monitor 24 pulgadas',     (SELECT id FROM categoria WHERE nombre = 'Electrónica'), 220000.00,  0, 4),
    ('Remera de algodón',       (SELECT id FROM categoria WHERE nombre = 'Ropa'),         12000.00, 40, 15),
    ('Pantalón jean',           (SELECT id FROM categoria WHERE nombre = 'Ropa'),         35000.00, 18, 10),
    ('Campera impermeable',     (SELECT id FROM categoria WHERE nombre = 'Ropa'),         60000.00,  6, 3),
    ('Arroz 1 kg',              (SELECT id FROM categoria WHERE nombre = 'Alimentos'),     1800.00, 120, 50),
    ('Aceite de girasol 1,5 L', (SELECT id FROM categoria WHERE nombre = 'Alimentos'),     3500.00, 20, 30),
    ('Yerba mate 1 kg',         (SELECT id FROM categoria WHERE nombre = 'Alimentos'),     5200.00,  5, 5);

INSERT INTO movimiento (producto_id, tipo, cantidad, motivo, usuario)
SELECT id, 'ENTRADA', stock_actual, 'Carga inicial', 'sistema'
FROM producto
WHERE stock_actual > 0;
