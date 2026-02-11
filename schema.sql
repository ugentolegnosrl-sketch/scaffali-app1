CREATE TABLE IF NOT EXISTS prodotti (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    lunghezza INTEGER,
    larghezza INTEGER,
    spessore INTEGER,
    fila INTEGER CHECK (fila BETWEEN 1 AND 4),
    scaffale TEXT,
    ripiano INTEGER
);
