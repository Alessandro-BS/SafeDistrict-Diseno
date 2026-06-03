package com.safedistrict.backend.integration;

import org.springframework.stereotype.Service;

/**
 * Servicio que agrupa y orquesta la lógica relacionada a la Inteligencia Artificial.
 * Utiliza los conectores externos (como OpenAiConnector) para obtener información
 * y procesarla antes de devolverla al resto de la aplicación.
 */
@Service
public class AiService {

    private final OpenAiConnector openAiConnector;

    public AiService(OpenAiConnector openAiConnector) {
        this.openAiConnector = openAiConnector;
    }

    public String generatePrediction(String inputData) {
        // Lógica de negocio para preparar los datos
        String prompt = "Por favor analiza los siguientes datos médicos: " + inputData;
        
        // Llamada al conector
        return openAiConnector.sendPromptToOpenAi(prompt);
    }
}
