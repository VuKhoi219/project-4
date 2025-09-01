package com.example.backend.dto.response;

import lombok.Data;

@Data
public class ResponseQuizHot {
    private long id;
    private String title;
    private String description;
    private long totalPlays;   // 👈 thêm field này

    public ResponseQuizHot() {}
    public ResponseQuizHot(long id, String title, String description, long totalPlays) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.totalPlays = totalPlays;
    }
}
