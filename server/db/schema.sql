CREATE TABLE IF NOT EXISTS games (
    game_id SERIAL PRIMARY KEY,
    state VARCHAR,
    mode VARCHAR NOT NULL,
    player INT NOT NULL,
    time_limit INT,
    depth INT
);

CREATE TABLE IF NOT EXISTS moves (
    move_id SERIAL PRIMARY KEY,
    game_id INT NOT NULL REFERENCES games(game_id),
    turn INT NOT NULL,
    i1 INT NOT NULL,
    j1 INT NOT NULL,
    i2 INT NOT NULL,
    j2 INT NOT NULL,
    promoted VARCHAR
);

CREATE INDEX IF NOT EXISTS idx_game_id ON moves(game_id);
