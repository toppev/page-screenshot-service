const express = require('express');
const app = express();
const cors = require('cors');

const morgan = require('morgan');
const logger = require('./logger');

const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

// If the page url does not start with this string, no screenshots will be taken
// e.g http://localhost:3000/
const PAGE_BASE_URL = 'http';

morgan.token('body', function (req) {
    return JSON.stringify(req.body)
});

app.use(express.json());
app.use(morgan('":url :status - :response-time ms (len: :req[content-length]) :body',
    { stream: logger.stream }));
app.use(cors());

puppeteer.launch().then(browser => {

    const port = process.env.PORT || 3005;
    app.listen(port, () => console.log(`App listening on port ${port}!`));

    app.get('/', (req, res) => {
        const defaults = {
            quality: 10,
            device: 'iPhone 8',
        }
        const options = { ...defaults, ...req.body };
        const url = options.url;
        // A very simple way to secure this service
        if (process.env.TOKEN && req.body.token !== process.env.TOKEN) {
            res.status(403).send({ message: 'Invalid token' });
        } else if (!url) {
            res.status(400).send({ message: 'Missing URL' });
        } else if (!url.startsWith(PAGE_BASE_URL)) {
            res.status(400).send({ message: 'URL not allowed' });
        } else {
            (async () => {
                const page = await browser.newPage();
                try {
                    await page.emulate(devices[options.device]);
                    await page.goto(url);
                    const ss = await page.screenshot({ type: 'jpeg', quality: options.quality });
                    res.contentType('image/jpeg');
                    res.end(ss);
                } catch (err) {
                    res.status(500).send({ message: 'Failed to process the request.' })
                    console.error(err);
                }
                page.close();
            })();
        }
    });
});

module.exports = app;