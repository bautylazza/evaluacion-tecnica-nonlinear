package com.inventario.repository;

import com.inventario.entity.Producto;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    @Query("SELECT p FROM Producto p JOIN FETCH p.categoria ORDER BY p.nombre")
    List<Producto> findAllConCategoria();

    @Query("SELECT p FROM Producto p JOIN FETCH p.categoria WHERE p.categoria.id = :categoriaId ORDER BY p.nombre")
    List<Producto> findByCategoriaIdConCategoria(@Param("categoriaId") Long categoriaId);

    @Modifying
    @Query("UPDATE Producto p SET p.stockActual = p.stockActual - :cantidad WHERE p.id = :id AND p.stockActual >= :cantidad")
    int descontarStock(@Param("id") Long id, @Param("cantidad") int cantidad);

    @Modifying
    @Query("UPDATE Producto p SET p.stockActual = p.stockActual + :cantidad WHERE p.id = :id")
    int sumarStock(@Param("id") Long id, @Param("cantidad") int cantidad);
}
