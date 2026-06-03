CREATE TABLE incidents (
    id VARCHAR(15) PRIMARY KEY,
    confidence DOUBLE PRECISION,
    created_at TIMESTAMP(6) WITHOUT TIME ZONE,
    description TEXT,
    location VARCHAR(255),
    priority VARCHAR(20),
    priority_label VARCHAR(20),
    reporter VARCHAR(255),
    status VARCHAR(20),
    summary TEXT,
    type VARCHAR(30),
    type_label VARCHAR(40),
    updated_at TIMESTAMP(6) WITHOUT TIME ZONE
);
