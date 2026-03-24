package com.abhilash.attendance_system.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "students")
public class Student {

    @Id
    private String id;

    private String name;
    private String rollNo;
    private String email;
    private String password;

    // Path of image stored on server
    private String photoPath;

    public Student() {}

    public Student(String name, String rollNo, String email, String password, String photoPath) {
        this.name = name;
        this.rollNo = rollNo;
        this.email = email;
        this.password = password;
        this.photoPath = photoPath;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getRollNo() {
        return rollNo;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getPhotoPath() {
        return photoPath;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setPhotoPath(String photoPath) {
        this.photoPath = photoPath;
    }
}