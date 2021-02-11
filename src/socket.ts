// @ts-ignore
import { Adapter, Socket } from 'socket.io';
import {
    findParty, findUserParties, generateRandomPartyId, Party, Player, removeUserFromParty, setParty,
} from './services/party';

const socketEvents = (socket: Socket, io: Adapter) => {
    const socketId = socket.id;

    socket.on('disconnect', () => {
        findUserParties(socketId).forEach((party) => {
            removeUserFromParty(party.id, socketId);
            socket.leave(party.id);
            io.in(party.id).emit('party:info', JSON.stringify(party));
        });
    });

    socket.emit('user:id', JSON.stringify({ userId: socketId }));

    socket.on('party:create', ({ username }: { username: string }) => {
        const id = generateRandomPartyId();
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
            return;
        }

        if (party.host.id === socketId) {
            io.in(party.id).emit('party:info', JSON.stringify(party));
        } else {
            party.players.push({ username, id: socketId });

            socket.join(id);
            io.in(party.id).emit('party:info', JSON.stringify(party));
        }
    });

    socket.on('party:leave', ({ id }: { id: string }) => {
        const party = findParty(id);

        if (!party) {
            return;
        }

        socket.leave(party.id);
        removeUserFromParty(party.id, socketId);
        io.in(party.id).emit('party:info', JSON.stringify(party));
    });
};

const sockets = (io: Adapter): void => {
    io.on('connection', (socket: Socket) => {
        socketEvents(socket, io);
    });
};

export default sockets;
