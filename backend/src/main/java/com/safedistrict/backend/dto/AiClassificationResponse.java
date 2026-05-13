package com.safedistrict.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

/**
 * DTO que representa la clasificación devuelta por la IA (Google Gemini).
 * Estructura exacta esperada por el frontend de React.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
@Schema(description = "Resultado de clasificación de la IA para una emergencia")
public class AiClassificationResponse {

    @Schema(description = "Tipo de emergencia (clave interna)", example = "robo")
    private String type;

    @Schema(description = "Etiqueta legible del tipo de emergencia", example = "Robo")
    private String typeLabel;

    @Schema(description = "Nivel de prioridad", example = "Alto")
    private String priority;

    @Schema(description = "Etiqueta legible de la prioridad", example = "Alto")
    private String priorityLabel;

    @Schema(description = "Nivel de confianza de la clasificación (0.0 a 1.0)", example = "0.95")
    private Double confidence;

    @Schema(description = "Resumen corto de la emergencia generado por la IA", example = "Robo a mano armada en bodega de abarrotes")
    private String summary;
}
