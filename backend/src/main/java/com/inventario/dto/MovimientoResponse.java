package com.inventario.dto;

import com.inventario.entity.Movimiento;
import com.inventario.entity.TipoMovimiento;
import java.time.Instant;

public record MovimientoResponse(
        Long id,
        Long productoId,
        TipoMovimiento tipo,
        Integer cantidad,
        Instant fecha,
        String motivo,
        String usuario) {

    public static MovimientoResponse from(Movimiento movimiento) {
        return new MovimientoResponse(
                movimiento.getId(),
                movimiento.getProducto().getId(),
                movimiento.getTipo(),
                movimiento.getCantidad(),
                movimiento.getFecha(),
                movimiento.getMotivo(),
                movimiento.getUsuario());
    }
}
