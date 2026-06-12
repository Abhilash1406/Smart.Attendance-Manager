package com.tp.attendance.scheduler;

import com.tp.attendance.config.AppProperties;
import com.tp.attendance.model.AttendanceRequest;
import com.tp.attendance.repository.AttendanceRequestRepository;
import com.tp.attendance.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Scheduled job that runs daily at 2:00 AM.
 * Deletes attendance photos older than the configured retention period.
 * Sets imagePath to null in MongoDB — the attendance record itself is preserved.
 *
 * Purpose:
 * - Privacy: photos are personal data, only needed for verification
 * - Storage: frees disk space automatically
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PhotoCleanupScheduler {

    private final AttendanceRequestRepository requestRepository;
    private final FileStorageService          fileStorageService;
    private final AppProperties               appProperties;

    /**
     * Runs every day at 2:00 AM.
     * Cron: second minute hour day month weekday
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupOldPhotos() {
        int retentionDays = appProperties.getAttendance().getPhotoRetentionDays();
        Instant cutoff    = Instant.now().minus(retentionDays, ChronoUnit.DAYS);

        log.info("Photo cleanup started. Retention: {} days. Cutoff: {}", retentionDays, cutoff);

        List<AttendanceRequest> expiredRequests =
                requestRepository.findByImagePathNotNullAndSubmittedAtBefore(cutoff);

        if (expiredRequests.isEmpty()) {
            log.info("Photo cleanup: no expired photos found.");
            return;
        }

        AtomicInteger deleted = new AtomicInteger(0);
        AtomicInteger failed  = new AtomicInteger(0);

        expiredRequests.forEach(request -> {
            try {
                String fileName = request.getImageFileName();

                // Delete from filesystem
                boolean fileDeleted = fileStorageService.deletePhoto(fileName);

                // Null out path in MongoDB regardless (file may already be missing)
                request.setImagePath(null);
                request.setImageFileName(null);
                requestRepository.save(request);

                if (fileDeleted) {
                    deleted.incrementAndGet();
                    log.debug("Deleted photo for request: {}", request.getId());
                } else {
                    log.debug("Photo file already missing for request: {}", request.getId());
                    deleted.incrementAndGet(); // still count as cleaned
                }
            } catch (Exception e) {
                failed.incrementAndGet();
                log.error("Failed to clean photo for request {}: {}", request.getId(), e.getMessage());
            }
        });

        log.info("Photo cleanup complete. Deleted: {}, Failed: {}, Total: {}",
                deleted.get(), failed.get(), expiredRequests.size());
    }

    /**
     * Manual trigger endpoint support — can be called directly in tests or via admin API.
     */
    public void runCleanupNow() {
        log.info("Manual photo cleanup triggered");
        cleanupOldPhotos();
    }
}
