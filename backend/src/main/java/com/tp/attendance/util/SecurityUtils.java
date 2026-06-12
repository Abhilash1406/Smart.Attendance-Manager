package com.tp.attendance.util;

import com.tp.attendance.exception.AppException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    /**
     * Returns the authenticated user's ID (stored as principal in JWT filter).
     */
    public static String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw AppException.unauthorized("No authenticated user found");
        }
        return (String) auth.getPrincipal();
    }

    /**
     * Returns the authenticated user's email (stored as credentials in JWT filter).
     */
    public static String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw AppException.unauthorized("No authenticated user found");
        }
        return (String) auth.getCredentials();
    }

    /**
     * Checks if the current user has a specific role.
     */
    public static boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }

    public static boolean isAdmin() {
        return hasRole("ADMIN");
    }

    public static boolean isStudent() {
        return hasRole("STUDENT");
    }
}
