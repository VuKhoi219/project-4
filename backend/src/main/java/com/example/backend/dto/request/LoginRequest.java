package com.example.backend.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class LoginRequest {

    @NotBlank(message = "Username or email cannot be empty")
    private String username; // Có thể là username hoặc email

    @NotBlank(message = "Password cannot be empty")
    private String password;
}