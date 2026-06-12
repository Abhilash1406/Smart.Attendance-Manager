package com.tp.attendance.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class DailyStatsResponse {
    private LocalDate date;
    private long      totalStudents;
    private long      totalSubmissions;
    private long      pending;
    private long      approved;
    private long      rejected;
    private double    attendancePercentage;
}
