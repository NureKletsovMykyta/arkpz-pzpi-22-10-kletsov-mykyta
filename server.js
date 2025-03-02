require("dotenv").config(); // Завантаження змінних середовища з файлу .env
const express = require("express"); // Підключення Express
const cors = require("cors"); // Підключення CORS для роботи з API
const db = require("./config/db"); // Імпорт підключення до бази даних
const authRoutes = require("./routes/auth"); // Маршрути авторизації
const userRoutes = require("./routes/users"); // Маршрути для управління користувачами

const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com'); // URL вашого MQTT-брокера

const app = express(); // Ініціалізація Express

// 📌 Використання Middleware
app.use(cors()); // Включає підтримку CORS
app.use(express.json()); // Дозволяє обробляти JSON-запити
app.use(express.static('public')); // Обслуговування статичних файлів

// 📌 Підключення маршрутів
app.use("/auth", authRoutes); // Маршрути для авторизації
app.use("/users", userRoutes); // Маршрути для управління користувачами

// 📌 Головна сторінка API
app.get("/", (req, res) => {
    res.send("🚀 API працює! Використовуйте /auth або /users");
});

// 📌 Маршрут для отримання даних з таблиці sensors
app.get("/sensors", async (req, res) => {
    try {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        const result = await db.query(`
         SELECT DISTINCT ON (type) id, type, count, status
FROM sensors
WHERE type IN ('Entrance', 'Into', 'Exit')
ORDER BY type, id DESC;
        `);
        console.log(result.rows); // Додано логування
        res.json(result.rows);
    } catch (error) {
        console.error("Помилка отримання даних з таблиці sensors:", error);
        res.status(500).json({ message: "Помилка отримання даних з таблиці sensors" });
    }
});

// 📌 Глобальна обробка помилок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Внутрішня помилка сервера" });
});

// 📌 Запуск сервера
const PORT = process.env.PORT; // || 5000;
app.listen(PORT, async () => {
    try {
        // Перевірка з'єднання з базою даних перед стартом сервера
        await db.query("SELECT NOW()");
        console.log(`✅ Сервер запущено на порті ${PORT}`);
        console.log("📌 Підключення до бази успішне!");
    } catch (error) {
        console.error("❌ Помилка підключення до бази:", error);
    }
});

client.on('connect', function () {
    console.log('Підключено до MQTT-брокера');
    client.subscribe('iot/count', function (err) {
        if (!err) {
            console.log('Підписано на топік: iot/count');
        }
    });
});

client.on('message', async function (topic, message) {
    // message є Buffer
    console.log(`Отримано повідомлення з топіка ${topic}: ${message.toString()}`);
    // Тут можна додати збереження у базу даних, логування тощо.
    try {
        const data = JSON.parse(message.toString());
        console.log(data);
        const { Entrance, Into, Exit } = data;

        const status = 'active';
        const type1 = 'Entrance';
        const type2 = 'Into';
        const type3 = 'Exit';

        // SQL-запит для вставки даних у таблицю sensors
        const insertQuery = 'INSERT INTO sensors (count, type, status) VALUES ($1, $2, $3) RETURNING *';

        // Вставка першого рядка
        let result = await db.query(insertQuery, [Entrance, type1, status]);
        console.log("Новий запис додано у таблицю sensors:", result.rows[0]);

        // Вставка другого рядка
        result = await db.query(insertQuery, [Into, type2, status]);
        console.log("Новий запис додано у таблицю sensors:", result.rows[0]);

        // Вставка третього рядка
        result = await db.query(insertQuery, [Exit, type3, status]);
        console.log("Новий запис додано у таблицю sensors:", result.rows[0]);

    } catch (error) {
        console.error("Помилка обробки повідомлення:", error);
    }
});