const jwt = require("jsonwebtoken");
const db = require("../config/db");

// 📌 Middleware для перевірки JWT
const authenticateUser = async (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ message: "Доступ заборонено. Немає токена." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // Отримуємо роль користувача з БД
        const userResult = await db.query("SELECT role FROM system_users WHERE id = $1", [decoded.id]);
        if (userResult.rowCount === 0) {
            return res.status(403).json({ message: "Користувач не знайдений" });
        }

        req.user.role = userResult.rows[0].role;
        next();
    } catch (error) {
        res.status(403).json({ message: "Невірний токен" });
        console.log("🔓 зaшифрований токен:", token);
    }
};

// 📌 Middleware для перевірки ролі
const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Недостатньо прав" });
        }
        next();
    };
};

module.exports = { authenticateUser, authorizeRole };