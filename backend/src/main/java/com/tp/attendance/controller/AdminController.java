package com.tp.attendance.controller;

import com.tp.attendance.dto.request.AdminActionRequest;
import com.tp.attendance.dto.response.AttendanceRequestResponse;
import com.tp.attendance.dto.response.DailyStatsResponse;
import com.tp.attendance.dto.response.UserResponse;
import com.tp.attendance.service.AdminService;
import com.tp.attendance.service.UserService;
import com.tp.attendance.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final UserService  userService;

    /** GET /api/admin/pending — all pending requests */
    @GetMapping("/pending")
    public ResponseEntity<List<AttendanceRequestResponse>> getPending() {
        return ResponseEntity.ok(adminService.getPendingRequests());
    }

    /** GET /api/admin/requests — all requests (any status) */
    @GetMapping("/requests")
    public ResponseEntity<List<AttendanceRequestResponse>> getAllRequests() {
        return ResponseEntity.ok(adminService.getAllRequests());
    }

    /** POST /api/admin/approve/{id} */
    @PostMapping("/approve/{id}")
    public ResponseEntity<AttendanceRequestResponse> approve(
            @PathVariable String id,
            @RequestBody(required = false) AdminActionRequest body) {

        String adminId  = SecurityUtils.getCurrentUserId();
        String remarks  = body != null ? body.getRemarks() : null;
        return ResponseEntity.ok(adminService.approveRequest(id, adminId, remarks));
    }

    /** POST /api/admin/reject/{id} */
    @PostMapping("/reject/{id}")
    public ResponseEntity<AttendanceRequestResponse> reject(
            @PathVariable String id,
            @RequestBody(required = false) AdminActionRequest body) {

        String adminId  = SecurityUtils.getCurrentUserId();
        String remarks  = body != null ? body.getRemarks() : "Rejected by admin";
        return ResponseEntity.ok(adminService.rejectRequest(id, adminId, remarks));
    }

    /** GET /api/admin/stats/daily?date=2024-06-01 */
    @GetMapping("/stats/daily")
    public ResponseEntity<DailyStatsResponse> getDailyStats(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (date == null) date = LocalDate.now();
        return ResponseEntity.ok(adminService.getDailyStats(date));
    }

    /** GET /api/admin/reports?from=2024-06-01&to=2024-06-30 */
    @GetMapping("/reports")
    public ResponseEntity<List<AttendanceRequestResponse>> getReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        return ResponseEntity.ok(adminService.getReport(from, to));
    }

    /** GET /api/admin/students — all students */
    @GetMapping("/students")
    public ResponseEntity<List<UserResponse>> getStudents() {
        return ResponseEntity.ok(
            userService.findAllStudents().stream()
                .map(UserResponse::from)
                .toList()
        );
    }
}
