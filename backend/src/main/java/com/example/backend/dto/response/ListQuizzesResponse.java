package com.example.backend.dto.response;

import lombok.Data;

@Data
public class ListQuizzesResponse {
    private long id;
    private String title;
    private String description;
    private String avatar;

    public ListQuizzesResponse() {}
    public ListQuizzesResponse(long id, String title, String description, String avatar) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.avatar = avatar;
    }
}
