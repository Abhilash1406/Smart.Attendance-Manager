package com.tp.attendance.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.tp.attendance.model.AttendanceRequest;
import com.tp.attendance.model.AttendanceStatus;
import com.tp.attendance.model.User;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AttendanceRequestResponse {

    private String          id;
    private String          studentId;
    private String          studentName;
    private String          studentEmail;
    private String          studentDepartment;
    private String          profilePicture;

    private String          imagePath;        // relative filename (null after cleanup)
    private String          imageUrl;         // full URL for frontend

    private LocalDate       submissionDate;
    private Instant         submittedAt;

    private AttendanceStatus status;
    private String          verifiedBy;
    private Instant         verifiedAt;
    private String          remarks;

    private String          submittedFromIp;

    public static AttendanceRequestResponse from(AttendanceRequest req, User student) {
        String imageUrl = req.getImageFileName() != null
                ? "/uploads/" + req.getImageFileName()
                : null;

        return AttendanceRequestResponse.builder()
                .id(req.getId())
                .studentId(req.getStudentId())
                .studentName(student != null ? student.getName() : "Unknown")
                .studentEmail(student != null ? student.getEmail() : "")
                .studentDepartment(student != null ? student.getDepartment() : "")
                .profilePicture(student != null ? student.getProfilePicture() : null)
                .imagePath(req.getImageFileName())
                .imageUrl(imageUrl)
                .submissionDate(req.getSubmissionDate())
                .submittedAt(req.getSubmittedAt())
                .status(req.getStatus())
                .verifiedBy(req.getVerifiedBy())
                .verifiedAt(req.getVerifiedAt())
                .remarks(req.getRemarks())
                .submittedFromIp(req.getSubmittedFromIp())
                .build();
    }
}
