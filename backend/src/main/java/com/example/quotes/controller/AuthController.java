package com.example.quotes.controller;

import com.example.quotes.dto.LoginRequest;
import com.example.quotes.model.User;
import com.example.quotes.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepo;

    @PostMapping("/login")
    public User login(@RequestBody LoginRequest request) {

        System.out.println("LOGIN USERNAME = " + request.getUsername());
        System.out.println("LOGIN PASSWORD = " + request.getPassword());

        User found = userRepo.findByUsername(request.getUsername());

        if (found != null && found.getPassword().equals(request.getPassword())) {
            return found;
        }

        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Invalid username or password"
        );
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userRepo.save(user);
    }
}
