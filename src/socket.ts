// @ts-ignore
import { Adapter, Room, Socket } from 'socket.io';
import {
    findParty, findUserParties, Party, Player, removeUserFromParty, setParty,
} from './services/party';

const socketEvents = (socket: Socket, io: Adapter) => {
    const socketId = socket.id;

    socket.on('disconnect', () => {
        const parties = findUserParties(socketId);
        parties.forEach((party) => {
            removeUserFromParty(party.id, socketId);
            io.in(party.id).emit('party:player:join', JSON.stringify(party));
        });
    });

    socket.emit('user:id', JSON.stringify({ userId: socketId }));

    socket.on('party:create', ({ username }: { username: string }) => {
        const id = 'ABDECHBA';
        const host: Player = { username, id: socketId };
        const party: Party = {
            players: [host], host, id, isStarted: false,
        };

        setParty(id, party);

        socket.join(id);
        socket.emit('party:joined', JSON.stringify({ id }));
    });

    socket.on('party:join', ({ username, id }: { username: string, id: string }) => {
        const party = findParty(id);

        if (!party) {
            socket.emit('party:refused', JSON.stringify({ id }));
        } else {
            party.players.push({ username, id: socketId });

            socket.join(id);
            socket.emit('party:joined', JSON.stringify({ id }));
        }
    });

    socket.on('party:player:new', ({ id }: { id: string }) => {
        const room = findParty(id);
        io.in(room?.id).emit('party:player:join', JSON.stringify(room));
    });

    /*
    socket.on('rooms:list', () => {
        socket.emit('rooms:list', JSON.stringify({
            rooms: Object.keys(rooms),
        }));
    });
    */
};

const sockets = (io: Adapter) => {
    io.on('connection', (socket: Socket) => {
        socketEvents(socket, io);
    });
};

export default sockets;
