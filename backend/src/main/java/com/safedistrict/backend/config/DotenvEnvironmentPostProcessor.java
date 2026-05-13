package com.safedistrict.backend.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

/**
 * Carga las variables del archivo .env como propiedades de Spring.
 *
 * Busca el .env en múltiples ubicaciones para funcionar tanto
 * desde IntelliJ (working dir = proyecto raíz) como desde terminal
 * (working dir = backend/).
 *
 * Se registra via META-INF/spring.factories para ejecutarse antes
 * de que Spring resuelva los placeholders ${...}.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PROPERTY_SOURCE_NAME = "dotenvProperties";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        // Buscar .env en múltiples ubicaciones
        Path envFile = resolveEnvFile();
        if (envFile == null) {
            return; // No hay .env, Spring usará los defaults del application.properties
        }

        try {
            Map<String, Object> envVars = parseEnvFile(envFile);
            if (!envVars.isEmpty()) {
                environment.getPropertySources()
                        .addLast(new MapPropertySource(PROPERTY_SOURCE_NAME, envVars));
            }
        } catch (IOException e) {
            System.err.println("[SafeDistrict] Advertencia: no se pudo leer el archivo .env: " + e.getMessage());
        }
    }

    /**
     * Busca el .env en orden de prioridad:
     * 1. ./backend/.env  (cuando IntelliJ ejecuta desde la raíz del proyecto)
     * 2. ./.env          (cuando se ejecuta desde backend/)
     */
    private Path resolveEnvFile() {
        Path[] candidates = {
                Path.of("backend", ".env"),  // IntelliJ: CWD = SafeDistrict-Diseno/
                Path.of(".env"),              // Terminal: CWD = SafeDistrict-Diseno/backend/
        };

        for (Path candidate : candidates) {
            if (Files.isReadable(candidate)) {
                System.out.println("[SafeDistrict] .env cargado desde: " + candidate.toAbsolutePath());
                return candidate;
            }
        }

        System.out.println("[SafeDistrict] No se encontró archivo .env — usando valores por defecto del application.properties");
        return null;
    }

    /**
     * Parsea un archivo .env simple (KEY=VALUE, ignora # comentarios y líneas vacías).
     */
    private Map<String, Object> parseEnvFile(Path path) throws IOException {
        Map<String, Object> vars = new HashMap<>();
        for (String line : Files.readAllLines(path)) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                continue;
            }
            int eq = trimmed.indexOf('=');
            if (eq > 0) {
                String key = trimmed.substring(0, eq).trim();
                String value = trimmed.substring(eq + 1).trim();
                // Remover comillas opcionales
                if ((value.startsWith("\"") && value.endsWith("\""))
                        || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length() - 1);
                }
                vars.put(key, value);
            }
        }
        return vars;
    }
}
