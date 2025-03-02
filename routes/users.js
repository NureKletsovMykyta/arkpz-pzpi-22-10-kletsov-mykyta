const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateUser, authorizeRole } = require("../middlewares/authMiddleware");
const User = require("../models/userModel");

// 📌 Отримати всіх користувачів (доступно всім)
router.get("/", authenticateUser, async (req, res) => {
    try {
        const result = await db.query("SELECT id, count, type, status FROM sensors ORDER BY id ASC");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 📌 Створити нового користувача (admin, superadmin)
router.post("/", authenticateUser, authorizeRole("admin", "superadmin"), async (req, res) => {
   
    
    try {
        const { username, email, password } = req.body;
        const newUser = await User.create(username, email, password);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 📌 Оновити користувача (тільки superadmin)
router.put("/:id", authenticateUser, authorizeRole("superadmin"), async (req, res) => {
    
    try {
        const { id } = req.params;
        const { username, email, password } = req.body;
        const updatedUser = await User.update(id, username, email, password);
        res.json(updatedUser);
    } catch (error)
    
    {
        res.status(400).json({ message: error.message });
    }
});

// 📌 Видалити користувача (тільки superadmin)
router.delete("/:id", authenticateUser, authorizeRole("superadmin"), async (req, res) => {
    try {
        const { id } = req.params;
        await User.delete(id);
        res.json({ message: "Користувача успішно видалено" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;