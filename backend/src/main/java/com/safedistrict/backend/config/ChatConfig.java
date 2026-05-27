package com.safedistrict.backend.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChatConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder
                .defaultSystem("Eres un asistente experto en triaje de emergencias. " +
                        "Analiza el reporte y clasifícalo. " +
                        "Responde solo en formato JSON.")
                .build();
    }
}
