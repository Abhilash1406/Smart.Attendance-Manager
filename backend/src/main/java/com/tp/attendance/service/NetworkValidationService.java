package com.tp.attendance.service;

import com.tp.attendance.config.AppProperties;
import com.tp.attendance.exception.AppException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NetworkValidationService {

    private final AppProperties appProperties;

    /**
     * Validates that the request originates from an allowed college network.
     * Throws AppException.forbidden if the IP is not whitelisted.
     */
    public void validateCollegeNetwork(HttpServletRequest request) {
        String clientIp = extractClientIp(request);
        log.debug("Validating network access for IP: {}", clientIp);

        if (!isAllowed(clientIp)) {
            log.warn("Attendance attempt from unauthorized IP: {}", clientIp);
            throw AppException.forbidden(
                "Attendance can only be marked from the college WiFi network. " +
                "Your current IP (" + clientIp + ") is not authorized."
            );
        }

        log.debug("IP {} passed network validation", clientIp);
    }

    public boolean isAllowed(String ip) {
        if (ip == null || ip.isBlank()) return false;
        List<String> allowedList = appProperties.getNetwork().getAllowedIpList();
        return allowedList.stream().anyMatch(allowed -> {
            // Exact match
            if (ip.equals(allowed)) return true;
            // Prefix match: "192.168.1." matches "192.168.1.105"
            if (allowed.endsWith(".") && ip.startsWith(allowed)) return true;
            // CIDR-lite: if allowed ends with "*" treat as prefix
            if (allowed.endsWith("*") && ip.startsWith(allowed.substring(0, allowed.length() - 1))) return true;
            return false;
        });
    }

    /**
     * Extracts real client IP, respecting reverse proxy headers.
     */
    public String extractClientIp(HttpServletRequest request) {
        String[] headerCandidates = {
            "X-Forwarded-For",
            "X-Real-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP"
        };

        for (String header : headerCandidates) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
                // X-Forwarded-For can be comma-separated; take the first (original client)
                return ip.split(",")[0].trim();
            }
        }

        return request.getRemoteAddr();
    }
}
