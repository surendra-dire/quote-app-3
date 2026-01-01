package com.example.quotes.controller;

import com.example.quotes.model.Quote;
import com.example.quotes.model.User;
import com.example.quotes.repository.QuoteRepository;
import com.example.quotes.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quotes")
@CrossOrigin(origins = "http://localhost:3000") // allow React frontend
public class QuoteController {

    @Autowired
    private QuoteRepository quoteRepo;

    @Autowired
    private UserRepository userRepo;

    @GetMapping("/{userId}")
    public List<Quote> getQuotes(@PathVariable Long userId) {
        return quoteRepo.findByUserId(userId);
    }

    @PostMapping("/{userId}")
    public Quote addQuote(@PathVariable Long userId, @RequestBody Quote quote) {
        User user = userRepo.findById(userId).orElseThrow();
        quote.setUser(user);
        return quoteRepo.save(quote);
    }

    @PutMapping("/{id}")
    public Quote update(@PathVariable Long id, @RequestBody Quote quote) {
        Quote q = quoteRepo.findById(id).orElseThrow();
        q.setText(quote.getText());
        return quoteRepo.save(q);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        quoteRepo.deleteById(id);
    }
}
