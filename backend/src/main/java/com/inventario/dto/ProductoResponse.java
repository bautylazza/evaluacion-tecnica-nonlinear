package com.inventario.dto;

import com.inventario.entity.Categoria;
import com.inventario.entity.Producto;
import java.math.BigDecimal;

public record ProductoResponse(
        Long id,
        String nombre,
        Long categoriaId,
        String categoriaNombre,
        BigDecimal precioUnitario,
        Integer stockActual,
        Integer stockMinimo,
        Boolean stockBajo) {

    public static ProductoResponse from(Producto producto) {
        Categoria categoria = producto.getCategoria();
        return new ProductoResponse(
                producto.getId(),
                producto.getNombre(),
                categoria.getId(),
                categoria.getNombre(),
                producto.getPrecioUnitario(),
                producto.getStockActual(),
                producto.getStockMinimo(),
                producto.tieneStockBajo());
    }
}
