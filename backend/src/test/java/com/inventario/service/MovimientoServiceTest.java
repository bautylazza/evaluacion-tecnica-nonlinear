package com.inventario.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.inventario.dto.MovimientoRequest;
import com.inventario.dto.MovimientoResponse;
import com.inventario.entity.Movimiento;
import com.inventario.entity.Producto;
import com.inventario.entity.TipoMovimiento;
import com.inventario.exception.ProductoNoEncontradoException;
import com.inventario.exception.StockInsuficienteException;
import com.inventario.repository.MovimientoRepository;
import com.inventario.repository.ProductoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MovimientoServiceTest {

    private static final Long PRODUCTO_ID = 1L;

    @Mock
    private MovimientoRepository movimientoRepository;

    @Mock
    private ProductoRepository productoRepository;

    @InjectMocks
    private MovimientoService movimientoService;

    @Test
    void deberiaRechazarSalidaCuandoStockEsInsuficiente() {
        when(productoRepository.existsById(PRODUCTO_ID)).thenReturn(true);
        when(productoRepository.descontarStock(PRODUCTO_ID, 50)).thenReturn(0);
        MovimientoRequest request = crearRequest(TipoMovimiento.SALIDA, 50);

        assertThrows(StockInsuficienteException.class, () -> movimientoService.registrar(request));

        verify(movimientoRepository, never()).save(any());
    }

    @Test
    void deberiaRegistrarEntrada() {
        when(productoRepository.existsById(PRODUCTO_ID)).thenReturn(true);
        when(productoRepository.getReferenceById(PRODUCTO_ID)).thenReturn(crearProducto());
        when(movimientoRepository.save(any(Movimiento.class))).thenAnswer(invocacion -> invocacion.getArgument(0));
        MovimientoRequest request = crearRequest(TipoMovimiento.ENTRADA, 10);

        MovimientoResponse respuesta = movimientoService.registrar(request);

        verify(productoRepository).sumarStock(PRODUCTO_ID, 10);
        assertEquals(TipoMovimiento.ENTRADA, respuesta.tipo());
        assertEquals(10, respuesta.cantidad());
    }

    @Test
    void deberiaRechazarMovimientoDeProductoInexistente() {
        when(productoRepository.existsById(PRODUCTO_ID)).thenReturn(false);
        MovimientoRequest request = crearRequest(TipoMovimiento.ENTRADA, 10);

        assertThrows(ProductoNoEncontradoException.class, () -> movimientoService.registrar(request));

        verify(productoRepository, never()).sumarStock(anyLong(), anyInt());
        verify(movimientoRepository, never()).save(any());
    }

    private MovimientoRequest crearRequest(TipoMovimiento tipo, int cantidad) {
        return new MovimientoRequest(PRODUCTO_ID, tipo, cantidad, "Prueba", "tester");
    }

    private Producto crearProducto() {
        Producto producto = new Producto();
        producto.setId(PRODUCTO_ID);
        return producto;
    }
}
