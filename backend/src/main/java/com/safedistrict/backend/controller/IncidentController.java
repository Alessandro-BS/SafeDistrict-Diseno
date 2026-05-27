package com.safedistrict.backend.controller;

import com.safedistrict.backend.dto.IncidentResponse;
import com.safedistrict.backend.dto.ReportRequest;
import com.safedistrict.backend.dto.UpdateClassificationRequest;
import com.safedistrict.backend.service.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de incidentes de emergencia.
 * Expone los endpoints que consume el frontend de React.
 */
@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@Tag(name = "Incidentes", description = "Endpoints para reportar y consultar incidentes de emergencia")
@Slf4j
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    /**
     * Endpoint principal: recibe un reporte de emergencia del ciudadano,
     * lo clasifica con IA y lo registra en el sistema.
     */
    @PostMapping("/report")
    @Operation(
            summary = "Reportar una emergencia",
            description = "Recibe la descripción textual de una emergencia y su ubicación. "
                    + "El sistema clasifica automáticamente el reporte usando IA (Google Gemini), "
                    + "asigna tipo, prioridad y confianza, guarda el incidente en la base de datos "
                    + "y devuelve la clasificación junto con el ID del incidente registrado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Incidente registrado y clasificado exitosamente",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = IncidentResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Datos de entrada inválidos (falta descripción o ubicación)",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                    responseCode = "503",
                    description = "Error en el servicio de IA (Google Gemini no disponible)",
                    content = @Content(mediaType = "application/json")
            )
    })
    public ResponseEntity<IncidentResponse> reportIncident(
            @Valid @RequestBody ReportRequest request) {

        log.info("POST /api/incidents/report - Nuevo reporte recibido desde: {}", request.getLocation());

        IncidentResponse response = incidentService.processReport(request);

        log.info("Incidente creado exitosamente: id={}, tipo={}, prioridad={}",
                response.getId(), response.getType(), response.getPriority());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Obtiene todos los incidentes registrados, del más reciente al más antiguo.
     */
    @GetMapping
    @Operation(
            summary = "Listar todos los incidentes",
            description = "Retorna todos los incidentes registrados en el sistema, "
                    + "ordenados por fecha de creación descendente."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de incidentes obtenida exitosamente",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = IncidentResponse.class)
                    )
            )
    })
    public ResponseEntity<List<IncidentResponse>> getAllIncidents() {
        log.info("GET /api/incidents - Consultando todos los incidentes");
        List<IncidentResponse> incidents = incidentService.getAllIncidents();
        return ResponseEntity.ok(incidents);
    }

    /**
     * Obtiene un incidente específico por su ID.
     */
    @GetMapping("/{id}")
    @Operation(
            summary = "Consultar un incidente por ID",
            description = "Busca y retorna un incidente específico usando su ID (formato INC-YYYY-XXXX)."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Incidente encontrado",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = IncidentResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Incidente no encontrado con el ID proporcionado",
                    content = @Content(mediaType = "application/json")
            )
    })
    public ResponseEntity<IncidentResponse> getIncidentById(
            @PathVariable String id) {
        log.info("GET /api/incidents/{} - Consultando incidente", id);
        IncidentResponse incident = incidentService.getIncidentById(id);
        return ResponseEntity.ok(incident);
    }

    /**
     * Actualiza manualmente la clasificación de un incidente.
     */
    @PutMapping("/{id}/classify")
    @Operation(
            summary = "Reclasificar un incidente",
            description = "Actualiza manualmente el tipo y la prioridad de un incidente."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Incidente reclasificado exitosamente",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = IncidentResponse.class)
                    )
            )
    })
    public ResponseEntity<IncidentResponse> updateIncidentClassification(
            @PathVariable String id,
            @Valid @RequestBody UpdateClassificationRequest request) {
        log.info("PUT /api/incidents/{}/classify - Actualizando clasificación", id);
        IncidentResponse updated = incidentService.updateIncidentClassification(
                id, request.getType(), request.getTypeLabel(), request.getPriority());
        return ResponseEntity.ok(updated);
    }
}
