const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');

//bodyParser lets Express know that the data we're usinf is in JSON format
app.use(bodyParser.json());

const redis = require('redis');

(async() => {

    const client = redis.createClient();

    const subscriber = client.duplicate();

    await subscriber.connect();

    await subscriber.subscribe('article', (message) => {
        console.log(message); // 'message'
    });

})();