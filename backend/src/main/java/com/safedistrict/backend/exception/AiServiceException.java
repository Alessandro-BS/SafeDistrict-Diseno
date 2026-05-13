package com.safedistrict.backend.exception;

/**
 * Excepción personalizada para errores del servicio de IA.
 * Se lanza cuando la API de Gemini falla o la respuesta no es válida.
 */
public class AiServiceException extends RuntimeException {

    public AiServiceException(String message) {
        super(message);
    }

    public AiServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
