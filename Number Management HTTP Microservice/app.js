const express = require('express');
const axios = require('axios');
const urlParse = require('url-parse');

const app = express();
const PORT = 8008;
const HOST = '192.168.1.8'; 
const TIMEOUT = 500; 

function Sort(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                
                const temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

app.get('/numbers', async (req, res) => {
    const urls = req.query.url;

    if (!urls || !Array.isArray(urls)) {
        return res.status(400).json({ error: 'Invalid or missing URL parameters' });
    }

    const result = [];

    for (const rawUrl of urls) {
        try {
            const parsedUrl = urlParse(rawUrl);

            if (!parsedUrl.protocol || !parsedUrl.hostname) {
                console.error(`Invalid URL: ${rawUrl}`);
                continue; 
            }

            const startTime = Date.now();
            const response = await axios.get(parsedUrl.href, { timeout: TIMEOUT });

            const elapsedTime = Date.now() - startTime;
            if (response.status === 200 && response.data.numbers && elapsedTime <= TIMEOUT) {
                result.push(...response.data.numbers);
            } else if (response.status === 503) {
                console.error(`Service unavailable for URL: ${parsedUrl.href}`);
            }
        } catch (error) {
            console.error(`Error fetching data from ${rawUrl}: ${error.message}`);
        }
    }

    
    Sort(result);

    return res.json({ numbers: result });
});

app.listen(PORT, HOST, () => {
    console.log(`Server is running on ${HOST}:${PORT}`);
});
