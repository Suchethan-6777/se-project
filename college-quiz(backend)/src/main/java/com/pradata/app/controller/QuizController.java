package com.pradata.app.controller;

import com.pradata.app.model.QuestionWrapper;
import com.pradata.app.model.Quiz;
import com.pradata.app.model.Response;
import com.pradata.app.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quiz")
public class QuizController {
    @Autowired
    QuizService quizService;
    @PostMapping("/create")
    public ResponseEntity<String> createQuiz(@RequestParam String category,@RequestParam int noOfQuestions,@RequestParam String title){
        return quizService.createQuiz(category,noOfQuestions,title);
    }
    @GetMapping("/get/all")
    public List<Quiz> getAllQuizzess(){
        return quizService.getAllQuizzes();
    }
    @GetMapping("/get/{id}")
    public ResponseEntity<List<QuestionWrapper>> getQuizQuestions(@PathVariable int id){
        //To client i want to send all the attributes in question table except the right answer well that's harmful
        // So creating a wrapper class of the Question class
        return quizService.getQuizQuestions(id);

    }

    @PostMapping("/submit/{id}")
    public ResponseEntity<Integer> submitQuiz(@PathVariable int id,@RequestBody List<Response> responses){
        return quizService.calculateResult(id,responses);
    }
}
