package com.pradata.app.repository;

import com.pradata.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserDao extends JpaRepository<User, Long> { // Use Long for ID type matching User entity
    // Finds a user by their unique email address
    Optional<User> findByEmail(String email);
}