package com.pradata.app.service;

import com.pradata.app.model.Question;
import com.pradata.app.repository.QuestionDao;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException; // Import for specific delete exception
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuestionService {

    private static final Logger logger = LoggerFactory.getLogger(QuestionService.class);

    @Autowired
    QuestionDao questionDao;

    // @Transactional(readOnly = true)
    public ResponseEntity<List<Question>> getAllQuestions(){
        try{
            List<Question> questions = questionDao.findAll();
            return new ResponseEntity<>(questions, HttpStatus.OK);
        } catch (Exception e){
            logger.error("Error fetching all questions", e);
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // @Transactional(readOnly = true)
    public ResponseEntity<List<Question>> getQuestionsByCategory(String category) {
        if (!StringUtils.hasText(category)) {
            logger.warn("Attempted to fetch questions with blank category");
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.BAD_REQUEST);
        }
        try{
            List<Question> questions = questionDao.findByCategory(category);
            return new ResponseEntity<>(questions,HttpStatus.OK);
        } catch (Exception e){
            logger.error("Error fetching questions for category: {}", category, e);
            return new ResponseEntity<>(new ArrayList<>(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public ResponseEntity<String> addQuestion(Question question){
        if (question == null || !StringUtils.hasText(question.getQuestionTitle()) ||
                !StringUtils.hasText(question.getRightAnswer())) {
            logger.warn("Attempted to add question with missing title or answer");
            return new ResponseEntity<>("Question title and right answer cannot be empty", HttpStatus.BAD_REQUEST);
        }
        // Optional: Add more validation (e.g., at least one option?)
        try{
            Question savedQuestion = questionDao.save(question);
            logger.info("Successfully added new question with ID: {}", savedQuestion.getId());
            return new ResponseEntity<>("Success Added",HttpStatus.CREATED);
        } catch (DataIntegrityViolationException e) {
            logger.error("Data integrity violation while adding question: {}", e.getMessage());
            return new ResponseEntity<>("Failed to add question due to data conflict (e.g., unique constraint).", HttpStatus.CONFLICT);
        } catch(Exception e){
            logger.error("Error adding question", e);
            return new ResponseEntity<>("Failure cannot add question: " + e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public ResponseEntity<String> deleteQuestion(int id) {
        // Use existsById for potentially better performance if question object not needed
        if (!questionDao.existsById(id)) {
            logger.warn("Attempted to delete non-existent question with ID: {}", id);
            return new ResponseEntity<>("Question not found",HttpStatus.NOT_FOUND);
        }
        try {
            questionDao.deleteById(id);
            logger.info("Successfully deleted question with ID: {}", id);
            return new ResponseEntity<>("Successfully deleted",HttpStatus.OK);
        } catch (DataIntegrityViolationException e) { // Catch constraint violation
            logger.error("Cannot delete question {} as it might be in use: {}", id, e.getMessage());
            return new ResponseEntity<>("Failed to delete question, it might be in use by a quiz.", HttpStatus.CONFLICT);
        } catch (EmptyResultDataAccessException e) { // Catch if deleteById fails finding the ID
            logger.warn("Attempted to delete question with ID {} but it was not found during deletion.", id);
            return new ResponseEntity<>("Question not found", HttpStatus.NOT_FOUND);
        } catch (Exception e) { // Catch broader exceptions
            logger.error("Error deleting question with ID: {}", id, e);
            return new ResponseEntity<>("Failed to delete question: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public ResponseEntity<String> replaceQuestion(int id, Question updatedQuestion) {
        if (updatedQuestion == null || !StringUtils.hasText(updatedQuestion.getQuestionTitle()) ||
                !StringUtils.hasText(updatedQuestion.getRightAnswer())) {
            logger.warn("Attempted to update question {} with missing title or answer", id);
            return new ResponseEntity<>("Updated question title and right answer cannot be empty", HttpStatus.BAD_REQUEST);
        }

        return questionDao.findById(id).map(existingQuestion -> {
            // Update fields using values from updatedQuestion
            existingQuestion.setQuestionTitle(updatedQuestion.getQuestionTitle());
            existingQuestion.setCategory(updatedQuestion.getCategory());
            existingQuestion.setDifficultyLevel(updatedQuestion.getDifficultyLevel());
            existingQuestion.setRightAnswer(updatedQuestion.getRightAnswer());
            existingQuestion.setOption1(updatedQuestion.getOption1());
            existingQuestion.setOption2(updatedQuestion.getOption2());
            existingQuestion.setOption3(updatedQuestion.getOption3());
            existingQuestion.setOption4(updatedQuestion.getOption4());
            try {
                questionDao.save(existingQuestion);
                logger.info("Successfully updated question with ID: {}", id);
                return new ResponseEntity<>("Replacement Done",HttpStatus.OK);
            } catch (Exception e) {
                logger.error("Error updating question with ID: {}", id, e);
                return new ResponseEntity<>("Failed to update question: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }).orElseGet(() -> {
            logger.warn("Attempted to update non-existent question with ID: {}", id);
            return new ResponseEntity<>("Question not found", HttpStatus.NOT_FOUND);
        });
    }
}