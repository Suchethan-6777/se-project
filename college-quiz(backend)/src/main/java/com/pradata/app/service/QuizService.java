package com.pradata.app.service;

import com.pradata.app.model.Question;
import com.pradata.app.model.QuestionWrapper;
import com.pradata.app.model.Quiz;
import com.pradata.app.model.Response;
import com.pradata.app.repository.QuestionDao;
import com.pradata.app.repository.QuizDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuizService {
    @Autowired
    QuizDao quizDao;
    @Autowired
    QuestionDao questionDao;

    public ResponseEntity<String> createQuiz(String category, int noOfQuestions, String title) {
        List<Question> questions = questionDao.findRandomQuestionsByCategory(category,noOfQuestions);
        Quiz quiz = new Quiz();
        quiz.setTitle(title);
        quiz.setQuestions(questions);
        quizDao.save(quiz);
        return new ResponseEntity<>("success", HttpStatus.CREATED);

    }

    public ResponseEntity<List<QuestionWrapper>> getQuizQuestions(int id) {
        Quiz quiz = quizDao.findById(id).orElse(null);
        if(quiz == null){
            return new ResponseEntity<>(new ArrayList<>(),HttpStatus.NOT_FOUND);
        }
        List<Question> questionsFromDB = quiz.getQuestions();
        List<QuestionWrapper> questionsForUser = new ArrayList<>();
        for(Question q : questionsFromDB){
            QuestionWrapper qw = new QuestionWrapper(q.getId(),q.getQuestionTitle(),q.getOption1(),q.getOption2(),q.getOption3(),q.getOption4());
            questionsForUser.add(qw);
        }

        return new ResponseEntity<>(questionsForUser,HttpStatus.OK);
    }

    public ResponseEntity<Integer> calculateResult(int id, List<Response> responses) {
        Quiz quiz = quizDao.findById(id).orElse(null);
        if(quiz == null){return new ResponseEntity<>(-1,HttpStatus.NOT_FOUND);}
        List<Question> questions = quiz.getQuestions();
        int result = 0;
        for(int i = 0;i < questions.size();i++){
            if(questions.get(i).getRightAnswer().equals(responses.get(i).getResponse())){result++;}
        }
        return new ResponseEntity<>(result,HttpStatus.OK);
    }

    public List<Quiz> getAllQuizzes() {
        return quizDao.findAll();
    }


}
