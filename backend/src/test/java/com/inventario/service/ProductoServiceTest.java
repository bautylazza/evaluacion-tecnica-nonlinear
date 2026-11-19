package com.inventario.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.inventario.dto.ProductoResponse;
import com.inventario.entity.Categoria;
import com.inventario.entity.Producto;
import com.inventario.repository.ProductoRepository;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @InjectMocks
    private ProductoService productoService;

    @Test
    void deberiaListarTodosLosProductosCuandoNoHayFiltro() {
        productoService.listar(null);

        verify(productoRepository).findAllConCategoria();
        verify(productoRepository, never()).findByCategoriaIdConCategoria(any());
    }

    @Test
    void deberiaFiltrarPorCategoriaCuandoHayFiltro() {
        productoService.listar(1L);

        verify(productoRepository).findByCategoriaIdConCategoria(1L);
        verify(productoRepository, never()).findAllConCategoria();
    }

    @Test
    void deberiaIncluirNombreDeCategoriaYStockBajoEnLaRespuesta() {
        Producto producto = crearProducto("Mouse inalámbrico", 3, 10);
        when(productoRepository.findAllConCategoria()).thenReturn(List.of(producto));

        List<ProductoResponse> respuesta = productoService.listar(null);

        ProductoResponse productoResponse = respuesta.getFirst();
        assertEquals("Electrónica", productoResponse.categoriaNombre());
        assertTrue(productoResponse.stockBajo());
    }

    private Producto crearProducto(String nombre, int stockActual, int stockMinimo) {
        Categoria categoria = new Categoria();
        categoria.setId(1L);
        categoria.setNombre("Electrónica");
        Producto producto = new Producto();
        producto.setNombre(nombre);
        producto.setCategoria(categoria);
        producto.setPrecioUnitario(new BigDecimal("15000.00"));
        producto.setStockActual(stockActual);
        producto.setStockMinimo(stockMinimo);
        return producto;
    }
}
