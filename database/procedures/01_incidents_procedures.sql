-- Procedimiento para insertar un nuevo incidente
CREATE OR REPLACE PROCEDURE sp_insert_incident(
    p_id VARCHAR(15),
    p_confidence DOUBLE PRECISION,
    p_description TEXT,
    p_location VARCHAR(255),
    p_priority VARCHAR(20),
    p_priority_label VARCHAR(20),
    p_reporter VARCHAR(255),
    p_status VARCHAR(20),
    p_summary TEXT,
    p_type VARCHAR(30),
    p_type_label VARCHAR(40)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO incidents (
        id, confidence, created_at, description, location, 
        priority, priority_label, reporter, status, summary, 
        type, type_label, updated_at
    ) VALUES (
        p_id, p_confidence, CURRENT_TIMESTAMP, p_description, p_location, 
        p_priority, p_priority_label, p_reporter, p_status, p_summary, 
        p_type, p_type_label, CURRENT_TIMESTAMP
    );
END;
$$;

-- Procedimiento para actualizar el estado de un incidente
CREATE OR REPLACE PROCEDURE sp_update_incident_status(
    p_id VARCHAR(15),
    p_status VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE incidents
    SET status = p_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id;
END;
$$;
