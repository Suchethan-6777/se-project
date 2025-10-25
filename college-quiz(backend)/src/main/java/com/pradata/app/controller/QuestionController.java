package com.pradata.app.controller;

import com.pradata.app.model.Question;
import com.pradata.app.service.QuestionService;
import jakarta.validation.Valid; // Import jakarta validation
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {
    @Autowired
    QuestionService questionService;

    @GetMapping("/all")
    public ResponseEntity<List<Question>> getAllQuestions(){
        return questionService.getAllQuestions();
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Question>> getQuestionsByCategory(@PathVariable String category){
        return questionService.getQuestionsByCategory(category);
    }

    @PostMapping("/add")
    public ResponseEntity<String> addQuestion(@Valid @RequestBody Question question){ // Add @Valid
        return questionService.addQuestion(question);
    }

    @PutMapping("/replace/{id}")
    public ResponseEntity<String> replaceQuestion(@PathVariable int id, @Valid @RequestBody Question updatedQuestion){ // Add @Valid
        return questionService.replaceQuestion(id,updatedQuestion);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteQuestion(@PathVariable int id){
        return questionService.deleteQuestion(id);
    }
}