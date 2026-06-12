package com.tp.attendance.repository;

import com.tp.attendance.model.Role;
import com.tp.attendance.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    Optional<User> findByGoogleId(String googleId);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByRoleAndIsActiveTrue(Role role);
}
