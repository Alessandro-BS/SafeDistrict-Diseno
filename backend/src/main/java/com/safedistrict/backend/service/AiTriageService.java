package com.safedistrict.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.safedistrict.backend.dto.AiClassificationResponse;
import com.safedistrict.backend.exception.AiServiceException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

/**
 * Servicio que consume la API de Google Gemini para clasificar
 * reportes de emergencia mediante Inteligencia Artificial.
 *
 * Envía el texto del ciudadano con un System Prompt especializado
 * y parsea la respuesta JSON de la IA.
 */
@Service
@Slf4j
public class AiTriageService {

    private final WebClient geminiWebClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    /**
     * System Prompt diseñado para obtener una clasificación estructurada
     * del reporte de emergencia.
     */
    private static final String SYSTEM_PROMPT = """
            Eres el motor de triaje automático de emergencias de SafeDistrict en Carabayllo, Perú. \
            Analiza el reporte del ciudadano y devuélvelo ESTRICTAMENTE como un objeto JSON válido \
            con las siguientes claves: \
            'type' (valores permitidos: robo, accidente, incendio, emergencia_medica), \
            'typeLabel' (versión legible del type), \
            'priority' (valores permitidos: Critico, Alto, Medio, Bajo), \
            'priorityLabel' (igual que priority pero Crítico lleva tilde), \
            'confidence' (número decimal entre 0.0 y 1.0), \
            y 'summary' (un resumen de 1 línea del evento). \
            No devuelvas markdown ni texto fuera del JSON.""";

    public AiTriageService(WebClient geminiWebClient, ObjectMapper objectMapper) {
        this.geminiWebClient = geminiWebClient;
        this.objectMapper = objectMapper;
    }

    /**
     * Clasifica un reporte de emergencia usando la API de Google Gemini.
     *
     * @param reportText Texto de la emergencia reportada por el ciudadano
     * @return AiClassificationResponse con la clasificación de la IA
     * @throws AiServiceException si la API falla o la respuesta no es parseable
     */
    public AiClassificationResponse classifyReport(String reportText) {
        log.info("Clasificando reporte con IA: '{}'", reportText.substring(0, Math.min(reportText.length(), 80)));

        try {
            // Construir el cuerpo de la petición según el formato de la API de Gemini
            Map<String, Object> requestBody = buildGeminiRequestBody(reportText);

            // Realizar la petición POST a la API de Gemini
            String responseBody = geminiWebClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(); // Bloqueante en contexto MVC — WebClient sigue manejando I/O de forma no bloqueante

            log.debug("Respuesta cruda de Gemini: {}", responseBody);

            return parseGeminiResponse(responseBody);

        } catch (WebClientResponseException e) {
            log.error("Error HTTP de la API de Gemini: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new AiServiceException(
                    "La API de Gemini respondió con error: " + e.getStatusCode(), e);
        } catch (AiServiceException e) {
            throw e; // Re-lanzar nuestras propias excepciones
        } catch (Exception e) {
            log.error("Error inesperado al clasificar el reporte con IA", e);
            throw new AiServiceException("Error inesperado al comunicarse con la IA: " + e.getMessage(), e);
        }
    }

    /**
     * Construye el cuerpo JSON de la petición para la API de Gemini.
     * Usa el formato oficial: system_instruction + contents.
     */
    private Map<String, Object> buildGeminiRequestBody(String userText) {
        // System instruction (prompt del sistema)
        Map<String, Object> systemInstruction = Map.of(
                "parts", List.of(Map.of("text", SYSTEM_PROMPT))
        );

        // Contenido del usuario
        Map<String, Object> userContent = Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", userText))
        );

        // Configuración de generación
        Map<String, Object> generationConfig = Map.of(
                "temperature", 0.3,
                "maxOutputTokens", 500,
                "responseMimeType", "application/json"
        );

        return Map.of(
                "system_instruction", systemInstruction,
                "contents", List.of(userContent),
                "generationConfig", generationConfig
        );
    }

    /**
     * Parsea la respuesta JSON de la API de Gemini y extrae la clasificación.
     * Navega la estructura: candidates[0].content.parts[0].text
     */
    private AiClassificationResponse parseGeminiResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);

            // Navegar la estructura de respuesta de Gemini
            JsonNode candidates = root.path("candidates");
            if (candidates.isEmpty() || !candidates.isArray()) {
                throw new AiServiceException("La respuesta de Gemini no contiene candidatos válidos");
            }

            String generatedText = candidates.get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

            log.info("Texto generado por Gemini: {}", generatedText);

            // Limpiar posible markdown que rodee el JSON
            String cleanJson = cleanJsonResponse(generatedText);

            // Parsear el JSON de clasificación
            AiClassificationResponse classification = objectMapper.readValue(
                    cleanJson, AiClassificationResponse.class);

            // Validar campos críticos
            validateClassification(classification);

            return classification;

        } catch (JsonProcessingException e) {
            log.error("Error al parsear la respuesta JSON de Gemini", e);
            throw new AiServiceException("No se pudo interpretar la respuesta de la IA: " + e.getMessage(), e);
        }
    }

    /**
     * Limpia posibles wrappers markdown (```json ... ```) de la respuesta.
     */
    private String cleanJsonResponse(String rawText) {
        String cleaned = rawText.trim();
        // Remover bloques de código markdown si están presentes
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
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
