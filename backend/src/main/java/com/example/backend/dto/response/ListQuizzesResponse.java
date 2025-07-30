package com.example.backend.dto.response;

import lombok.Data;

@Data
public class ListQuizzesResponse {
    private long id;
    private String title;
    private String description;

    public ListQuizzesResponse() {}
    public ListQuizzesResponse(long id, String title, String description) {
        this.id = id;
        this.title = title;
        this.description = description;
    }
}
