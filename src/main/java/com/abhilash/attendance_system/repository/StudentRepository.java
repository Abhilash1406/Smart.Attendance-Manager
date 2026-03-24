package com.abhilash.attendance_system.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.abhilash.attendance_system.model.Student;

public interface StudentRepository extends MongoRepository<Student, String> {

    Student findByEmail(String email);

}