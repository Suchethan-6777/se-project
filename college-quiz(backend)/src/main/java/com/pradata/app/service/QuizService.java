package com.pradata.app.service;

import com.pradata.app.model.*;
import com.pradata.app.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private static final Logger logger = LoggerFactory.getLogger(QuizService.class);

    @Autowired private QuizDao quizDao;
    @Autowired private QuestionDao questionDao;
    @Autowired private UserDao userDao;
    @Autowired private QuizAttemptDao quizAttemptDao;

    @Transactional
    public ResponseEntity<Quiz> createOrUpdateQuiz(Quiz quiz, String userEmail) {
        if (quiz == null || !StringUtils.hasText(userEmail)) {
            logger.warn("createOrUpdateQuiz called with null quiz or email");
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        Optional<User> creatorOpt = userDao.findByEmail(userEmail);
        if (creatorOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User not found
        }
        User creator = creatorOpt.get();

        boolean isAdmin = "Admin".equals(creator.getRole());
        // --- FACULTY DOMAIN CHECK - COMMENTED OUT FOR TESTING ---
        /*
        boolean isFacultyWithDomain = "Faculty".equals(creator.getRole()) && userEmail.endsWith("@nitw.ac.in");
        */
        boolean isFacultyWithDomain = "Faculty".equals(creator.getRole()); // TESTING: Allow any faculty email
        // --- END OF COMMENTED OUT BLOCK ---

        if (!(isAdmin || isFacultyWithDomain)) {
            logger.warn("Unauthorized attempt to create/update quiz by user: {}", userEmail);
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<Question> fetchedQuestions = new ArrayList<>();
        if (!CollectionUtils.isEmpty(quiz.getQuestions())) {
            List<Integer> questionIds = quiz.getQuestions().stream()
                    .filter(q -> q != null && q.getId() > 0)
                    .map(Question::getId)
                    .distinct()
                    .collect(Collectors.toList());
            if (!questionIds.isEmpty()) {
                long count = questionDao.countByIdIn(questionIds);
                if (count != questionIds.size()) {
                    logger.warn("Attempt to create/update quiz (ID: {}) with non-existent question IDs by {}", quiz.getId(), userEmail);
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                fetchedQuestions = questionDao.findAllById(questionIds);
            }
        }
        quiz.setQuestions(fetchedQuestions);

        try {
            if (quiz.getId() != null) { // Update
                Optional<Quiz> existingQuizOpt = quizDao.findById(quiz.getId());
                if (existingQuizOpt.isEmpty()) {
                    logger.warn("Attempt to update non-existent quiz with ID: {}", quiz.getId());
                    return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                }
                Quiz existingQuiz = existingQuizOpt.get();
                if (!isAdmin && (existingQuiz.getCreatedBy() == null || !existingQuiz.getCreatedBy().getEmail().equals(userEmail))) {
                    logger.warn("Unauthorized attempt to update quiz {} by non-owner faculty: {}", quiz.getId(), userEmail);
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                }
                quiz.setCreatedBy(existingQuiz.getCreatedBy());
            } else { // Create
                quiz.setCreatedBy(creator);
            }

            if (!StringUtils.hasText(quiz.getStatus())) quiz.setStatus("DRAFT");
            if (quiz.getStartTime() != null && quiz.getEndTime() != null && quiz.getStartTime().isAfter(quiz.getEndTime())) {
                logger.warn("Attempt to create/update quiz {} with start time after end time.", quiz.getId());
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            Quiz savedQuiz = quizDao.save(quiz);
            logger.info("Quiz {} successfully by user {}", (savedQuiz.getId() == null ? "created with ID " + savedQuiz.getId() : "updated"), userEmail);
            return new ResponseEntity<>(savedQuiz, (quiz.getId() == null) ? HttpStatus.CREATED : HttpStatus.OK);

        } catch (Exception e) {
            logger.error("Error saving quiz (ID: {}) for user {}: {}", quiz.getId(), userEmail, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<List<Quiz>> getQuizzesByCreator(String userEmail) {
        Optional<User> creatorOpt = userDao.findByEmail(userEmail);
        if (creatorOpt.isEmpty()) return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        User creator = creatorOpt.get();

        boolean isAdmin = "Admin".equals(creator.getRole());
        // --- FACULTY DOMAIN CHECK - COMMENTED OUT FOR TESTING ---
        // boolean isFacultyWithDomain = "Faculty".equals(creator.getRole()) && userEmail.endsWith("@nitw.ac.in");
        boolean isFacultyWithDomain = "Faculty".equals(creator.getRole()); // TESTING
        // --- END OF COMMENTED OUT BLOCK ---

        if (!(isAdmin || isFacultyWithDomain)) {
            logger.warn("Unauthorized attempt to get quizzes by creator: {}", userEmail);
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        try {
            List<Quiz> quizzes = quizDao.findByCreatedBy(creator);
            return new ResponseEntity<>(quizzes, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error fetching quizzes for creator {}: {}", userEmail, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public ResponseEntity<String> deleteQuiz(Integer quizId, String userEmail) {
        if (quizId == null) return new ResponseEntity<>("Quiz ID cannot be null", HttpStatus.BAD_REQUEST);

        Optional<Quiz> quizOpt = quizDao.findById(quizId);
        if (quizOpt.isEmpty()) return new ResponseEntity<>("Quiz not found", HttpStatus.NOT_FOUND);

        Optional<User> userOpt = userDao.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            logger.warn("Attempt to delete quiz {} by non-existent user {}", quizId, userEmail);
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        User user = userOpt.get();

        boolean isAdmin = "Admin".equals(user.getRole());
        boolean isOwner = quizOpt.get().getCreatedBy() != null && quizOpt.get().getCreatedBy().getEmail().equals(userEmail);

        // --- FACULTY DOMAIN CHECK - COMMENTED OUT FOR TESTING ---
        // boolean isFacultyOwnerWithDomain = isOwner && "Faculty".equals(user.getRole()) && userEmail.endsWith("@nitw.ac.in");
        boolean isFacultyOwnerWithDomain = isOwner && "Faculty".equals(user.getRole()); // TESTING
        // --- END OF COMMENTED OUT BLOCK ---

        if (!isAdmin && !isFacultyOwnerWithDomain) {
            logger.warn("Unauthorized attempt to delete quiz {} by user {}", quizId, userEmail);
            return new ResponseEntity<>("Not authorized to delete this quiz", HttpStatus.FORBIDDEN);
        }

        try {
            quizAttemptDao.deleteByQuizId(quizId); // Call this first
            quizDao.deleteById(quizId);
            logger.info("Quiz {} deleted by user {}", quizId, userEmail);
            return new ResponseEntity<>("Quiz deleted successfully", HttpStatus.OK);
        } catch (DataIntegrityViolationException e) {
            logger.error("Cannot delete quiz {} because it has related data: {}", quizId, e.getMessage());
            return new ResponseEntity<>("Cannot delete quiz as it may have existing attempts or other dependencies.", HttpStatus.CONFLICT);
        } catch (Exception e) {
            logger.error("Error deleting quiz {}: {}", quizId, e.getMessage(), e);
            return new ResponseEntity<>("Failed to delete quiz: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- THIS IS THE CORRECTED AND EFFICIENT METHOD ---
    public ResponseEntity<List<Quiz>> getAssignedQuizzesForUser(String userEmail) {
        if (!StringUtils.hasText(userEmail)) {
            return new ResponseEntity<>(Collections.emptyList(), HttpStatus.BAD_REQUEST);
        }

        LocalDateTime now = LocalDateTime.now();
        List<Quiz> allActiveQuizzes;
        try {
            // 1. Fetch ONLY published, active quizzes from the DB
            allActiveQuizzes = quizDao.findByStatusAndStartTimeBeforeAndEndTimeAfter("PUBLISHED", now, now);
        } catch (Exception e) {
            logger.error("Error fetching active quizzes: {}", e.getMessage(), e);
            return new ResponseEntity<>(Collections.emptyList(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        final String userEmailLower = userEmail.toLowerCase();
        final String userIdentifier;
        final boolean isStudent = userEmailLower.endsWith("@student.nitw.ac.in");

        // 2. Determine the user's identifier (roll number or email)
        if (isStudent) {
            String emailPrefix = userEmailLower.substring(0, userEmailLower.indexOf("@student.nitw.ac.in"));
            userIdentifier = (emailPrefix.length() > 2) ? emailPrefix.substring(2) : emailPrefix;
        } else {
            userIdentifier = userEmailLower;
        }

        if (userIdentifier.isEmpty()) {
            logger.warn("Could not extract identifier for email: {}", userEmail);
            return new ResponseEntity<>(Collections.emptyList(), HttpStatus.OK);
        }

        // 3. Filter the active quizzes in memory based on assignment criteria
        List<Quiz> assignedQuizzes = allActiveQuizzes.stream()
                .filter(quiz -> {
                    String criteriaString = quiz.getAssignmentCriteria();
                    if (!StringUtils.hasText(criteriaString)) return true; // No criteria = available to all

                    List<String> criteriaList = Arrays.asList(criteriaString.toLowerCase().split("\\s*,\\s*"));

                    return criteriaList.stream().anyMatch(criteria ->
                            isStudent ? (userIdentifier.startsWith(criteria) || userIdentifier.equals(criteria)) // Student logic
                                    : userIdentifier.equals(criteria) // Non-student logic (exact email match)
                    );
                })
                .collect(Collectors.toList());

        // 4. Add Drafts (only for Admin or creator)
        // This is safer because it only runs if the user is not a student
        // and doesn't make DB calls in a loop.
        if (!isStudent) {
            try {
                Optional<User> callingUserOpt = userDao.findByEmail(userEmailLower);
                if (callingUserOpt.isPresent()) {
                    boolean isCallerAdmin = "Admin".equals(callingUserOpt.get().getRole());
                    List<Quiz> draftQuizzes = quizDao.findByStatus("DRAFT");

                    for (Quiz draft : draftQuizzes) {
                        boolean isOwner = draft.getCreatedBy() != null && draft.getCreatedBy().getEmail() != null &&
                                draft.getCreatedBy().getEmail().equalsIgnoreCase(userEmailLower);

                        if (isCallerAdmin || isOwner) {
                            // Add if not already in the list (e.g., if a published quiz was also a draft somehow)
                            if (assignedQuizzes.stream().noneMatch(q -> q.getId().equals(draft.getId()))) {
                                assignedQuizzes.add(draft);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                logger.error("Error fetching draft quizzes for user {}: {}", userEmail, e.getMessage(), e);
                // Don't fail the whole request, just return what we have
            }
        }

        return new ResponseEntity<>(assignedQuizzes, HttpStatus.OK);
    }
    // --- END OF CORRECTED METHOD ---

    // This is the old, incorrect method. Remove it.
    // public ResponseEntity<List<Quiz>> getAvailableQuizzes() {
    //    return new ResponseEntity<>(quizDao.findByStatusAndStartTimeBeforeAndEndTimeAfter("PUBLISHED", LocalDateTime.now(), LocalDateTime.now()), HttpStatus.OK);
    // }

    @Transactional
    public ResponseEntity<?> startQuiz(int quizId, String userEmail) {
        Optional<Quiz> quizOpt = quizDao.findById(quizId);
        User student = userDao.findByEmail(userEmail).orElse(null);
        if (quizOpt.isEmpty() || student == null) {
            logger.warn("Attempt to start non-existent quiz {} or by non-existent user {}", quizId, userEmail);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Quiz quiz = quizOpt.get();

        boolean alreadyAttempted = quizAttemptDao.existsByQuizIdAndStudentIdAndSubmissionTimeIsNotNull(quizId, student.getId());
        if (alreadyAttempted) {
            logger.info("User {} attempted to restart already submitted quiz {}", userEmail, quizId);
            return new ResponseEntity<>("Quiz already attempted", HttpStatus.CONFLICT);
        }

        LocalDateTime now = LocalDateTime.now();
        if (!"PUBLISHED".equals(quiz.getStatus())) {
            logger.info("User {} attempted to start non-published quiz {}", userEmail, quizId);
            return new ResponseEntity<>("Quiz is not published or is no longer active", HttpStatus.FORBIDDEN);
        }
        if (quiz.getStartTime() == null || quiz.getEndTime() == null) {
            logger.info("User {} attempted to start quiz {} which has no time window defined", userEmail, quizId);
            return new ResponseEntity<>("Quiz is not available for attempts (time window not defined)", HttpStatus.FORBIDDEN);
        }
        if (now.isBefore(quiz.getStartTime())) {
            logger.info("User {} attempted to start quiz {} before start time", userEmail, quizId);
            return new ResponseEntity<>("Quiz has not started yet", HttpStatus.FORBIDDEN);
        }
        if (now.isAfter(quiz.getEndTime())) {
            logger.info("User {} attempted to start quiz {} after end time", userEmail, quizId);
            return new ResponseEntity<>("Quiz has already ended", HttpStatus.FORBIDDEN);
        }

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setStudent(student);
        attempt.setStartTime(LocalDateTime.now());
        QuizAttempt savedAttempt;
        try {
            savedAttempt = quizAttemptDao.save(attempt);
        } catch (Exception e) {
            logger.error("Error saving new quiz attempt for user {}, quiz {}: {}", userEmail, quizId, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        List<QuestionWrapper> questionsForUser = new ArrayList<>();
        List<Question> originalQuestions;
        try {
            originalQuestions = new ArrayList<>(quiz.getQuestions());
            originalQuestions.size(); // Force initialization
        } catch (Exception e) {
            logger.error("Error loading questions for quiz {} during start attempt: {}", quizId, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }


        Collections.shuffle(originalQuestions);

        for (Question q : originalQuestions) {
            List<String> options = new ArrayList<>(Arrays.asList(q.getOption1(), q.getOption2(), q.getOption3(), q.getOption4()));
            options.removeIf(Objects::isNull);
            Collections.shuffle(options);
            questionsForUser.add(new QuestionWrapper(q.getId(), q.getQuestionTitle(),
                    options.size() > 0 ? options.get(0) : null,
                    options.size() > 1 ? options.get(1) : null,
                    options.size() > 2 ? options.get(2) : null,
                    options.size() > 3 ? options.get(3) : null));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("attemptId", savedAttempt.getId());
        response.put("quiz", quiz);
        response.put("questions", questionsForUser);
        logger.info("User {} started attempt {} for quiz {}", userEmail, savedAttempt.getId(), quizId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<Integer> calculateResult(Long attemptId, List<Response> responses, String userEmail) {
        if (attemptId == null) return new ResponseEntity<>(-1, HttpStatus.BAD_REQUEST);

        Optional<QuizAttempt> attemptOpt = quizAttemptDao.findById(attemptId);
        if (attemptOpt.isEmpty()) {
            logger.warn("Attempt to submit non-existent attempt ID {}", attemptId);
            return new ResponseEntity<>(-1, HttpStatus.NOT_FOUND);
        }
        QuizAttempt attempt = attemptOpt.get();
        User student = attempt.getStudent();
        if (student == null || !student.getEmail().equals(userEmail)) {
            logger.warn("Unauthorized attempt to submit attempt ID {} by user {}", attemptId, userEmail);
            return new ResponseEntity<>(-1, HttpStatus.FORBIDDEN);
        }


        if (attempt.getSubmissionTime() != null) {
            logger.info("Attempt {} already submitted, returning existing score.", attemptId);
            return new ResponseEntity<>(attempt.getScore() != null ? attempt.getScore() : -1, HttpStatus.OK);
        }

        Quiz quiz = attempt.getQuiz();
        if (quiz == null) {
            logger.error("Quiz object not found for attempt ID {}", attemptId);
            return new ResponseEntity<>(-1, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        long minutesElapsed = ChronoUnit.MINUTES.between(attempt.getStartTime(), LocalDateTime.now());

        if (minutesElapsed > quiz.getDurationInMinutes() + 1) {
            logger.info("Attempt {} submitted late by user {}", attemptId, userEmail);
            attempt.setScore(0);
            attempt.setSubmissionTime(LocalDateTime.now());
            quizAttemptDao.save(attempt);
            return new ResponseEntity<>(0, HttpStatus.REQUEST_TIMEOUT);
        }

        List<Question> questions = quiz.getQuestions();
        if (CollectionUtils.isEmpty(questions)) {
            logger.warn("Quiz {} for attempt {} has no questions during calculation.", quiz.getId(), attemptId);
            attempt.setScore(0);
            attempt.setSubmissionTime(LocalDateTime.now());
            quizAttemptDao.save(attempt);
            return new ResponseEntity<>(0, HttpStatus.OK);
        }
        Map<Integer, String> correctAnswers = new HashMap<>();
        for(Question q : questions) correctAnswers.put(q.getId(), q.getRightAnswer());

        int score = 0;
        if (responses != null) {
            for (Response res : responses) {
                if (correctAnswers.containsKey(res.getId()) &&
                        res.getResponse() != null &&
                        correctAnswers.get(res.getId()).equals(res.getResponse())) {
                    score++;
                }
            }
        }

        attempt.setScore(score);
        attempt.setSubmissionTime(LocalDateTime.now());
        try {
            quizAttemptDao.save(attempt);
            logger.info("Attempt {} submitted by user {} with score {}", attemptId, userEmail, score);
            return new ResponseEntity<>(score, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error saving score for attempt {}: {}", attemptId, e.getMessage(), e);
            return new ResponseEntity<>(-1, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<List<SubmissionResultDto>> getSubmissionsForQuiz(Integer quizId, String userEmail) {
        if (quizId == null) return new ResponseEntity<>(HttpStatus.BAD_REQUEST);

        Optional<Quiz> quizOpt = quizDao.findById(quizId);
        if (quizOpt.isEmpty()) return new ResponseEntity<>(HttpStatus.NOT_FOUND);

        Optional<User> userOpt = userDao.findByEmail(userEmail);
        if (userOpt.isEmpty()) return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        User user = userOpt.get();

        boolean isAdmin = "Admin".equals(user.getRole());
        boolean isOwner = quizOpt.get().getCreatedBy() != null && quizOpt.get().getCreatedBy().getEmail().equals(userEmail);

        if (!isAdmin && !isOwner) {
            logger.warn("Unauthorized attempt to view submissions for quiz {} by user {}", quizId, userEmail);
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        try {
            List<QuizAttempt> attempts = quizAttemptDao.findByQuizId(quizId);
            List<SubmissionResultDto> results = attempts.stream()
                    .filter(a -> a.getSubmissionTime() != null && a.getStudent() != null && a.getQuiz() != null)
                    .map(attempt -> new SubmissionResultDto(
                            attempt.getStudent().getName(),
                            attempt.getScore(),
                            attempt.getQuiz().getTotalMarks(),
                            attempt.getSubmissionTime()))
                    .collect(Collectors.toList());
            return new ResponseEntity<>(results, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error fetching submissions for quiz {}: {}", quizId, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<QuizAttempt> getStudentAttempt(Long attemptId, String userEmail) {
        if (attemptId == null || !StringUtils.hasText(userEmail)) return new ResponseEntity<>(HttpStatus.BAD_REQUEST);

        Optional<QuizAttempt> attemptOpt = quizAttemptDao.findById(attemptId);
        if (attemptOpt.isEmpty()) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        QuizAttempt attempt = attemptOpt.get();

        if (attempt.getStudent() == null || !attempt.getStudent().getEmail().equals(userEmail)) {
            logger.warn("Unauthorized attempt to view attempt {} by user {}", attemptId, userEmail);
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return new ResponseEntity<>(attempt, HttpStatus.OK);
    }
}