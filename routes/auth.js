const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

// 📌 Реєстрація користувача
router.post("/register", async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Всі поля є обов'язковими" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query(
            "INSERT INTO system_users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
            [username, email, hashedPassword, role || "user"]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 📌 Логін користувача
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Всі поля є обов'язковими" });
        }
        const result = await db.query("SELECT * FROM system_users WHERE email = $1", [email]);

        if (result.rowCount === 0) {
            return res.status(401).json({ message: "Невірний email або пароль" });
        }

        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: "Невірний email або пароль" });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;