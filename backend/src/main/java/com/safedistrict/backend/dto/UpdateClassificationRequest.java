package com.safedistrict.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * DTO para actualizar la clasificación (tipo y prioridad) de un incidente.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Solicitud para reclasificar un incidente manualmente")
public class UpdateClassificationRequest {

    @NotBlank(message = "El tipo de emergencia es obligatorio")
    @Schema(description = "Tipo de emergencia", example = "robo")
    private String type;

    @NotBlank(message = "La etiqueta del tipo de emergencia es obligatoria")
    @Schema(description = "Etiqueta legible del tipo", example = "Robo")
    private String typeLabel;

    @NotBlank(message = "La prioridad es obligatoria")
    @Schema(description = "Prioridad del incidente", example = "Alto")
    private String priority;
}
