package com.tp.attendance.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "attendance")
@CompoundIndexes({
    // Unique constraint: one attendance record per student per day
    @CompoundIndex(
        name = "student_date_unique",
        def = "{'studentId': 1, 'date': 1}",
        unique = true
    )
})
public class Attendance {

    @Id
    private String id;

    private String studentId;

    private LocalDate date;

    // PRESENT / ABSENT - reuse AttendanceStatus or a separate enum
    // Keeping it simple: APPROVED request → PRESENT
    private String status;  // "PRESENT"

    private String markedBy;  // admin userId who approved

    private String attendanceRequestId;

    @CreatedDate
    private Instant createdAt;
}
