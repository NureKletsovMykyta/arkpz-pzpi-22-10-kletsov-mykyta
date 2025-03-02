const express = require("express");
const User = require("../models/userModel");
const router = express.Router();

// 📌 Отримати всіх користувачів
router.get("/", async (req, res) => {
    try {
        const users = await User.getAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 📌 Додати нового користувача
router.post("/", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = await User.create(username, email, password);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 📌 Оновити інформацію про користувача
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password } = req.body;
        const updatedUser = await User.update(id, username, email, password);
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 📌 Видалити користувача
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await User.delete(id);
        res.json({ message: "Користувача успішно видалено" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;