package com.abhilash.attendance_system.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.abhilash.attendance_system.model.Student;
import com.abhilash.attendance_system.repository.StudentRepository;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    public Student registerStudent(Student student) {

        return studentRepository.save(student);

    }

}