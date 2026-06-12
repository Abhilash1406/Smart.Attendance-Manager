package com.tp.attendance.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tp.attendance.model.Role;
import com.tp.attendance.model.User;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class UserResponse {

    private String id;
    private String name;
    private String email;
    private Role role;
    private String department;
    private String profilePicture;

    @JsonProperty("isActive")      // Lombok generates isActive() getter; Jackson would strip 'is' → 'active' without this
    private boolean isActive;

    private Instant createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(user.getDepartment())
                .profilePicture(user.getProfilePicture())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
