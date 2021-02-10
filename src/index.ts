import express, { Application } from 'express';
import sockets from './socket';

const app: Application = express();

// eslint-disable-next-line no-console
const server = app.listen(9999, () => console.log('SERVER STARTED'));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const io = require('socket.io')(server, { path: '/' });

sockets(io);
