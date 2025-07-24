package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.utils.PasswordUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

//    private final UserRepository userRepository;
//    private final PasswordEncoder passwordEncoder;
//
//    /**
//     * Tìm user bằng ID
//     */
//    public Optional<User> findById(Long id) {
//        return userRepository.findById(id);
//    }
//
//    /**
//     * Tìm user bằng email
//     */
//    public Optional<User> findByEmail(String email) {
//        return userRepository.findByEmail(email);
//    }
//
//    /**
//     * Tìm user bằng username
//     */
//    public Optional<User> findByUsername(String username) {
//        return userRepository.findByUsername(username);
//    }
//
//    /**
//     * Tìm user bằng email hoặc username (cho login)
//     */
//    public Optional<User> findByEmailOrUsername(String identifier) {
//        return userRepository.findByEmailOrUsername(identifier);
//    }
//
//    /**
//     * Tạo user mới
//     */
//    public User createUser(String username, String email, String rawPassword, String fullName) {
//        // Kiểm tra email đã tồn tại
//        if (userRepository.existsByEmail(email)) {
//            throw new RuntimeException("Email already exists: " + email);
//        }
//
//        // Kiểm tra username đã tồn tại
//        if (userRepository.existsByUsername(username)) {
//            throw new RuntimeException("Username already exists: " + username);
//        }
//
//        // Mã hóa password
//        String hashedPassword = passwordEncoder.encode(rawPassword);
//
//        // Tạo user mới
//        User user = new User(username, email, hashedPassword, fullName);
//
//        return userRepository.save(user);
//    }
//
//    /**
//     * Cập nhật profile user
//     */
//    public User updateUserProfile(Long userId, User updatedUser) {
//        User existingUser = userRepository.findById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
//
//        // Kiểm tra email mới có trùng với user khác không
//        if (!existingUser.getEmail().equals(updatedUser.getEmail())) {
//            if (userRepository.existsByEmail(updatedUser.getEmail())) {
//                throw new RuntimeException("Email already exists: " + updatedUser.getEmail());
//            }
//            existingUser.setEmail(updatedUser.getEmail());
//        }
//
//        // Cập nhật full name
//        if (updatedUser.getFullName() != null && !updatedUser.getFullName().trim().isEmpty()) {
//            existingUser.setFullName(updatedUser.getFullName().trim());
//        }
//
//        return userRepository.save(existingUser);
//    }
//
//    /**
//     * Lấy user từ email (cho Spring Security)
//     */
//    public User getUserByEmail(String email) {
//        return userRepository.findByEmailAndIsActive(email, true)
//                .orElseThrow(() -> new RuntimeException("Active user not found with email: " + email));
//    }
//
//    /**
//     * Thay đổi mật khẩu
//     */
//    public void changePassword(Long userId, String currentPassword, String newPassword) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        // Kiểm tra mật khẩu hiện tại
//        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
//            throw new RuntimeException("Current password is incorrect");
//        }
//
//        // Cập nhật mật khẩu mới
//        user.setPasswordHash(passwordEncoder.encode(newPassword));
//        userRepository.save(user);
//    }
//
//    /**
//     * Vô hiệu hóa tài khoản
//     */
//    public void deactivateUser(Long userId) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        user.setIsActive(false);
//        userRepository.save(user);
//    }
//
//    /**
//     * Kích hoạt tài khoản
//     */
//    public void activateUser(Long userId) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        user.setIsActive(true);
//        userRepository.save(user);
//    }
//
//    /**
//     * Kiểm tra mật khẩu có đúng không
//     */
//    public boolean checkPassword(User user, String rawPassword) {
//        return passwordEncoder.matches(rawPassword, user.getPasswordHash());
//    }
}