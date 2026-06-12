package com.tp.attendance.security;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.tp.attendance.config.AppProperties;
import com.tp.attendance.exception.AppException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;

/**
 * Verifies Google OAuth id_token on the server side.
 *
 * Why server-side verification?
 * - Cannot trust tokens from the client alone.
 * - Google's SDK validates: signature, expiry, issuer (accounts.google.com), and audience (our client_id).
 * - This ensures the token was issued by Google specifically for our app.
 */
@Slf4j
@Component
public class GoogleTokenVerifier {

    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifier(AppProperties appProperties) {
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(appProperties.getGoogle().getClientId()))
                .build();
    }

    /**
     * Verifies the Google id_token and returns the payload.
     * Throws AppException if token is invalid or verification fails.
     */
    public GoogleIdToken.Payload verify(String idToken) {
        try {
            GoogleIdToken googleIdToken = verifier.verify(idToken);
            if (googleIdToken == null) {
                throw AppException.unauthorized("Invalid or expired Google token");
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();

            // Extra check: email must be verified by Google
            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw AppException.unauthorized("Google account email is not verified");
            }

            log.debug("Google token verified for: {}", payload.getEmail());
            return payload;

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google token verification failed: {}", e.getMessage());
            throw AppException.unauthorized("Google token verification failed: " + e.getMessage());
        }
    }
}
