const express = require('express');
const app = express();
const cors = require('cors');
const parser = require('body-parser');

const morgan = require('morgan');
const logger = require('./logger');

const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

const BASE_URL = 'http'; // e.g http://localhost:3000/

morgan.token('body', function (req) { return JSON.stringify(req.body) });

app.use(morgan('":status - :response-time ms (len: :req[content-length]) :body',
    { stream: logger.stream }));
app.use(parser.urlencoded({
    extended: false
}));
app.use(parser.json());
app.use(cors());

puppeteer.launch().then((browser) => {

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`App listening on port ${port}!`));

    app.get('/', (req, res) => {
        /*
        Example body:
        
        {
        	"url": "https://www.google.com/",
	        "quality": 10,
	        "device": "iPhone X"
        }
        
        */

        const defaults = {
            quality: 10,
            device: 'iPhone 8'
        }
        const options = { ...defaults, ...req.body };
        const url = options.url;
        // A very simple (and somewhat insecure) way to secure this API
        if (process.env.TOKEN && req.body.token !== process.env.TOKEN) {
            res.status(403).send('invalid token');
        } else if (!url) {
            res.status(400).send('url missing from body');
        } else if (!url.startsWith(BASE_URL)) {
            res.status(400).send('url not allowed');
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
                    res.status(500).send('Failed to take process the request.')
                    console.error(err);
                }
                page.close();
            })();
        }
    });
});