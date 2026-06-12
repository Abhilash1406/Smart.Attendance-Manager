package com.tp.attendance.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.tp.attendance.config.AppProperties;
import com.tp.attendance.dto.response.AuthResponse;
import com.tp.attendance.dto.response.UserResponse;
import com.tp.attendance.exception.AppException;
import com.tp.attendance.model.Role;
import com.tp.attendance.model.User;
import com.tp.attendance.security.GoogleTokenVerifier;
import com.tp.attendance.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final GoogleTokenVerifier googleTokenVerifier;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final AppProperties appProperties;

    /**
     * Full authentication flow:
     * 1. Verify Google id_token
     * 2. Extract user info
     * 3. Validate college email domain
     * 4. Find or create user in MongoDB
     * 5. Generate and return JWT
     */
    public AuthResponse authenticateWithGoogle(String idToken) {
        // Step 1: Verify with Google
        GoogleIdToken.Payload payload = googleTokenVerifier.verify(idToken);

        String email   = payload.getEmail();
        String name    = (String) payload.get("name");
        String picture = (String) payload.get("picture");
        String googleId = payload.getSubject();

        // Step 2: Domain validation
        validateEmailDomain(email);

        // Step 3: Determine role
        // By default, everyone is STUDENT. Admins can be seeded or set manually in DB.
        // Future: can use a whitelist of admin emails from config.
        Role role = determineRole(email);

        // Step 4: Upsert user
        User user = userService.findOrCreateUser(googleId, email, name, picture, role);

        if (!user.isActive()) {
            throw AppException.forbidden("Your account has been deactivated. Contact T&P administration.");
        }

        // Step 5: Generate JWT
        String token = jwtUtil.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );

        log.info("Authentication successful for {} [{}]", email, user.getRole());

        return AuthResponse.of(
                token,
                appProperties.getJwt().getExpiration(),
                UserResponse.from(user)
        );
    }

    private void validateEmailDomain(String email) {
        String allowedDomain = appProperties.getAllowedDomain();
        if (!email.endsWith("@" + allowedDomain)) {
            log.warn("Rejected login attempt from unauthorized domain: {}", email);
            throw AppException.forbidden(
                String.format(
                    "Access restricted to %s email accounts only. " +
                    "Please use your college email address.",
                    allowedDomain
                )
            );
        }
    }

    private Role determineRole(String email) {
        // Simple approach: check if email is in a configured admin list
        // For now, role is always STUDENT on first login.
        // Admins must be set directly in DB or via a seed script.
        return Role.STUDENT;
    }
}
