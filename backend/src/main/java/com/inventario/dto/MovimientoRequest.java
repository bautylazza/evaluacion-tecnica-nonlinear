package com.inventario.dto;

import com.inventario.entity.TipoMovimiento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record MovimientoRequest(
        @NotNull Long productoId,
        @NotNull TipoMovimiento tipo,
        @NotNull @Positive Integer cantidad,
        @Size(max = 255) String motivo,
        @NotBlank @Size(max = 100) String usuario) { }
