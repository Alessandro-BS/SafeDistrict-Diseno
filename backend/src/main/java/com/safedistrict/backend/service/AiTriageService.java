package com.safedistrict.backend.service;

import com.safedistrict.backend.dto.AiClassificationResponse;
import com.safedistrict.backend.exception.AiServiceException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Servicio que consume Google Gemini a través de Spring AI
 * para clasificar reportes de emergencia mediante IA.
 *
 * Usa el ChatClient con Structured Output para obtener
 * directamente un DTO tipado sin parseo manual de JSON.
 */
@Service
@Slf4j
public class AiTriageService {

    private final ChatClient chatClient;

    public AiTriageService(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    /**
     * Clasifica un reporte de emergencia usando Google Gemini vía Spring AI.
     *
     * Utiliza el concepto de Structured Output (.entity()) para que
     * Spring AI convierta automáticamente la respuesta del modelo
     * al DTO AiClassificationResponse, sin necesidad de ObjectMapper
     * ni limpieza manual de strings.
     *
     * @param reportText Texto de la emergencia reportada por el ciudadano
     * @return AiClassificationResponse con la clasificación de la IA
     * @throws AiServiceException si la API falla o la respuesta no es parseable
     */
    public AiClassificationResponse classifyReport(String reportText) {
        log.info("Clasificando reporte con IA (Spring AI): '{}'",
                reportText.substring(0, Math.min(reportText.length(), 80)));

        try {
            // Spring AI se encarga de:
            // 1. Enviar el System Prompt (configurado en ChatConfig)
            // 2. Enviar el mensaje del usuario
            // 3. Solicitar respuesta JSON (via BeanOutputConverter)
            // 4. Parsear la respuesta directamente al DTO
            AiClassificationResponse classification = chatClient.prompt()
                    .user(reportText)
                    .call()
                    .entity(AiClassificationResponse.class);

            log.info("Clasificación IA obtenida: tipo={}, prioridad={}, confianza={}",
                    classification.getType(),
                    classification.getPriority(),
                    classification.getConfidence());

            // Validar campos críticos
            validateClassification(classification);

            return classification;

        } catch (AiServiceException e) {
            throw e; // Re-lanzar nuestras propias excepciones
        } catch (Exception e) {
            log.error("Error al clasificar el reporte con IA: {}", e.getMessage(), e);
            throw new AiServiceException(
                    "Error al comunicarse con el servicio de IA: " + e.getMessage(), e);
        }
    }

    /**
     * Valida que la clasificación de la IA contenga los campos requeridos
     * y que los valores estén dentro de los rangos esperados.
     */
    private void validateClassification(AiClassificationResponse classification) {
        if (classification.getType() == null || classification.getType().isBlank()) {
            throw new AiServiceException("La IA no devolvió un tipo de emergencia válido");
        }

        // Validar que el tipo sea uno de los permitidos
        List<String> validTypes = List.of("robo", "accidente", "incendio", "emergencia_medica");
        if (!validTypes.contains(classification.getType())) {
            log.warn("Tipo de emergencia no estándar recibido: {}", classification.getType());
        }

        // Asegurar que confidence esté en rango [0.0, 1.0]
        if (classification.getConfidence() != null) {
            if (classification.getConfidence() < 0.0 || classification.getConfidence() > 1.0) {
                classification.setConfidence(
                        Math.max(0.0, Math.min(1.0, classification.getConfidence()))
                );
            }
        } else {
            classification.setConfidence(0.5); // Valor por defecto
        }
    }
}
