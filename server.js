// server.js
const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Использование токена GitHub из переменных окружения или секретов
const token = process.env.GH_TOKEN;
const owner = 'rpfozzy';
const repo = 'botxxx';

app.use(express.json());

// Проверка работоспособности API
app.get('/check-api', async (req, res) => {
    try {
        const response = await fetch('https://api.github.com', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            res.status(200).send('API доступно');
        } else {
            res.status(500).send('Ошибка подключения к API');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).send('Ошибка подключения к API');
    }
});

// Получение запущенных GitHub Actions
app.get('/get-running-actions', async (req, res) => {
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).send('Ошибка при получении запущенных действий');
    }
});

// Отмена запущенного действия
app.post('/cancel-run/:id', async (req, res) => {
    const runId = req.params.id;
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            res.status(200).send('Действие отменено');
        } else {
            res.status(500).send('Ошибка при отмене действия');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).send('Ошибка при отмене действия');
    }
});

// Обновление файла bot.py
app.post('/update-bot-file', async (req, res) => {
    const newContent = req.body.newContent;

    if (!newContent) {
        return res.status(400).send('Необходимо предоставить новый контент');
    }

    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/bot.py`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        const fileData = await response.json();
        const sha = fileData.sha;

        const updateResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/bot.py`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: "Обновление bot.py через веб-интерфейс",
                content: Buffer.from(newContent).toString('base64'),
                sha: sha
            })
        });

        if (updateResponse.ok) {
            res.status(200).send('Файл bot.py успешно обновлен');
        } else {
            const errorResponse = await updateResponse.json();
            console.error('Ошибка при обновлении файла:', errorResponse);
            res.status(500).send('Ошибка при обновлении файла bot.py');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).send('Ошибка при обновлении файла bot.py');
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
