package com.tp.attendance.controller;

import com.tp.attendance.dto.response.AttendanceRequestResponse;
import com.tp.attendance.service.AttendanceService;
import com.tp.attendance.service.NetworkValidationService;
import com.tp.attendance.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService        attendanceService;
    private final NetworkValidationService networkValidationService;

    /**
     * POST /api/attendance/mark
     * Students mark attendance by uploading a webcam photo.
     * Requires: college network, attendance window, no duplicate.
     */
    @PostMapping(value = "/mark", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AttendanceRequestResponse> markAttendance(
            @RequestParam("photo") MultipartFile photo,
            HttpServletRequest httpRequest) {

        // IP/network validation
        networkValidationService.validateCollegeNetwork(httpRequest);
        String clientIp = networkValidationService.extractClientIp(httpRequest);

        String studentId = SecurityUtils.getCurrentUserId();
        AttendanceRequestResponse response =
                attendanceService.markAttendance(studentId, photo, clientIp);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/attendance/history
     * Returns the authenticated student's full attendance history.
     */
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
    public ResponseEntity<List<AttendanceRequestResponse>> getHistory() {
        String studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(attendanceService.getStudentHistory(studentId));
    }

    /**
     * GET /api/attendance/status/today
     * Returns whether the student has already submitted today + window info.
     */
    @GetMapping("/status/today")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getTodayStatus() {
        String studentId = SecurityUtils.getCurrentUserId();
        boolean submitted = attendanceService.hasSubmittedToday(studentId);
        boolean inWindow  = attendanceService.isWithinAttendanceWindow();

        return ResponseEntity.ok(Map.of(
            "submittedToday",    submitted,
            "withinWindow",      inWindow,
            "canMark",           !submitted && inWindow
        ));
    }
}
