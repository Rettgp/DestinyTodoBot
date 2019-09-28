const express = require('express');
const bodyParser = require('body-parser');
const EventEmitter = require('events');

const PORT = process.env.PORT || 80;

const app = express();
app.use(bodyParser.json());

class WebhookListener extends EventEmitter
{
    listen()
    {
        app.post('/ffxi', (req, res) =>
        {
            const data = req.body;
            if (data.source === "linkshell")
            {
                const source = data.source;
                const from = data.from;
                const message = data.content;

                this.emit(
                    'message',
                    source,
                    from,
                    message
                );
            }
            else if (data.source === "invite")
            {
                const source = data.source;
                const from = data.from;
                const to = data.to;
                const message = data.content;

                this.emit(
                    'invite',
                    source,
                    from,
                    to,
                    message
                );
            }
            else if (data.source === "tell")
            {
                const source = data.source;
                const from = data.from;
                const to = data.to;
                const message = data.content;

                this.emit(
                    'tell',
                    source,
                    from,
                    to,
                    message
                );
            }

            res.send({ status: 'OK' });
        });

        app.listen(PORT);
    }
}

const listener = new WebhookListener();
listener.listen();

module.exports = listener;