package com.tp.attendance.service;

import com.tp.attendance.exception.AppException;
import com.tp.attendance.model.Role;
import com.tp.attendance.model.User;
import com.tp.attendance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Find an existing user or create a new one from Google OAuth payload.
     * This is an "upsert" pattern: idempotent on repeated logins.
     */
    public User findOrCreateUser(
            String googleId,
            String email,
            String name,
            String pictureUrl,
            Role role) {

        // Check by Google ID first (most reliable)
        Optional<User> existingUser = userRepository.findByGoogleId(googleId);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Update profile info that may have changed
            boolean updated = false;
            if (!name.equals(user.getName())) {
                user.setName(name);
                updated = true;
            }
            if (pictureUrl != null && !pictureUrl.equals(user.getProfilePicture())) {
                user.setProfilePicture(pictureUrl);
                updated = true;
            }
            if (updated) {
                userRepository.save(user);
                log.debug("Updated existing user profile: {}", email);
            }
            return user;
        }

        // Check by email (handles re-registration with same email)
        Optional<User> existingByEmail = userRepository.findByEmail(email);
        if (existingByEmail.isPresent()) {
            User user = existingByEmail.get();
            user.setGoogleId(googleId);
            user.setProfilePicture(pictureUrl);
            userRepository.save(user);
            log.debug("Linked Google ID to existing user: {}", email);
            return user;
        }

        // Create new user
        User newUser = User.builder()
                .googleId(googleId)
                .email(email)
                .name(name)
                .profilePicture(pictureUrl)
                .role(role)
                .isActive(true)
                .build();

        User saved = userRepository.save(newUser);
        log.info("Created new user: {} [{}]", email, role);
        return saved;
    }

    public User findById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("User not found: " + id));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> AppException.notFound("User not found: " + email));
    }

    public List<User> findAllStudents() {
        return userRepository.findByRole(Role.STUDENT);
    }

    public List<User> findActiveStudents() {
        return userRepository.findByRoleAndIsActiveTrue(Role.STUDENT);
    }
}
