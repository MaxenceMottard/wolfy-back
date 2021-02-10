/* eslint-disable no-console,@typescript-eslint/no-var-requires,import/no-extraneous-dependencies,global-require */
import express, { Application, Response } from 'express';
import fs from 'fs';
import path from 'path';
import sockets from './socket';

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { PORT } = process.env;

const app: Application = express();

app.get('/apple-app-site-association', (_, res: Response) => {
    fs.readFile(path.join(__dirname, '../apple-app-site-association.json'), (_, data) => {
        res.contentType('application/json').send(data.toString());
    });
});

const server = app.listen(PORT, () => console.log(`SERVER STARTED PORT=${PORT}`));
const io = require('socket.io')(server, { path: '/socket.io' });

sockets(io);
