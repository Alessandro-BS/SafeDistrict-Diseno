package com.safedistrict.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuración de Swagger/OpenAPI para la documentación de la API REST.
 * Accesible en: http://localhost:8080/swagger-ui.html
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI safeDistrictOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SafeDistrict API")
                        .description("API REST del sistema de triaje de emergencias para el distrito de Carabayllo, Perú. "
                                + "Permite reportar emergencias, clasificarlas automáticamente con IA (Google Gemini) "
                                + "y gestionar incidentes.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Equipo SafeDistrict")
                                .email("soporte@safedistrict.pe"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Servidor de desarrollo local")
                ));
    }
}
