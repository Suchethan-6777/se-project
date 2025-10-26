package com.pradata.app.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import com.pradata.app.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Ensure this is imported
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import com.pradata.app.repository.QuestionDao;
import com.pradata.app.repository.QuizAttemptDao;
import com.pradata.app.repository.QuizDao;
import com.pradata.app.repository.UserDao;

@Service
public class QuizService {

    private static final Logger logger = LoggerFactory.getLogger(QuizService.class);

    @Autowired private QuizDao quizDao;
    @Autowired private QuestionDao questionDao;
    @Autowired private UserDao userDao;
    @Autowired private QuizAttemptDao quizAttemptDao;

    @Transactional
// *** MODIFIED SIGNATURE ***
    public ResponseEntity<Quiz> createOrUpdateQuiz(Integer quizId, QuizRequestDto quizDto, String userEmail) {
        // --- 1. Initial Checks ---
        if (quizDto == null || !StringUtils.hasText(userEmail)) {
            logger.warn("createOrUpdateQuiz called with null DTO or email");
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        Optional<User> creatorOpt = userDao.findByEmail(userEmail);
        if (creatorOpt.isEmpty()) { /* ... handle user not found ... */ }
        User creator = creatorOpt.get();
        boolean isAdmin = "Admin".equals(creator.getRole());
        boolean isFacultyWithDomain = "Faculty".equals(creator.getRole());
        if (!(isAdmin || isFacultyWithDomain)) { /* ... handle forbidden ... */ }

        // --- 2. Fetch Questions based on IDs from DTO ---
        List<Question> questionsToAssociate = new ArrayList<>();
        List<Integer> questionIdsFromDto = quizDto.getQuestionIds() != null ? quizDto.getQuestionIds() : Collections.emptyList();

        logger.info("createOrUpdateQuiz - Received DTO with question IDs: {}", questionIdsFromDto); // Use DTO field

        if (!questionIdsFromDto.isEmpty()) {
            questionsToAssociate = questionDao.findAllById(questionIdsFromDto);
            if (questionsToAssociate.size() != questionIdsFromDto.size()) {
                logger.warn("createOrUpdateQuiz - Mismatch fetching questions from DTO IDs.");
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            logger.info("createOrUpdateQuiz - Fetched {} Question entities from DB based on DTO IDs.", questionsToAssociate.size());
        } else {
            logger.info("createOrUpdateQuiz - DTO had no question IDs to associate.");
        }


        // --- 3. Save Logic (Find/Create Entity, Map DTO, Save) ---
        try {
            Quiz quizToSave; // The JPA Entity

            if (quizId != null) { // --- UPDATE PATH ---
                Optional<Quiz> existingQuizOpt = quizDao.findById(quizId);
                if (existingQuizOpt.isEmpty()) { /* ... handle not found ... */ }
                quizToSave = existingQuizOpt.get(); // Load the managed entity

                // Check ownership
                if (!isAdmin && (quizToSave.getCreatedBy() == null || !quizToSave.getCreatedBy().getEmail().equals(userEmail))) {
                    /* ... handle forbidden ... */
                }

                logger.info("Updating existing Quiz ID: {}", quizId);

            } else { // --- CREATE PATH ---
                quizToSave = new Quiz(); // Create a new entity instance
                quizToSave.setCreatedBy(creator);
                logger.info("Creating new Quiz.");
            }

            // *** MAP fields from DTO to the Entity ***
            quizToSave.setTitle(quizDto.getTitle());
            quizToSave.setDescription(quizDto.getDescription());
            quizToSave.setSubject(quizDto.getSubject());
            quizToSave.setDurationInMinutes(quizDto.getDurationInMinutes());
            quizToSave.setTotalMarks(quizDto.getTotalMarks());
            quizToSave.setStartTime(quizDto.getStartTime());
            quizToSave.setEndTime(quizDto.getEndTime());
            quizToSave.setAssignmentCriteria(quizDto.getAssignmentCriteria());
            // Set status carefully (handle null/default)
            quizToSave.setStatus(StringUtils.hasText(quizDto.getStatus()) ? quizDto.getStatus() : "DRAFT");


            // *** Manage the collection on the entity ***
            if (quizToSave.getQuestions() == null) { quizToSave.setQuestions(new ArrayList<>()); }
            quizToSave.getQuestions().clear();
            quizToSave.getQuestions().addAll(questionsToAssociate);
            logger.info("Set {} questions on quizToSave object.", quizToSave.getQuestions().size());


            // --- 4. Common Validation & Save ---
            if (quizToSave.getStartTime() != null && quizToSave.getEndTime() != null && quizToSave.getStartTime().isAfter(quizToSave.getEndTime())) {
                /* ... handle bad request ... */
            }

            logger.info("About to call quizDao.save() for quiz ID: {}", quizToSave.getId());
            Quiz savedQuiz = quizDao.save(quizToSave); // Save the mapped entity
            logger.info("Successfully saved quiz ID: {}. Associated questions count in object: {}", savedQuiz.getId(), savedQuiz.getQuestions().size());

            return new ResponseEntity<>(savedQuiz, (quizId == null) ? HttpStatus.CREATED : HttpStatus.OK);

        } catch (Exception e) {
            logger.error("Error saving quiz from DTO (potential ID: {}): {}", quizId, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read methods use readOnly transaction for performance and LazyInitialization prevention
    @Transactional(readOnly = true)
    public ResponseEntity<List<Quiz>> getQuizzesByCreator(String userEmail) {
        Optional<User> creatorOpt = userDao.findByEmail(userEmail);
        if (creatorOpt.isEmpty()) { return new ResponseEntity<>(HttpStatus.FORBIDDEN); }
        User creator = creatorOpt.get();

        boolean isAdmin = "Admin".equals(creator.getRole());
        boolean isFacultyWithDomain = "Faculty".equals(creator.getRole());
        if (!(isAdmin || isFacultyWithDomain)) {
            logger.warn("Unauthorized attempt to get quizzes by creator: {}", userEmail);
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        try {
            List<Quiz> quizzes = quizDao.findByCreatedBy(creator);
            // Note: Questions might be loaded due to EAGER fetch, but will be ignored by JSON due to @JsonIgnore
            logger.info("Fetched {} quizzes for creator {}", quizzes.size(), userEmail);
            return new ResponseEntity<>(quizzes, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error fetching quizzes for creator {}: {}", userEmail, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional // Needed for deleting attempts and the quiz
    public ResponseEntity<String> deleteQuiz(Integer quizId, String userEmail) {
        if (quizId == null) { return new ResponseEntity<>("Quiz ID cannot be null", HttpStatus.BAD_REQUEST); }

        Optional<Quiz> quizOpt = quizDao.findById(quizId);
        if (quizOpt.isEmpty()) { return new ResponseEntity<>("Quiz not found", HttpStatus.NOT_FOUND); }

        Optional<User> userOpt = userDao.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            logger.warn("Attempt to delete quiz {} by non-existent user {}", quizId, userEmail);
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        User user = userOpt.get();

        boolean isAdmin = "Admin".equals(user.getRole());
        // Quiz object is present, safe to get()
        boolean isOwner = quizOpt.get().getCreatedBy() != null && quizOpt.get().getCreatedBy().getEmail().equals(userEmail);
        boolean isFacultyOwnerWithDomain = isOwner && "Faculty".equals(user.getRole());

        if (!isAdmin && !isFacultyOwnerWithDomain) {
            logger.warn("Unauthorized attempt to delete quiz {} by user {}", quizId, userEmail);
            return new ResponseEntity<>("Not authorized to delete this quiz", HttpStatus.FORBIDDEN);
        }

        try {
            logger.info("Attempting to delete attempts for Quiz ID: {}", quizId);
            quizAttemptDao.deleteByQuizId(quizId); // Delete related attempts first
            logger.info("Attempting to delete Quiz ID: {}", quizId);
            quizDao.deleteById(quizId); // Then delete the quiz
            logger.info("Quiz {} deleted successfully by user {}", quizId, userEmail);
            return new ResponseEntity<>("Quiz deleted successfully", HttpStatus.OK);
        } catch (DataIntegrityViolationException e) {
            logger.error("Cannot delete quiz {} because it has related data (FK constraint): {}", quizId, e.getMessage());
            return new ResponseEntity<>("Cannot delete quiz as it may have existing attempts or other dependencies.", HttpStatus.CONFLICT);
        } catch (Exception e) {
            logger.error("Error deleting quiz {}: {}", quizId, e.getMessage(), e);
            return new ResponseEntity<>("Failed to delete quiz: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<List<Quiz>> getAssignedQuizzesForUser(String userEmail) {
        if (!StringUtils.hasText(userEmail)) {
            return new ResponseEntity<>(Collections.emptyList(), HttpStatus.BAD_REQUEST);
        }

        List<Quiz> allPublishedQuizzes;
        try {
            allPublishedQuizzes = quizDao.findByStatus("PUBLISHED");
            logger.debug("Fetched {} published quizzes.", allPublishedQuizzes.size());
        } catch (Exception e) {
            logger.error("Error fetching published quizzes: {}", e.getMessage(), e);
            return new ResponseEntity<>(Collections.emptyList(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        final String userEmailLower = userEmail.toLowerCase();
        final String userIdentifier;
        final boolean isStudent = userEmailLower.endsWith("@student.nitw.ac.in");

        if (isStudent) {
            String emailPrefix = userEmailLower.substring(0, userEmailLower.indexOf("@student.nitw.ac.in"));
            // Assuming roll number format like 'vsYYdeptXXX' -> 'YYdeptXXX'
            userIdentifier = (emailPrefix.length() > 2) ? emailPrefix.substring(2) : emailPrefix;
        } else {
            userIdentifier = userEmailLower; // Non-students identified by full email
        }

        if (userIdentifier.isEmpty()) {
            logger.warn("Could not extract identifier for email: {}", userEmail);
            return new ResponseEntity<>(Collections.emptyList(), HttpStatus.OK); // Return empty, not error
        }
        logger.debug("User {} identified as {} with identifier '{}'", userEmail, isStudent ? "Student" : "Non-Student", userIdentifier);


        List<Quiz> assignedQuizzes = allPublishedQuizzes.stream()
                .filter(quiz -> {
                    // Basic validity check
                    if (quiz.getStartTime() == null || quiz.getEndTime() == null) {
                        logger.trace("Filtering out Quiz ID {} due to null start/end time.", quiz.getId());
                        return false;
                    }

                    // Check assignment criteria
                    String criteriaString = quiz.getAssignmentCriteria();
                    if (!StringUtils.hasText(criteriaString)) {
                        logger.trace("Quiz ID {} matches user {} (no criteria).", quiz.getId(), userEmail);
                        return true; // No criteria = available to all PUBLISHED quizzes
                    }

                    List<String> criteriaList = Arrays.asList(criteriaString.toLowerCase().split("\\s*,\\s*"));

                    boolean matches = criteriaList.stream().anyMatch(criteria ->
                            isStudent
                                    ? (userIdentifier.startsWith(criteria) || userIdentifier.equals(criteria) || userEmailLower.equals(criteria)) // Student: prefix, roll, or full email
                                    : userIdentifier.equals(criteria) // Non-Student: exact email match
                    );
                    if (matches) {
                        logger.trace("Quiz ID {} matches user {} based on criteria.", quiz.getId(), userEmail);
                    } else {
                        logger.trace("Quiz ID {} does NOT match user {} based on criteria.", quiz.getId(), userEmail);
                    }
                    return matches;
                })
                .collect(Collectors.toList());

        logger.info("Found {} assigned quizzes for user {}", assignedQuizzes.size(), userEmail);
        return new ResponseEntity<>(assignedQuizzes, HttpStatus.OK);
    }

    @Transactional // Creates a QuizAttempt, so needs a transaction
    public ResponseEntity<?> startQuiz(int quizId, String userEmail) {
        Optional<Quiz> quizOpt = quizDao.findById(quizId);
        Optional<User> studentOpt = userDao.findByEmail(userEmail); // Fetch Optional first

        // --- Basic Checks ---
        if (quizOpt.isEmpty()) {
            logger.warn("Attempt to start non-existent quiz ID {}", quizId);
            return new ResponseEntity<>("Quiz not found.", HttpStatus.NOT_FOUND);
        }
        if (studentOpt.isEmpty()) {
            logger.warn("Attempt to start quiz {} by non-existent user {}", quizId, userEmail);
            return new ResponseEntity<>("User not found.", HttpStatus.NOT_FOUND);
        }

        Quiz quiz = quizOpt.get();
        User student = studentOpt.get();

        // --- Permission/Status Checks ---
        boolean alreadySubmitted = quizAttemptDao.existsByQuizIdAndStudentIdAndSubmissionTimeIsNotNull(quizId, student.getId());
        if (alreadySubmitted) {
            logger.info("User {} attempted to restart already submitted quiz {}", userEmail, quizId);
            return new ResponseEntity<>("Quiz already submitted.", HttpStatus.CONFLICT);
        }
        LocalDateTime now = LocalDateTime.now();
        if (!"PUBLISHED".equals(quiz.getStatus())) { /* ... handle not published ... */ return new ResponseEntity<>("Quiz is not active.", HttpStatus.FORBIDDEN); }
        if (quiz.getStartTime() == null || quiz.getEndTime() == null) { /* ... handle no time window ... */ return new ResponseEntity<>("Quiz time window not defined.", HttpStatus.FORBIDDEN); }
        if (now.isBefore(quiz.getStartTime())) { /* ... handle not started yet ... */ return new ResponseEntity<>("Quiz has not started yet.", HttpStatus.FORBIDDEN); }
        if (now.isAfter(quiz.getEndTime())) { /* ... handle ended ... */ return new ResponseEntity<>("Quiz entry window has closed.", HttpStatus.FORBIDDEN); }

        // --- Create Attempt ---
        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz); // Still link the full entity internally
        attempt.setStudent(student);
        attempt.setStartTime(LocalDateTime.now());
        QuizAttempt savedAttempt;
        try {
            savedAttempt = quizAttemptDao.save(attempt);
        } catch (Exception e) { /* ... handle save error ... */ return new ResponseEntity<>("Failed to initialize quiz attempt.", HttpStatus.INTERNAL_SERVER_ERROR); }

        // --- Load and Prepare Questions ---
        List<QuestionWrapper> questionsForUser = new ArrayList<>();
        List<Question> originalQuestions;
        try {
            logger.info("Loading questions for Quiz ID: {} within startQuiz transaction.", quizId);
            // Use FetchType.LAZY in Quiz.java for questions now
            // Accessing questions here will trigger loading within the transaction
            originalQuestions = new ArrayList<>(quiz.getQuestions());

            if (originalQuestions.isEmpty()) {
                logger.error("CRITICAL: Quiz ID {} has ZERO questions associated after loading!", quizId);
                return new ResponseEntity<>("Quiz has no questions configured.", HttpStatus.INTERNAL_SERVER_ERROR);
            }
            logger.info("Successfully loaded {} questions for Quiz ID: {}", originalQuestions.size(), quizId);

            // Shuffle questions and their options
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
        } catch (Exception e) {
            logger.error("Error loading/processing questions for quiz {} during start attempt: {}", quizId, e.getMessage(), e);
            return new ResponseEntity<>("Error preparing quiz questions.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // --- Prepare and Send Response (Modified) ---
        Map<String, Object> response = new HashMap<>();
        response.put("attemptId", savedAttempt.getId());

        // Create a map containing only the quiz info needed by the frontend
        Map<String, Object> quizInfo = new HashMap<>();
        quizInfo.put("id", quiz.getId());
        quizInfo.put("title", quiz.getTitle());
        quizInfo.put("durationInMinutes", quiz.getDurationInMinutes());
        quizInfo.put("totalMarks", quiz.getTotalMarks());
        // Add any other simple fields needed for the header/timer setup

        response.put("quiz", quizInfo); // Send this simplified map

        response.put("questions", questionsForUser); // Send the prepared wrappers

        logger.info("User {} started attempt {} for quiz {}. Sending {} questions.", userEmail, savedAttempt.getId(), quizId, questionsForUser.size());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    @Transactional // Updates QuizAttempt score and submission time
    public ResponseEntity<Integer> calculateResult(Long attemptId, List<Response> responses, String userEmail) {
        if (attemptId == null) { return new ResponseEntity<>(-1, HttpStatus.BAD_REQUEST); }

        Optional<QuizAttempt> attemptOpt = quizAttemptDao.findById(attemptId);
        if (attemptOpt.isEmpty()) {
            logger.warn("Attempt to submit non-existent attempt ID {}", attemptId);
            return new ResponseEntity<>(-1, HttpStatus.NOT_FOUND);
        }
        QuizAttempt attempt = attemptOpt.get();

        // Verify ownership
        User student = attempt.getStudent();
        if (student == null || !student.getEmail().equals(userEmail)) {
            logger.warn("Unauthorized attempt to submit attempt ID {} by user {}", attemptId, userEmail);
            return new ResponseEntity<>(-1, HttpStatus.FORBIDDEN);
        }

        // Check if already submitted
        if (attempt.getSubmissionTime() != null) {
            logger.info("Attempt {} already submitted by user {}, returning existing score.", attemptId, userEmail);
            return new ResponseEntity<>(attempt.getScore() != null ? attempt.getScore() : 0, HttpStatus.OK); // Return 0 if score somehow null
        }

        // Check timing relative to attempt start time
        Quiz quiz = attempt.getQuiz();
        if (quiz == null) {
            logger.error("Quiz object not found for attempt ID {}", attemptId);
            // Attempt is corrupt, should ideally not happen
            return new ResponseEntity<>(-1, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        LocalDateTime submissionRequestTime = LocalDateTime.now();
        long minutesElapsed = ChronoUnit.MINUTES.between(attempt.getStartTime(), submissionRequestTime);
        long allowedDuration = quiz.getDurationInMinutes();
        // Allow a small grace period (e.g., 1 minute) for network latency etc.
        long gracePeriodMinutes = 1;

        if (minutesElapsed > (allowedDuration + gracePeriodMinutes)) {
            logger.warn("Attempt {} submitted late by user {}. Elapsed: {} mins, Allowed: {} mins.", attemptId, userEmail, minutesElapsed, allowedDuration);
            attempt.setScore(0); // Mark score as 0 for late submission
            attempt.setSubmissionTime(submissionRequestTime); // Record actual submission time
            try {
                quizAttemptDao.save(attempt);
                // Return HTTP 408 Request Timeout to indicate lateness clearly
                return new ResponseEntity<>(0, HttpStatus.REQUEST_TIMEOUT);
            } catch (Exception e) {
                logger.error("Error saving late submission score for attempt {}: {}", attemptId, e.getMessage(), e);
                return new ResponseEntity<>(-1, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        // --- Calculate Score ---
        List<Question> questions = quiz.getQuestions(); // EAGER fetch should provide these
        if (CollectionUtils.isEmpty(questions)) {
            logger.warn("Quiz {} for attempt {} has no questions during calculation.", quiz.getId(), attemptId);
            attempt.setScore(0); // Score is 0 if no questions
        } else {
            // Create map of correct answers for efficient lookup
            Map<Integer, String> correctAnswers = new HashMap<>();
            for(Question q : questions) {
                correctAnswers.put(q.getId(), q.getRightAnswer());
            }

            int score = 0;
            if (responses != null) {
                for (Response res : responses) {
                    if (res != null &&
                            correctAnswers.containsKey(res.getId()) &&
                            res.getResponse() != null && // Check user response string
                            correctAnswers.get(res.getId()).equals(res.getResponse())) {
                        score++;
                    }
                }
            }
            attempt.setScore(score);
            logger.info("Calculated score for attempt {}: {} / {}", attemptId, score, questions.size());
        }

        // --- Save Result ---
        attempt.setSubmissionTime(submissionRequestTime); // Set submission time
        try {
            quizAttemptDao.save(attempt);
            logger.info("Attempt {} submitted successfully by user {} with score {}", attemptId, userEmail, attempt.getScore());
            return new ResponseEntity<>(attempt.getScore(), HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error saving final score for attempt {}: {}", attemptId, e.getMessage(), e);
            return new ResponseEntity<>(-1, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<List<SubmissionResultDto>> getSubmissionsForQuiz(Integer quizId, String userEmail) {
        if (quizId == null) { return new ResponseEntity<>(HttpStatus.BAD_REQUEST); }

        Optional<Quiz> quizOpt = quizDao.findById(quizId);
        if (quizOpt.isEmpty()) { return new ResponseEntity<>(HttpStatus.NOT_FOUND); }

        Optional<User> userOpt = userDao.findByEmail(userEmail);
        if (userOpt.isEmpty()) { return new ResponseEntity<>(HttpStatus.FORBIDDEN); }
        User user = userOpt.get();

        boolean isAdmin = "Admin".equals(user.getRole());
        boolean isOwner = quizOpt.get().getCreatedBy() != null && quizOpt.get().getCreatedBy().getEmail().equals(userEmail);

        if (!isAdmin && !isOwner) {
            logger.warn("Unauthorized attempt to view submissions for quiz {} by user {}", quizId, userEmail);
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        try {
            List<QuizAttempt> attempts = quizAttemptDao.findByQuizId(quizId);
            logger.info("Fetched {} attempts for Quiz ID {}", attempts.size(), quizId);

            // Filter attempts to include only submitted ones with valid related data
            List<SubmissionResultDto> results = attempts.stream()
                    .filter(a -> a.getSubmissionTime() != null && a.getStudent() != null && a.getQuiz() != null)
                    .map(attempt -> new SubmissionResultDto(
                            attempt.getStudent().getName(), // Requires Student to be loaded
                            attempt.getScore(),
                            attempt.getQuiz().getTotalMarks(), // Requires Quiz to be loaded
                            attempt.getSubmissionTime()))
                    .collect(Collectors.toList());
            logger.info("Returning {} submission results for Quiz ID {}", results.size(), quizId);
            return new ResponseEntity<>(results, HttpStatus.OK);
        } catch (Exception e) { // Catch potential LazyInitializationExceptions if entities aren't loaded
            logger.error("Error fetching or processing submissions for quiz {}: {}", quizId, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
// *** Change Return Type ***
    public ResponseEntity<?> getStudentAttempt(Long attemptId, String userEmail) { // Use <?> or <QuizAttemptResultDTO>
        if (attemptId == null || !StringUtils.hasText(userEmail)) { return new ResponseEntity<>(HttpStatus.BAD_REQUEST); }

        Optional<QuizAttempt> attemptOpt = quizAttemptDao.findById(attemptId);
        if (attemptOpt.isEmpty()) { return new ResponseEntity<>("Attempt not found.", HttpStatus.NOT_FOUND); } // Better message
        QuizAttempt attempt = attemptOpt.get();

        // Verify ownership
        if (attempt.getStudent() == null || !attempt.getStudent().getEmail().equals(userEmail)) {
            logger.warn("Unauthorized attempt by user {} to view attempt {}", userEmail, attemptId);
            return new ResponseEntity<>("Unauthorized.", HttpStatus.FORBIDDEN);
        }

        // *** Map Entity to DTO ***
        try {
            // Access related entities needed for DTO within the transaction
            Quiz quiz = attempt.getQuiz(); // Access quiz
            // User student = attempt.getStudent(); // Access student if needed for name

            if (quiz == null) {
                logger.error("Quiz object is null for attempt ID {}", attemptId);
                return new ResponseEntity<>("Internal error: Could not load quiz details for attempt.", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            QuizAttemptResultDto resultDto = new QuizAttemptResultDto(
                    attempt.getId(),
                    attempt.getScore(),
                    attempt.getStartTime(),
                    attempt.getSubmissionTime(),
                    quiz.getTitle(),         // Get data from Quiz entity
                    quiz.getSubject(),
                    quiz.getDurationInMinutes(),
                    quiz.getTotalMarks()
                    // student.getName() // Add if needed
            );

            return new ResponseEntity<>(resultDto, HttpStatus.OK); // Return the DTO

        } catch (Exception e) {
            // Catch potential LazyInitializationException if something goes wrong
            logger.error("Error mapping QuizAttempt {} to DTO: {}", attemptId, e.getMessage(), e);
            return new ResponseEntity<>("Error retrieving attempt details.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Inside QuizService.java

    @Transactional(readOnly = true) // Read-only operation
    public ResponseEntity<?> getMyAttempts(String userEmail) {
        if (!StringUtils.hasText(userEmail)) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Optional<User> studentOpt = userDao.findByEmail(userEmail);
        if (studentOpt.isEmpty()) {
            logger.warn("getMyAttempts called for non-existent user: {}", userEmail);
            return new ResponseEntity<>("User not found.", HttpStatus.NOT_FOUND);
        }
        User student = studentOpt.get();

        // Ensure the user has the Student role (optional, but good practice)
        // if (!"Student".equals(student.getRole())) {
        //     logger.warn("User {} attempting to fetch attempts, but is not a Student.", userEmail);
        //     return new ResponseEntity<>("Unauthorized.", HttpStatus.FORBIDDEN);
        // }

        try {
            // Fetch all attempts for this student
            List<QuizAttempt> attempts = quizAttemptDao.findByStudentIdOrderBySubmissionTimeDesc(student.getId()); // Order by most recent
            logger.info("Fetched {} attempts for student {}", attempts.size(), userEmail);

            // Map attempts to DTOs
            List<QuizAttemptResultDto> results = attempts.stream()
                    // Filter only submitted attempts (optional, might want to show incomplete ones too)
                    .filter(attempt -> attempt.getSubmissionTime() != null && attempt.getQuiz() != null)
                    .map(attempt -> {
                        Quiz quiz = attempt.getQuiz(); // Access quiz within the transaction
                        return new QuizAttemptResultDto(
                                attempt.getId(),
                                attempt.getScore(),
                                attempt.getStartTime(),
                                attempt.getSubmissionTime(),
                                quiz.getTitle(),
                                quiz.getSubject(),
                                quiz.getDurationInMinutes(),
                                quiz.getTotalMarks()
                        );
                    })
                    .collect(Collectors.toList());

            logger.info("Returning {} submitted attempt results for student {}", results.size(), userEmail);
            return new ResponseEntity<>(results, HttpStatus.OK);

        } catch (Exception e) {
            logger.error("Error fetching attempts for student {}: {}", userEmail, e.getMessage(), e);
            return new ResponseEntity<>("Error retrieving past attempts.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Add this corresponding method to your QuizAttemptDao interface
    // Inside QuizAttemptDao.java (interface):
    // List<QuizAttempt> findByStudentIdOrderBySubmissionTimeDesc(Long studentId);
}