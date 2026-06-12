package com.tp.attendance.service;

import com.tp.attendance.config.AppProperties;
import com.tp.attendance.dto.response.AttendanceRequestResponse;
import com.tp.attendance.exception.AppException;
import com.tp.attendance.model.AttendanceRequest;
import com.tp.attendance.model.AttendanceStatus;
import com.tp.attendance.model.User;
import com.tp.attendance.repository.AttendanceRepository;
import com.tp.attendance.repository.AttendanceRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRequestRepository requestRepository;
    private final AttendanceRepository        attendanceRepository;
    private final FileStorageService          fileStorageService;
    private final UserService                 userService;
    private final AppProperties               appProperties;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    /**
     * Mark attendance: validates window, duplicate check, stores photo, creates request.
     */
    public AttendanceRequestResponse markAttendance(
            String studentId,
            MultipartFile photo,
            String clientIp) {

        // 1. Check attendance window
        validateAttendanceWindow();

        // 2. Prevent duplicate submission on same day
        LocalDate today = LocalDate.now();
        if (requestRepository.existsByStudentIdAndSubmissionDate(studentId, today)) {
            throw AppException.conflict(
                "You have already submitted an attendance request for today. " +
                "Please wait for admin verification.");
        }

        // 3. Store the photo
        String fileName = fileStorageService.storeAttendancePhoto(photo, studentId);

        // 4. Create attendance request
        AttendanceRequest request = AttendanceRequest.builder()
                .studentId(studentId)
                .imagePath(fileName)
                .imageFileName(fileName)
                .submissionDate(today)
                .status(AttendanceStatus.PENDING)
                .submittedFromIp(clientIp)
                .build();

        AttendanceRequest saved = requestRepository.save(request);
        log.info("Attendance request created: student={}, id={}", studentId, saved.getId());

        User student = userService.findById(studentId);
        return AttendanceRequestResponse.from(saved, student);
    }

    /**
     * Get attendance history for a student.
     */
    public List<AttendanceRequestResponse> getStudentHistory(String studentId) {
        User student = userService.findById(studentId);
        return requestRepository.findByStudentId(studentId)
                .stream()
                .map(r -> AttendanceRequestResponse.from(r, student))
                .toList();
    }

    /**
     * Check if student has already submitted today.
     */
    public boolean hasSubmittedToday(String studentId) {
        return requestRepository.existsByStudentIdAndSubmissionDate(studentId, LocalDate.now());
    }

    /**
     * Check if current time is within the attendance window.
     */
    public boolean isWithinAttendanceWindow() {
        try {
            LocalTime now   = LocalTime.now();
            LocalTime start = LocalTime.parse(appProperties.getAttendance().getWindowStart(), TIME_FMT);
            LocalTime end   = LocalTime.parse(appProperties.getAttendance().getWindowEnd(),   TIME_FMT);
            return !now.isBefore(start) && !now.isAfter(end);
        } catch (Exception e) {
            log.error("Error parsing attendance window config: {}", e.getMessage());
            return true; // fail-open during misconfiguration
        }
    }

    private void validateAttendanceWindow() {
        if (!isWithinAttendanceWindow()) {
            String start = appProperties.getAttendance().getWindowStart();
            String end   = appProperties.getAttendance().getWindowEnd();
            throw AppException.forbidden(
                String.format("Attendance can only be marked between %s and %s. " +
                              "Please try again during the attendance window.", start, end));
        }
    }
}
