package com.example.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontendController {
    @GetMapping(value = {"/", "/{path:^(?!api|static|actuator|webjars|index\\.html).*}/**"})
    public String forwardToIndex() {
        return "forward:/index.html"; // Chuyển hướng về index.html
    }
}