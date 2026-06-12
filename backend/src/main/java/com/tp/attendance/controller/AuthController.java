package com.tp.attendance.controller;

import com.tp.attendance.dto.request.GoogleAuthRequest;
import com.tp.attendance.dto.response.AuthResponse;
import com.tp.attendance.dto.response.UserResponse;
import com.tp.attendance.model.User;
import com.tp.attendance.service.AuthService;
import com.tp.attendance.service.UserService;
import com.tp.attendance.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    /**
     * POST /api/auth/google
     * Accepts Google id_token from frontend, verifies it, and returns JWT.
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> authenticateWithGoogle(
            @Valid @RequestBody GoogleAuthRequest request) {

        log.debug("Received Google auth request");
        AuthResponse response = authService.authenticateWithGoogle(request.getIdToken());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/auth/me
     * Returns the currently authenticated user's profile.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getCurrentUser() {
        String userId = SecurityUtils.getCurrentUserId();
        User user = userService.findById(userId);
        return ResponseEntity.ok(UserResponse.from(user));
    }
}
