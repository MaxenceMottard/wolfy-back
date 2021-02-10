// @ts-ignore
import { Adapter, Room, Socket } from 'socket.io';

const rooms: Record<string, RoomData> = {};

interface Player {
    username: string,
    id: string,
}

interface RoomData {
    players: [Player],
    host: Player,
    id: string,
}

const socketEvents = (socket: Socket, io: Adapter) => {
    socket.on('party:create', ({ username }: { username: string }) => {
        const id = 'ABDECHBA';
        const host = { username, id: socket.id };

        rooms[id] = { players: [host], host, id };

        socket.join(id);
        socket.emit('party:joined', JSON.stringify({ id }));
    });

    socket.on('party:join', ({ username, id }: { username: string, id: string }) => {
        const room = rooms[id];

        if (!room) {
            socket.emit('party:refused', JSON.stringify({ id }));
        } else {
            room.players.push({ username, id: socket.id });

            socket.join(id);
            socket.emit('party:joined', JSON.stringify({ id }));
        }
    });

    socket.on('party:player:new', ({ id }: { id: string }) => {
        const room = rooms[id];
        io.in(room.id).emit('party:player:join', JSON.stringify(room));
    });

    socket.on('rooms:list', () => {
        socket.emit('rooms:list', JSON.stringify({
            rooms: Object.keys(rooms),
        }));
    });
};

const sockets = (io: Adapter) => {
    io.on('connection', (socket: Socket) => {
        socketEvents(socket, io);
    });
};

export default sockets;
