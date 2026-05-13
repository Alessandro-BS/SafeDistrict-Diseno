package com.safedistrict.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entidad JPA que representa un incidente/emergencia reportado
 * por un ciudadano en el sistema SafeDistrict.
 */
@Entity
@Table(name = "incidents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @Column(name = "id", nullable = false, unique = true, length = 15)
    private String id;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "priority", nullable = false, length = 20)
    private String priority;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "Pendiente";

    @Column(name = "type", nullable = false, length = 30)
    private String type;

    @Column(name = "type_label", length = 40)
    private String typeLabel;

    @Column(name = "priority_label", length = 20)
    private String priorityLabel;

    @Column(name = "confidence")
    private Double confidence;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "reporter", nullable = false)
    @Builder.Default
    private String reporter = "Ciudadano Anónimo";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
