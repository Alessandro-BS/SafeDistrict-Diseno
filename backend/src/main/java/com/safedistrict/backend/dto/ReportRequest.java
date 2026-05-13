package com.safedistrict.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * DTO de entrada: el JSON que envía el frontend al reportar una emergencia.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Solicitud de reporte de emergencia enviada por el ciudadano")
public class ReportRequest {

    @NotBlank(message = "La descripción de la emergencia es obligatoria")
    @Schema(description = "Descripción textual de la emergencia", example = "Hay un incendio en un almacén en la Av. Industrial 450")
    private String text;

    @NotBlank(message = "La ubicación es obligatoria")
    @Schema(description = "Dirección o ubicación del incidente", example = "Av. Industrial 450, Carabayllo")
    private String location;
}
