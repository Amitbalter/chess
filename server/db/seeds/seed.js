const format = require("pg-format");
const db = require("../connection");

const seed = () => {
    return db
        .query(`DROP TABLE IF EXISTS moves;`)
        .then(() => {
            return db.query(`DROP TABLE IF EXISTS games`);
        })
        .then(() => {
            return db.query(`
      CREATE TABLE games (
        game_id SERIAL PRIMARY KEY,
        mode VARCHAR NOT NULL,
        player INT NOT NULL,
        time_limit INT,
        depth INT
      );`);
        })
        .then(() => {
            return db.query(`
      CREATE TABLE moves (
        move_id SERIAL PRIMARY KEY,
        game_id INT NOT NULL REFERENCES games(game_id),
        turn INT NOT NULL,
        i1 INT NOT NULL,
        j1 INT NOT NULL,
        i2 INT NOT NULL,
        j2 INT NOT NULL,
        promoted VARCHAR
      );`);
        })
        .then(() => {
            return db.query(`CREATE INDEX idx_game_id ON moves(game_id)`);
        });
};

seed();

module.exports = seed;
