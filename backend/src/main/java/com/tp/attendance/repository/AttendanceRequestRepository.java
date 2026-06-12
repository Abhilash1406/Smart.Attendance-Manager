package com.tp.attendance.repository;

import com.tp.attendance.model.AttendanceRequest;
import com.tp.attendance.model.AttendanceStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRequestRepository extends MongoRepository<AttendanceRequest, String> {

    List<AttendanceRequest> findByStatus(AttendanceStatus status);

    List<AttendanceRequest> findByStudentId(String studentId);

    Optional<AttendanceRequest> findByStudentIdAndSubmissionDate(String studentId, LocalDate date);

    boolean existsByStudentIdAndSubmissionDate(String studentId, LocalDate date);

    // For the scheduler: find requests with photos older than N days
    List<AttendanceRequest> findByImagePathNotNullAndSubmittedAtBefore(Instant cutoff);

    List<AttendanceRequest> findByStatusOrderBySubmittedAtDesc(AttendanceStatus status);

    long countByStatus(AttendanceStatus status);

    List<AttendanceRequest> findBySubmissionDateBetween(LocalDate start, LocalDate end);
}
