package com.pradata.app.service;

import com.pradata.app.model.Question;
import com.pradata.app.repository.QuestionDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuestionService {
    @Autowired
    QuestionDao questionDao;

    public ResponseEntity<List<Question>> getAllQuestions(){
        try{

            return new ResponseEntity<>(questionDao.findAll(), HttpStatus.OK);
        }
        catch (Exception e){
            e.printStackTrace();
        }
        return new ResponseEntity<>(new ArrayList<>(),HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<List<Question>> getQuestionsByCategory(String category) {

        try{

            return new ResponseEntity<>(questionDao.findByCategory(category),HttpStatus.OK);
        }
        catch (Exception e){
            e.printStackTrace();
        }
        return new ResponseEntity<>(new ArrayList<>(),HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<String> addQuestion(Question question){
        try{
            questionDao.save(question);
            return new ResponseEntity<>("Success Added",HttpStatus.CREATED);

        }
        catch(Exception e){
            e.printStackTrace();
        }
        return new ResponseEntity<>("Failure cannot add",HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<String> deleteQuestion(int id) {
        Question existingQuestion = questionDao.findById(id).orElse(null);
        if(existingQuestion == null){
            return new ResponseEntity<>("Nothing there to delete only na",HttpStatus.NOT_FOUND);
        }
        questionDao.deleteById(id);
        return new ResponseEntity<>("Succesfully deleted",HttpStatus.OK);
    }

    public ResponseEntity<String> replaceQuestion(int id, Question updatedQuestion) {
        Question existingQuestion = questionDao.findById(id).orElse(null);
        if(existingQuestion == null){
            return new ResponseEntity<>("Nothing there to replace",HttpStatus.NOT_FOUND);
        }
        existingQuestion.setQuestionTitle(updatedQuestion.getQuestionTitle());
        existingQuestion.setCategory(updatedQuestion.getCategory());
        existingQuestion.setDifficultyLevel(updatedQuestion.getDifficultyLevel());
        existingQuestion.setRightAnswer(updatedQuestion.getRightAnswer());
        existingQuestion.setOption1(updatedQuestion.getOption1());
        existingQuestion.setOption2(updatedQuestion.getOption2());
        existingQuestion.setOption3(updatedQuestion.getOption3());
        existingQuestion.setOption4(updatedQuestion.getOption4());
        questionDao.save(existingQuestion);
        return new ResponseEntity<>("Replacement Done",HttpStatus.OK);
    }
}
