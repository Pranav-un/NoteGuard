package com.noteguard.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class FrontendController {

    /**
     * Forward any unmapped paths (except API and static resources) to index.html
     * This enables client-side routing for the React app
     */
    @RequestMapping(value = {
        "/", 
        "/login", 
        "/register", 
        "/dashboard", 
        "/note/**", 
        "/shared/**", 
        "/admin"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
