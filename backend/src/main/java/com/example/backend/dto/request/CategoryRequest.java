package com.example.backend.dto.request;

import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
public class CategoryRequest {
    @NotBlank(message = "Name cannot be empty")
    @Size(min =1 , max = 100, message = "Username must be between 1 and 100 characters")
    private String name;
    private String description;
}
