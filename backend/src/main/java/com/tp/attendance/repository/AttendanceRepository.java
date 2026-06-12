package com.tp.attendance.repository;

import com.tp.attendance.model.Attendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {

    List<Attendance> findByStudentId(String studentId);

    List<Attendance> findByStudentIdOrderByDateDesc(String studentId);

    Optional<Attendance> findByStudentIdAndDate(String studentId, LocalDate date);

    boolean existsByStudentIdAndDate(String studentId, LocalDate date);

    List<Attendance> findByDateBetween(LocalDate start, LocalDate end);

    long countByStudentId(String studentId);
}
