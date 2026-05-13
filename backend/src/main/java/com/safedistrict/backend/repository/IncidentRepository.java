package com.safedistrict.backend.repository;

import com.safedistrict.backend.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para la entidad Incident.
 * Proporciona operaciones CRUD y consultas personalizadas.
 */
@Repository
public interface IncidentRepository extends JpaRepository<Incident, String> {

    /**
     * Busca incidentes por estado.
     */
    List<Incident> findByStatusOrderByCreatedAtDesc(String status);

    /**
     * Busca incidentes por prioridad.
     */
    List<Incident> findByPriorityOrderByCreatedAtDesc(String priority);

    /**
     * Busca incidentes por tipo de emergencia.
     */
    List<Incident> findByTypeOrderByCreatedAtDesc(String type);

    /**
     * Obtiene todos los incidentes ordenados por fecha de creación descendente.
     */
    List<Incident> findAllByOrderByCreatedAtDesc();

    /**
     * Cuenta incidentes del año actual para generar el siguiente ID secuencial.
     */
    @Query("SELECT COUNT(i) FROM Incident i WHERE i.id LIKE CONCAT('INC-', :year, '-%')")
    long countByYear(int year);
}
