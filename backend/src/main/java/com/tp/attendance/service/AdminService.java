package com.tp.attendance.service;

import com.tp.attendance.dto.response.AttendanceRequestResponse;
import com.tp.attendance.dto.response.DailyStatsResponse;
import com.tp.attendance.exception.AppException;
import com.tp.attendance.model.*;
import com.tp.attendance.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.Comparator;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final AttendanceRequestRepository requestRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    /**
     * Get all pending attendance requests.
     */
    public List<AttendanceRequestResponse> getPendingRequests() {
        return requestRepository.findByStatusOrderBySubmittedAtDesc(AttendanceStatus.PENDING)
                .stream()
                .map(r -> {
                    User student = userService.findById(r.getStudentId());
                    return AttendanceRequestResponse.from(r, student);
                })
                .toList();
    }

    /**
     * Approve an attendance request.
     * Creates a finalized Attendance record.
     */
    public AttendanceRequestResponse approveRequest(String requestId, String adminId, String remarks) {
        AttendanceRequest request = findRequestById(requestId);

        if (request.getStatus() != AttendanceStatus.PENDING) {
            throw AppException.conflict("Request has already been " + request.getStatus().name().toLowerCase());
        }

        // Check if attendance record already exists (race condition guard)
        if (attendanceRepository.existsByStudentIdAndDate(request.getStudentId(), request.getSubmissionDate())) {
            throw AppException.conflict("Attendance already recorded for this student today");
        }

        // Update request
        request.setStatus(AttendanceStatus.APPROVED);
        request.setVerifiedBy(adminId);
        request.setVerifiedAt(Instant.now());
        request.setRemarks(remarks);
        requestRepository.save(request);

        // Create finalized attendance record
        Attendance attendance = Attendance.builder()
                .studentId(request.getStudentId())
                .date(request.getSubmissionDate())
                .status("PRESENT")
                .markedBy(adminId)
                .attendanceRequestId(request.getId())
                .build();
        attendanceRepository.save(attendance);

        log.info("Attendance APPROVED: requestId={}, student={}, admin={}",
                requestId, request.getStudentId(), adminId);

        User student = userService.findById(request.getStudentId());
        return AttendanceRequestResponse.from(request, student);
    }

    /**
     * Reject an attendance request.
     */
    public AttendanceRequestResponse rejectRequest(String requestId, String adminId, String remarks) {
        AttendanceRequest request = findRequestById(requestId);

        if (request.getStatus() != AttendanceStatus.PENDING) {
            throw AppException.conflict("Request has already been " + request.getStatus().name().toLowerCase());
        }

        request.setStatus(AttendanceStatus.REJECTED);
        request.setVerifiedBy(adminId);
        request.setVerifiedAt(Instant.now());
        request.setRemarks(remarks != null ? remarks : "Rejected by admin");
        requestRepository.save(request);

        log.info("Attendance REJECTED: requestId={}, student={}, admin={}",
                requestId, request.getStudentId(), adminId);

        User student = userService.findById(request.getStudentId());
        return AttendanceRequestResponse.from(request, student);
    }

    /**
     * Daily statistics for admin dashboard.
     */
    public DailyStatsResponse getDailyStats(LocalDate date) {
        List<AttendanceRequest> dayRequests = requestRepository.findBySubmissionDateBetween(date, date);

        long pending = dayRequests.stream().filter(r -> r.getStatus() == AttendanceStatus.PENDING).count();
        long approved = dayRequests.stream().filter(r -> r.getStatus() == AttendanceStatus.APPROVED).count();
        long rejected = dayRequests.stream().filter(r -> r.getStatus() == AttendanceStatus.REJECTED).count();
        long total = userRepository.findByRoleAndIsActiveTrue(Role.STUDENT).size();

        return DailyStatsResponse.builder()
                .date(date)
                .totalStudents(total)
                .totalSubmissions(dayRequests.size())
                .pending(pending)
                .approved(approved)
                .rejected(rejected)
                .attendancePercentage(total > 0 ? (approved * 100.0 / total) : 0.0)
                .build();
    }

    /**
     * Date-range report.
     */
    public List<AttendanceRequestResponse> getReport(LocalDate from, LocalDate to) {
        return requestRepository.findBySubmissionDateBetween(from, to)
                .stream()
                .map(r -> {
                    User student = userService.findById(r.getStudentId());
                    return AttendanceRequestResponse.from(r, student);
                })
                .toList();
    }

    /**
     * Get all requests (for admin — all statuses).
     */
    public List<AttendanceRequestResponse> getAllRequests() {
        return requestRepository.findAll()
                .stream()
                // Null-safe sort: records with null submittedAt go last
                .sorted(Comparator.comparing(
                        AttendanceRequest::getSubmittedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(r -> {
                    User student = userService.findById(r.getStudentId());
                    return AttendanceRequestResponse.from(r, student);
                })
                .toList();
    }

    private AttendanceRequest findRequestById(String id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Attendance request not found: " + id));
    }
}
