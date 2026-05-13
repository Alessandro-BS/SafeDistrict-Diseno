package com.safedistrict.backend.service;

import com.safedistrict.backend.dto.AiClassificationResponse;
import com.safedistrict.backend.dto.IncidentResponse;
import com.safedistrict.backend.dto.ReportRequest;
import com.safedistrict.backend.entity.Incident;
import com.safedistrict.backend.repository.IncidentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;

/**
 * Servicio orquestador de incidentes.
 * Coordina el flujo completo: recibe el reporte, invoca a la IA,
 * persiste el incidente en la BD y retorna la respuesta al controller.
 */
@Service
@Slf4j
public class IncidentService {

    private final AiTriageService aiTriageService;
    private final IncidentRepository incidentRepository;

    public IncidentService(AiTriageService aiTriageService, IncidentRepository incidentRepository) {
        this.aiTriageService = aiTriageService;
        this.incidentRepository = incidentRepository;
    }

    /**
     * Procesa un nuevo reporte de emergencia:
     * 1. Clasifica el texto con la IA (Gemini)
     * 2. Genera un ID secuencial para el incidente
     * 3. Crea y persiste la entidad Incident en la base de datos
     * 4. Retorna la respuesta completa al controller
     *
     * @param request DTO con la descripción y ubicación del reporte
     * @return IncidentResponse con los datos del incidente y la clasificación IA
     */
    @Transactional
    public IncidentResponse processReport(ReportRequest request) {
        log.info("Procesando nuevo reporte de emergencia: ubicación={}", request.getLocation());

        // 1. Clasificar con IA
        AiClassificationResponse classification = aiTriageService.classifyReport(request.getText());
        log.info("Clasificación IA obtenida: tipo={}, prioridad={}, confianza={}",
                classification.getType(), classification.getPriority(), classification.getConfidence());

        // 2. Generar ID secuencial
        String incidentId = generateIncidentId();

        // 3. Crear y guardar la entidad
        Incident incident = Incident.builder()
                .id(incidentId)
                .description(request.getText())
                .location(request.getLocation())
                .priority(classification.getPriority())
                .priorityLabel(classification.getPriorityLabel())
                .status("Pendiente")
                .type(classification.getType())
                .typeLabel(classification.getTypeLabel())
                .confidence(classification.getConfidence())
                .summary(classification.getSummary())
                .reporter("Ciudadano Anónimo")
                .build();

        Incident saved = incidentRepository.save(incident);
        log.info("Incidente guardado exitosamente: id={}", saved.getId());

        // 4. Construir y retornar la respuesta
        return IncidentResponse.builder()
                .id(saved.getId())
                .description(saved.getDescription())
                .location(saved.getLocation())
                .priority(saved.getPriority())
                .status(saved.getStatus())
                .type(saved.getType())
                .reporter(saved.getReporter())
                .classification(classification)
                .createdAt(saved.getCreatedAt())
                .build();
    }

    /**
     * Obtiene todos los incidentes registrados, ordenados del más reciente al más antiguo.
     *
     * @return Lista de IncidentResponse
     */
    public List<IncidentResponse> getAllIncidents() {
        return incidentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Busca un incidente por su ID.
     *
     * @param id ID del incidente (formato INC-YYYY-XXXX)
     * @return IncidentResponse del incidente encontrado
     * @throws IllegalArgumentException si el incidente no existe
     */
    public IncidentResponse getIncidentById(String id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No se encontró un incidente con el ID: " + id));
        return mapToResponse(incident);
    }

    /**
     * Genera un ID de incidente con formato INC-YYYY-XXXX,
     * donde XXXX es secuencial basado en los incidentes del año actual.
     */
    private String generateIncidentId() {
        int currentYear = Year.now().getValue();
        long count = incidentRepository.countByYear(currentYear);
        String sequence = String.format("%04d", count + 1);
        return String.format("INC-%d-%s", currentYear, sequence);
    }

    /**
     * Mapea una entidad Incident a su DTO de respuesta.
     */
    private IncidentResponse mapToResponse(Incident incident) {
        AiClassificationResponse classification = AiClassificationResponse.builder()
                .type(incident.getType())
                .typeLabel(incident.getTypeLabel())
                .priority(incident.getPriority())
                .priorityLabel(incident.getPriorityLabel())
                .confidence(incident.getConfidence())
                .summary(incident.getSummary())
                .build();

        return IncidentResponse.builder()
                .id(incident.getId())
                .description(incident.getDescription())
                .location(incident.getLocation())
                .priority(incident.getPriority())
                .status(incident.getStatus())
                .type(incident.getType())
                .reporter(incident.getReporter())
                .classification(classification)
                .createdAt(incident.getCreatedAt())
                .build();
    }
}
