package com.example.backend.controller;

import com.example.backend.dto.request.FinalResultRequest;
import com.example.backend.dto.response.FinalResultResponse;
import com.example.backend.entity.User;
import com.example.backend.service.FinalResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/final-result")
@RequiredArgsConstructor
public class FinalResultController {

    private final FinalResultService finalResultService;

    @PostMapping
    public ResponseEntity<FinalResultResponse> addFinalResult(@RequestBody FinalResultRequest finalResultRequest,
                                                              @AuthenticationPrincipal User currentUser) {
        FinalResultResponse savedResult = finalResultService.saveFinalResult(finalResultRequest, currentUser);
        return new ResponseEntity<>(savedResult, HttpStatus.CREATED);
    }

}