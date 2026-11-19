package com.inventario.service;

import com.inventario.dto.MovimientoRequest;
import com.inventario.dto.MovimientoResponse;
import com.inventario.entity.Movimiento;
import com.inventario.entity.Producto;
import com.inventario.entity.TipoMovimiento;
import com.inventario.exception.ProductoNoEncontradoException;
import com.inventario.exception.StockInsuficienteException;
import com.inventario.repository.MovimientoRepository;
import com.inventario.repository.ProductoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class MovimientoService {

    private final MovimientoRepository movimientoRepository;
    private final ProductoRepository productoRepository;

    public MovimientoService(MovimientoRepository movimientoRepository, ProductoRepository productoRepository) {
        this.movimientoRepository = movimientoRepository;
        this.productoRepository = productoRepository;
    }

    @Transactional
    public MovimientoResponse registrar(MovimientoRequest request) {
        verificarQueExisteElProducto(request.productoId());
        actualizarStock(request);
        Movimiento movimientoGuardado = movimientoRepository.save(crearMovimiento(request));
        log.info("Movimiento {} registrado: {} de {} unidades del producto {} por {}",
                movimientoGuardado.getId(), request.tipo(), request.cantidad(),
                request.productoId(), request.usuario());
        return MovimientoResponse.from(movimientoGuardado);
    }

    private void verificarQueExisteElProducto(Long productoId) {
        if (!productoRepository.existsById(productoId)) {
            throw new ProductoNoEncontradoException(productoId);
        }
    }

    private void actualizarStock(MovimientoRequest request) {
        if (request.tipo() == TipoMovimiento.ENTRADA) {
            productoRepository.sumarStock(request.productoId(), request.cantidad());
            return;
        }
        int filasModificadas = productoRepository.descontarStock(request.productoId(), request.cantidad());
        if (filasModificadas == 0) {
            log.warn("Salida rechazada por stock insuficiente: {} unidades del producto {}",
                    request.cantidad(), request.productoId());
            throw new StockInsuficienteException();
        }
    }

    private Movimiento crearMovimiento(MovimientoRequest request) {
        Producto producto = productoRepository.getReferenceById(request.productoId());
        Movimiento movimiento = new Movimiento();
        movimiento.setProducto(producto);
        movimiento.setTipo(request.tipo());
        movimiento.setCantidad(request.cantidad());
        movimiento.setMotivo(request.motivo());
        movimiento.setUsuario(request.usuario());
        return movimiento;
    }
}
