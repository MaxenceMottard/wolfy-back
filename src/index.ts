/* eslint-disable no-console,@typescript-eslint/no-var-requires */
import express, { Application } from 'express';
import sockets from './socket';

const app: Application = express();
const server = app.listen(80, () => console.log('SERVER STARTED'));
const io = require('socket.io')(server, { path: '/' });

sockets(io);
