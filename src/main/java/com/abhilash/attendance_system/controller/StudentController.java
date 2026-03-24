package com.abhilash.attendance_system.controller;

import java.io.File;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.abhilash.attendance_system.model.Student;
import com.abhilash.attendance_system.service.StudentService;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @PostMapping("/register")
    public ResponseEntity<?> registerStudent(
            @RequestParam String name,
            @RequestParam String rollNo,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam MultipartFile photo
    ) {

        try {

            String uploadDir = "uploads/";
            File directory = new File(uploadDir);

            if (!directory.exists()) {
                directory.mkdirs();
            }

            String filePath = uploadDir + photo.getOriginalFilename();
            photo.transferTo(new File(filePath));

            Student student = new Student();
            student.setName(name);
            student.setRollNo(rollNo);
            student.setEmail(email);
            student.setPassword(password);
            student.setPhotoPath(filePath);

            Student savedStudent = studentService.registerStudent(student);

            return ResponseEntity.ok(savedStudent);

        } catch (IOException e) {

            return ResponseEntity.status(500).body("Error uploading photo");

        }
    }
}