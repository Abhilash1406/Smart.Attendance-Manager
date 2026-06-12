package com.tp.attendance.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "attendance_requests")
public class AttendanceRequest {

    @Id
    private String id;

    @Indexed
    private String studentId;

    // Nullable — set to null after scheduled cleanup
    private String imagePath;

    private String imageFileName;

    @Indexed
    private LocalDate submissionDate;

    @CreatedDate
    private Instant submittedAt;

    @Builder.Default
    @Indexed
    private AttendanceStatus status = AttendanceStatus.PENDING;

    private String verifiedBy;      // admin userId

    private Instant verifiedAt;

    private String remarks;

    private String submittedFromIp;
}
