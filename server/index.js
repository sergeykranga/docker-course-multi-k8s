const keys = require('./keys');

// express setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// pg client setup
const { Pool } = require('pg');

const pgClient = new Pool({
    host: keys.pgHost,
    port: keys.pgPort,
    database: keys.pgDatabase,
    user: keys.pgUser,
    password: keys.pgPassword
});

pgClient.connect().then((client) => {
    client.query('CREATE TABLE IF NOT EXISTS values(number INT)')
        .catch((err) => console.log(err));
});

// redis setup
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();

// app routes
app.get('/', (request, response) => {
    response.send('Hi');
});

app.get('/values/all', async (request, response) => {
    const values = await pgClient.query('SELECT * FROM VALUES');
    response.send(values.rows);
});

app.get('/values/current', async (request, response) => {
    redisClient.hgetall('values', (error, values) => {
        response.send(values);
    });
});

app.post('/values', async (req, res) => {
    const index = req.body.index;

    if (parseInt(index) > 40) {
      return res.status(422).send('Index too high');
    }
  
    redisClient.hset('values', index, 'Nothing yet!');
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
  
    res.send({ working: true });
  });

app.listen(5000, error => {
    console.log('Listening')
});
