package com.pradata.app.repository;

import com.pradata.app.model.Quiz;
import com.pradata.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QuizDao extends JpaRepository<Quiz, Integer> {
    List<Quiz> findByStatusAndStartTimeBeforeAndEndTimeAfter(String status, LocalDateTime time1, LocalDateTime time2);
    List<Quiz> findByCreatedBy(User creator);
}