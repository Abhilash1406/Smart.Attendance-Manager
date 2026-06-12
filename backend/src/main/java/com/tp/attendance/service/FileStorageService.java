package com.tp.attendance.service;

import com.tp.attendance.config.AppProperties;
import com.tp.attendance.exception.AppException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/jpg", "image/png");
    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    private final AppProperties appProperties;
    private Path uploadRoot;

    @PostConstruct
    public void init() {
        uploadRoot = Paths.get(appProperties.getStorage().getUploadDir()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadRoot);
            log.info("Upload directory initialized: {}", uploadRoot);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadRoot, e);
        }
    }

    /**
     * Validates and stores an attendance photo.
     * Returns the relative path stored in MongoDB.
     */
    public String storeAttendancePhoto(MultipartFile file, String studentId) {
        validateFile(file);

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null
                ? file.getOriginalFilename() : "photo.jpg");
        String extension = getExtension(originalFilename);
        String fileName  = studentId + "_" + UUID.randomUUID() + "." + extension;

        try {
            Path targetPath = uploadRoot.resolve(fileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored attendance photo: {}", fileName);
            return fileName;
        } catch (IOException e) {
            log.error("Failed to store file {}: {}", fileName, e.getMessage());
            throw AppException.badRequest("Failed to store photo. Please try again.");
        }
    }

    /**
     * Delete a photo by its stored filename.
     * Returns true if deleted, false if file not found (idempotent).
     */
    public boolean deletePhoto(String fileName) {
        if (fileName == null || fileName.isBlank()) return false;
        try {
            Path filePath = uploadRoot.resolve(fileName).normalize();
            if (!filePath.startsWith(uploadRoot)) {
                log.warn("Attempted path traversal: {}", fileName);
                return false;
            }
            boolean deleted = Files.deleteIfExists(filePath);
            if (deleted) log.debug("Deleted photo: {}", fileName);
            return deleted;
        } catch (IOException e) {
            log.error("Failed to delete photo {}: {}", fileName, e.getMessage());
            return false;
        }
    }

    /**
     * Returns the full filesystem path for serving/reading a file.
     */
    public Path resolveFilePath(String fileName) {
        return uploadRoot.resolve(fileName).normalize();
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw AppException.badRequest("Photo file is required and cannot be empty");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw AppException.badRequest("Photo size exceeds 5MB limit. Please capture a smaller image.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw AppException.badRequest("Only JPG/JPEG/PNG images are accepted.");
        }
    }

    private String getExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : "jpg";
    }
}
