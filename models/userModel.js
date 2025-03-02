 const pool = require("../config/db");


 class User {
    static async getAll() {
        //const result = await pool.query("SELECT id, username, email, password FROM users");
        const result = await pool.query("SELECT id, count, type, status FROM sensors");
        return result.rows;
    }

    static async create(username, email, password) {
        const result = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
            [username, email, password]
        );
        return result.rows[0];
    }

    static async update(id, username, email, password) {
        const result = await pool.query(
            "UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4 RETURNING id, username, email",
            [username, email, password, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query("DELETE FROM users WHERE id = $1", [id]);
    }
}

module.exports = User;