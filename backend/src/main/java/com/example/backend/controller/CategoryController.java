package com.example.backend.controller;

import com.example.backend.dto.request.CategoryRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.entity.Category;
import com.example.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CategoryController {

    private final CategoryService categoryService;

    // GET /api/categories - Lấy tất cả categories
    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        try {
            List<Category> categories = categoryService.getAllCategories();
            return ResponseEntity.ok(ApiResponse.success(categories, "Retrieved all categories successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to retrieve categories", e.getMessage()));
        }
    }

    // GET /api/categories/{id} - Lấy category theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> getCategoryById(@PathVariable Long id) {
        try {
            Optional<Category> category = categoryService.getCategoryById(id);
            if (category.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(category.get(), "Category found"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Category not found with id: " + id));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to retrieve category", e.getMessage()));
        }
    }

    // GET /api/categories/name/{name} - Lấy category theo tên
    @GetMapping("/name/{name}")
    public ResponseEntity<ApiResponse<Category>> getCategoryByName(@PathVariable String name) {
        try {
            Optional<Category> category = categoryService.getCategoryByName(name);
            if (category.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(category.get(), "Category found"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Category not found with name: " + name));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to retrieve category", e.getMessage()));
        }
    }

    // POST /api/categories - Tạo category mới
    @PostMapping
    public ResponseEntity<ApiResponse<Category>> createCategory(@Valid @RequestBody CategoryRequest categoryRequest) {
        try {
            System.out.println("Vào controller");
            Category savedCategory = categoryService.createCategory(categoryRequest);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(savedCategory, "Category created successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create category", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Internal server error", e.getMessage()));
        }
    }

    // PUT /api/categories/{id} - Cập nhật category
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> updateCategory(@PathVariable Long id,
                                                                @Valid @RequestBody Category categoryDetails) {
        try {
            Category updatedCategory = categoryService.updateCategory(id, categoryDetails);
            return ResponseEntity.ok(ApiResponse.success(updatedCategory, "Category updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update category", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Internal server error", e.getMessage()));
        }
    }

    // DELETE /api/categories/{id} - Xóa category
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Category deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to delete category", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Internal server error", e.getMessage()));
        }
    }

    // GET /api/categories/search?keyword={keyword} - Tìm kiếm category
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Category>>> searchCategories(@RequestParam String keyword) {
        try {
            List<Category> categories = categoryService.searchCategories(keyword);
            return ResponseEntity.ok(ApiResponse.success(categories,
                    "Found " + categories.size() + " categories matching keyword: " + keyword));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to search categories", e.getMessage()));
        }
    }

    // GET /api/categories/exists/{id} - Kiểm tra category có tồn tại không
    @GetMapping("/exists/{id}")
    public ResponseEntity<ApiResponse<Boolean>> existsById(@PathVariable Long id) {
        try {
            boolean exists = categoryService.existsById(id);
            String message = exists ? "Category exists" : "Category does not exist";
            return ResponseEntity.ok(ApiResponse.success(exists, message));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to check category existence", e.getMessage()));
        }
    }

    // GET /api/categories/count - Đếm tổng số categories
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> countCategories() {
        try {
            long count = categoryService.countCategories();
            return ResponseEntity.ok(ApiResponse.success(count, "Total categories: " + count));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to count categories", e.getMessage()));
        }
    }
}