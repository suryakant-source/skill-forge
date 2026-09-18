package com.skillforge.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
        System.out.println("╔═══════════════════════════════════════╗");
        System.out.println("║     SKILLFORGE BACKEND STARTED! 🚀    ║");
        System.out.println("║     API Running on Port: 8080         ║");
        System.out.println("╚═══════════════════════════════════════╝");
    }

}
