const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const token = (process.env.BOT_TOKEN);
const webAppUrl = 'https://cheery-brioche-704b1a.netlify.app';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start') {
        await bot.sendMessage(chatId, 'Зявилася кнопка нижче, заповни форму', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заповніть форму', web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        })

        await bot.sendMessage(chatId, 'Завітай в інтернет магазин натиснувши на кнопку нижче', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Зробити замовлення', web_app: {url: webAppUrl}}]
                ]
            }
        })
    }

    if(msg && msg.web_app_data && msg.web_app_data.data) {
        try {
            const data = JSON.parse(msg && msg.web_app_data && msg.web_app_data.data)
            console.log(data)
            await bot.sendMessage(chatId, 'Дякую за відповідь!')
            await bot.sendMessage(chatId, 'Ваша країна: ' + data && data.country);
            await bot.sendMessage(chatId, 'Ваша вулиця: ' + data && data.street);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Всю інформацію ви отримаєте у цьому чаті');
            }, 3000)
        } catch (e) {
            console.log(e);
        }
    }
});

app.post('/web-data', async (req, res) => {
    const {queryId, products = [], totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
            }
        })
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))

