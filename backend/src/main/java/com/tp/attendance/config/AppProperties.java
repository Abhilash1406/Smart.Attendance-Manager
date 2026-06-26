package com.tp.attendance.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;

@Data
@Validated
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    @NotNull
    private Jwt jwt = new Jwt();

    @NotNull
    private Google google = new Google();

    // Comma-separated list of allowed email domains, e.g. "kitsw.ac.in,gmail.com"
    private String allowedDomains = "kitsw.ac.in,gmail.com";

    public List<String> getAllowedDomainList() {
        return List.of(allowedDomains.split(","))
                   .stream()
                   .map(String::trim)
                   .filter(d -> !d.isEmpty())
                   .toList();
    }

    @NotNull
    private Attendance attendance = new Attendance();

    @NotNull
    private Storage storage = new Storage();

    @NotNull
    private Network network = new Network();

    @NotNull
    private Cors cors = new Cors();

    @Data
    public static class Jwt {
        @NotBlank
        private String secret;

        @Positive
        private long expiration = 86400000L;
    }

    @Data
    public static class Google {
        @NotBlank
        private String clientId;
    }

    @Data
    public static class Attendance {
        private String windowStart = "09:00";
        private String windowEnd   = "09:15";

        @Positive
        private int photoRetentionDays = 7;
    }

    @Data
    public static class Storage {
        private String uploadDir = "./uploads/attendance";
    }

    @Data
    public static class Network {
        // Comma-separated allowed IP prefixes/exact IPs
        private String allowedIps = "127.0.0.1,::1";

        public List<String> getAllowedIpList() {
            return List.of(allowedIps.split(","))
                       .stream()
                       .map(String::trim)
                       .toList();
        }
    }

    @Data
    public static class Cors {
        private String allowedOrigins = "http://localhost:5173";

        public List<String> getAllowedOriginList() {
            return List.of(allowedOrigins.split(","))
                       .stream()
                       .map(String::trim)
                       .toList();
        }
    }
}
