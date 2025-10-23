package com.pradata.app.service;

import com.pradata.app.model.*;
import com.pradata.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuizService {
    @Autowired private QuizDao quizDao;
    @Autowired private QuestionDao questionDao;
    @Autowired private UserDao userDao;
    @Autowired private QuizAttemptDao quizAttemptDao;

    // For Faculty/Admin: Create or Update a Quiz
    public ResponseEntity<Quiz> createOrUpdateQuiz(Quiz quiz, String userEmail) {
        User creator = userDao.findByEmail(userEmail).orElse(null);
        if (creator == null || !Arrays.asList("Faculty", "Admin").contains(creator.getRole())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        quiz.setCreatedBy(creator);
        if (quiz.getStatus() == null) quiz.setStatus("DRAFT");
        Quiz savedQuiz = quizDao.save(quiz);
        Quiz completeQuiz = quizDao.findById(savedQuiz.getId()).orElse(savedQuiz);

        return new ResponseEntity<>(completeQuiz, HttpStatus.CREATED);
    }

    // For Faculty: Get quizzes they created
    public ResponseEntity<List<Quiz>> getQuizzesByCreator(String userEmail) {
        User creator = userDao.findByEmail(userEmail).orElse(null);
        if (creator == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(quizDao.findByCreatedBy(creator), HttpStatus.OK);
    }

    // For Faculty/Admin: Delete a Quiz
    public ResponseEntity<String> deleteQuiz(Integer quizId, String userEmail) {
        Optional<Quiz> quizOpt = quizDao.findById(quizId);
        if (quizOpt.isEmpty()) return new ResponseEntity<>("Quiz not found", HttpStatus.NOT_FOUND);

        User user = userDao.findByEmail(userEmail).get();
        if (!quizOpt.get().getCreatedBy().getEmail().equals(userEmail) && !"Admin".equals(user.getRole())) {
            return new ResponseEntity<>("Not authorized to delete this quiz", HttpStatus.FORBIDDEN);
        }
        quizDao.deleteById(quizId);
        return new ResponseEntity<>("Quiz deleted successfully", HttpStatus.OK);
    }

    // For Student: Get available quizzes
    public ResponseEntity<List<Quiz>> getAvailableQuizzes() {
        return new ResponseEntity<>(quizDao.findByStatusAndStartTimeBeforeAndEndTimeAfter("PUBLISHED", LocalDateTime.now(), LocalDateTime.now()), HttpStatus.OK);
    }

    // For Student: Start a quiz attempt
    public ResponseEntity<?> startQuiz(int quizId, String userEmail) {
        Optional<Quiz> quizOpt = quizDao.findById(quizId);
        User student = userDao.findByEmail(userEmail).orElse(null);
        if (quizOpt.isEmpty() || student == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quizOpt.get());
        attempt.setStudent(student);
        attempt.setStartTime(LocalDateTime.now());
        QuizAttempt savedAttempt = quizAttemptDao.save(attempt);

        List<QuestionWrapper> questionsForUser = new ArrayList<>();
        for (Question q : quizOpt.get().getQuestions()) {
            questionsForUser.add(new QuestionWrapper(q.getId(), q.getQuestionTitle(), q.getOption1(), q.getOption2(), q.getOption3(), q.getOption4()));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("attemptId", savedAttempt.getId());
        response.put("questions", questionsForUser);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // For Student: Submit answers and calculate result
    public ResponseEntity<Integer> calculateResult(Long attemptId, List<Response> responses, String userEmail) {
        Optional<QuizAttempt> attemptOpt = quizAttemptDao.findById(attemptId);
        if (attemptOpt.isEmpty() || !attemptOpt.get().getStudent().getEmail().equals(userEmail)) {
            return new ResponseEntity<>(-1, HttpStatus.FORBIDDEN);
        }

        QuizAttempt attempt = attemptOpt.get();
        Quiz quiz = attempt.getQuiz();

        long minutesElapsed = ChronoUnit.MINUTES.between(attempt.getStartTime(), LocalDateTime.now());
        if (minutesElapsed > quiz.getDurationInMinutes() + 1) { // 1 minute grace period
            return new ResponseEntity<>(-1, HttpStatus.REQUEST_TIMEOUT);
        }

        List<Question> questions = quiz.getQuestions();
        Map<Integer, String> correctAnswers = new HashMap<>();
        for(Question q : questions) correctAnswers.put(q.getId(), q.getRightAnswer());

        int score = 0;
        for (Response res : responses) {
            if (correctAnswers.containsKey(res.getId()) && correctAnswers.get(res.getId()).equals(res.getResponse())) {
                score++;
            }
        }

        attempt.setScore(score);
        attempt.setSubmissionTime(LocalDateTime.now());
        quizAttemptDao.save(attempt);
        return new ResponseEntity<>(score, HttpStatus.OK);
    }

    public ResponseEntity<List<SubmissionResultDto>> getSubmissionsForQuiz(Integer quizId, String userEmail) {
        Optional<Quiz> quizOpt = quizDao.findById(quizId);
        if (quizOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Security check: ensure the request is from the creator or an Admin
        User user = userDao.findByEmail(userEmail).get();
        if (!quizOpt.get().getCreatedBy().getEmail().equals(userEmail) && !"Admin".equals(user.getRole())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<QuizAttempt> attempts = quizAttemptDao.findByQuizId(quizId);
        List<SubmissionResultDto> results = attempts.stream()
                .map(attempt -> new SubmissionResultDto(
                        attempt.getStudent().getName(),
                        attempt.getScore(),
                        attempt.getQuiz().getTotalMarks(),
                        attempt.getSubmissionTime()))
                .collect(Collectors.toList());

        return new ResponseEntity<>(results, HttpStatus.OK);
    }

    // ADDED: Service logic for a student to get their own attempt
    public ResponseEntity<QuizAttempt> getStudentAttempt(Long attemptId, String userEmail) {
        Optional<QuizAttempt> attemptOpt = quizAttemptDao.findById(attemptId);
        if (attemptOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Security check: ensure the student is requesting their own data
        if (!attemptOpt.get().getStudent().getEmail().equals(userEmail)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        return new ResponseEntity<>(attemptOpt.get(), HttpStatus.OK);
    }
}