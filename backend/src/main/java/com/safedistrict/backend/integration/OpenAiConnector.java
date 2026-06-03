package com.safedistrict.backend.integration;

import org.springframework.stereotype.Component;

/**
 * Cliente/Conector para comunicarse con la API de OpenAI.
 * Aquí iría la lógica para enviar peticiones HTTP (por ejemplo usando RestTemplate o WebClient).
 */
@Component
public class OpenAiConnector {

    // TODO: Inyectar variables de entorno como la API Key y la URL de OpenAI

    public String sendPromptToOpenAi(String prompt) {
        // Lógica simulada de conexión a OpenAI
        return "Respuesta simulada de OpenAI para el prompt: " + prompt;
    }
}
