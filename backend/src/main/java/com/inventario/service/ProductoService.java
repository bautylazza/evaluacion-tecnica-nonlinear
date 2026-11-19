package com.inventario.service;

import com.inventario.dto.ProductoResponse;
import com.inventario.entity.Producto;
import com.inventario.repository.ProductoRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<ProductoResponse> listar(Long categoriaId) {
        List<Producto> productos = buscarProductos(categoriaId);
        return productos.stream().map(ProductoResponse::from).toList();
    }

    private List<Producto> buscarProductos(Long categoriaId) {
        if (categoriaId == null) {
            return productoRepository.findAllConCategoria();
        }
        return productoRepository.findByCategoriaIdConCategoria(categoriaId);
    }
}
