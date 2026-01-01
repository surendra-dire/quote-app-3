package com.example.quotes.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quotes")
public class Quote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String text;
    
    // 1. ADD THIS FIELD (JPA will map it to the 'author' column automatically)
    private String author;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Long getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    // 2. ADD THIS GETTER
    public String getAuthor() {
        return author;
    }

    // 3. ADD THIS SETTER
    public void setAuthor(String author) {
        this.author = author;
    }

    public User getUser() {
        return user;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setText(String text) {
        this.text = text;
    }

    public void setUser(User user) {
        this.user = user;
    }
}