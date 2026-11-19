package com.inventario.controller;

import com.inventario.dto.ProductoResponse;
import com.inventario.service.ProductoService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public List<ProductoResponse> listar(
            @RequestParam(name = "categoria", required = false) Long categoriaId) {
        return productoService.listar(categoriaId);
    }
}
