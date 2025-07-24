package com.example.backend.repository;

import com.example.backend.entity.Category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Tìm category theo tên
    Optional<Category> findByName(String name);

    // Tìm category theo tên (ignore case)
    Optional<Category> findByNameIgnoreCase(String name);

    // Kiểm tra xem category có tồn tại theo tên không
    boolean existsByName(String name);

    // Tìm category có tên chứa keyword (ignore case)
    List<Category> findByNameContainingIgnoreCase(String keyword);

    // Custom query tìm theo description
    @Query("SELECT c FROM Category c WHERE c.description LIKE %:keyword%")
    List<Category> findByDescriptionContaining(@Param("keyword") String keyword);
}