package com.example.backend.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordUtil {
    private final BCryptPasswordEncoder passwordEncoder;

    public PasswordUtil() {
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * Hàm hash mật khẩu sử dụng BCrypt.
     *
     * @param rawPassword Mật khẩu gốc (plain text)
     * @return Chuỗi mật khẩu đã được hash
     */
    public String hashPassword(String rawPassword) {
        if (rawPassword == null || rawPassword.isEmpty()) {
            throw new IllegalArgumentException("Mật khẩu không được để trống");
        }
        return passwordEncoder.encode(rawPassword);
    }

    /**
     * Hàm kiểm tra mật khẩu gốc có khớp với mật khẩu đã hash hay không.
     *
     * @param rawPassword Mật khẩu gốc (plain text)
     * @param hashedPassword Mật khẩu đã được hash
     * @return true nếu khớp, false nếu không khớp
     */
    public boolean matches(String rawPassword, String hashedPassword) {
        if (rawPassword == null || hashedPassword == null) {
            return false;
        }
        return passwordEncoder.matches(rawPassword, hashedPassword);
    }

}
