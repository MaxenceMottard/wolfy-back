// @ts-ignore
import { Adapter, Socket } from 'socket.io';
import {
    findParty, findUserParties, generateRandomPartyId, Party, Player, removeUserFromParty, setParty,
} from './services/party';

enum EmitEvent {
    userId = 'user:id',
    partyJoined = 'party:joined',
    partyRefused = 'party:refused',
    partyInfo = 'party:info',
}

enum SubscribeEvent {
    disconnect = 'disconnect',
    connection = 'connection',
    partyCreate = 'party:create',
    partyJoin = 'party:join',
    partyLeave = 'party:leave',
}

const socketEvents = (socket: Socket, io: Adapter) => {
    const socketId = socket.id;

    socket.on(SubscribeEvent.disconnect, () => {
        findUserParties(socketId).forEach((party) => {
            removeUserFromParty(party.id, socketId);
            socket.leave(party.id);
            io.in(party.id).emit(EmitEvent.partyInfo, JSON.stringify(party));
        });
    });

    socket.emit(EmitEvent.userId, JSON.stringify({ userId: socketId }));

    socket.on(SubscribeEvent.partyCreate, ({ username }: { username: string }) => {
        const id = generateRandomPartyId();
        const host: Player = { username, id: socketId };
        const party: Party = {
            players: [host], host, id, isStarted: false,
        };

        setParty(id, party);

        socket.join(id);
        socket.emit(EmitEvent.partyJoined, JSON.stringify({ id }));
    });

    socket.on(SubscribeEvent.partyJoin, ({ username, id }: { username: string, id: string }) => {
        const party = findParty(id);

        if (!party) {
            socket.emit(EmitEvent.partyRefused, JSON.stringify({ id }));

            return;
        }

        if (party.host.id !== socketId) {
            party.players.push({ username, id: socketId });

            socket.join(id);
        }

        io.in(party.id).emit(EmitEvent.partyInfo, JSON.stringify(party));
    });

    socket.on(SubscribeEvent.partyLeave, ({ id }: { id: string }) => {
        const party = findParty(id);

        if (!party) {
            return;
        }

        socket.leave(party.id);
        removeUserFromParty(party.id, socketId);
        io.in(party.id).emit(EmitEvent.partyInfo, JSON.stringify(party));
    });
};

const sockets = (io: Adapter): void => {
    io.on(SubscribeEvent.connection, (socket: Socket) => {
        socketEvents(socket, io);
    });
};

export default sockets;
