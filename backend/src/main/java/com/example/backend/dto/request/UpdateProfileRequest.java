package com.example.backend.dto.request;

import lombok.Data;
import javax.validation.constraints.*;

@Data
public class UpdateProfileRequest {

    @Email(message = "Email should be valid")
    @NotBlank(message = "Email cannot be empty")
    private String email;

    @NotBlank(message = "Full name cannot be empty")
    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;
}

