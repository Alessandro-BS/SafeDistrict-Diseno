package com.safedistrict.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO de salida: respuesta completa del incidente registrado,
 * incluyendo datos del incidente y la clasificación de la IA.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Respuesta completa del incidente registrado con clasificación IA")
public class IncidentResponse {

    @Schema(description = "ID único del incidente", example = "INC-2026-0042")
    private String id;

    @Schema(description = "Descripción de la emergencia reportada")
    private String description;

    @Schema(description = "Ubicación del incidente")
    private String location;

    @Schema(description = "Prioridad asignada por la IA")
    private String priority;

    @Schema(description = "Estado actual del incidente", example = "Pendiente")
    private String status;

    @Schema(description = "Tipo de emergencia clasificado por la IA")
    private String type;

    @Schema(description = "Nombre de quien reporta")
    private String reporter;

    @Schema(description = "Clasificación completa de la IA")
    private AiClassificationResponse classification;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "Fecha y hora de creación del incidente")
    private LocalDateTime createdAt;
}
