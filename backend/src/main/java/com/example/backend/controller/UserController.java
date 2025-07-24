package com.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


@RestController
//@RequestMapping("/api/users")
//@CrossOrigin(origins = {"http://localhost:3000"}) // Chỉ định cụ thể origin
@RequiredArgsConstructor
public class UserController {
//
//    private final UserService userService;
//
//    /**
//     * Lấy profile của user hiện tại (từ JWT token)
//     * Bảo mật: User chỉ có thể xem profile của chính mình
//     */
//    @GetMapping("/profile")
//    public ResponseEntity<ApiResponse<User>> getProfile(Authentication authentication) {
//        try {
//            // Lấy email từ JWT token đã được xác thực
//            String email = authentication.getName();
//
//            User user = userService.getUserByEmail(email);
//
//            // Không trả về password hash để bảo mật
//            user.setPasswordHash(null);
//
//            return ResponseEntity.ok(
//                    ApiResponse.success(user, "Profile retrieved successfully")
//            );
//
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                    .body(ApiResponse.error(e.getMessage()));
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(ApiResponse.error("Failed to retrieve profile", "Internal server error"));
//        }
//    }
//
//    /**
//     * Cập nhật profile của user hiện tại
//     * Bảo mật: User chỉ có thể cập nhật profile của chính mình
//     */
//    @PutMapping("/profile")
//    public ResponseEntity<ApiResponse<User>> updateProfile(
//            Authentication authentication,
//            @Valid @RequestBody UpdateProfileRequest request) {
//        try {
//            // Lấy email từ JWT token
//            String email = authentication.getName();
//            User currentUser = userService.getUserByEmail(email);
//
//            // Tạo user object với thông tin cần cập nhật
//            User updatedUser = new User();
//            updatedUser.setFullName(request.getFullName());
//            updatedUser.setEmail(request.getEmail());
//
//            // Cập nhật profile
//            User user = userService.updateUserProfile(currentUser.getId(), updatedUser);
//
//            // Không trả về password hash
//            user.setPasswordHash(null);
//
//            return ResponseEntity.ok(
//                    ApiResponse.success(user, "Profile updated successfully")
//            );
//
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(ApiResponse.error(e.getMessage()));
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(ApiResponse.error("Failed to update profile", "Internal server error"));
//        }
//    }
//
//    /**
//     * Thay đổi mật khẩu
//     */
//    @PostMapping("/change-password")
//    public ResponseEntity<ApiResponse<String>> changePassword(
//            Authentication authentication,
//            @RequestBody @Valid ChangePasswordRequest request) {
//        try {
//            String email = authentication.getName();
//            User currentUser = userService.getUserByEmail(email);
//
//            userService.changePassword(
//                    currentUser.getId(),
//                    request.getCurrentPassword(),
//                    request.getNewPassword()
//            );
//
//            return ResponseEntity.ok(
//                    ApiResponse.success(null, "Password changed successfully")
//            );
//
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(ApiResponse.error(e.getMessage()));
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(ApiResponse.error("Failed to change password", "Internal server error"));
//        }
//    }
//
//    /**
//     * Vô hiệu hóa tài khoản (soft delete)
//     */
//    @PostMapping("/deactivate")
//    public ResponseEntity<ApiResponse<String>> deactivateAccount(Authentication authentication) {
//        try {
//            String email = authentication.getName();
//            User currentUser = userService.getUserByEmail(email);
//
//            userService.deactivateUser(currentUser.getId());
//
//            return ResponseEntity.ok(
//                    ApiResponse.success(null, "Account deactivated successfully")
//            );
//
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(ApiResponse.error("Failed to deactivate account", "Internal server error"));
//        }
//    }
}