export interface Player {
    username: string,
    id: string,
}

export interface Party {
    players: Player[],
    host: Player,
    id: string,
    isStarted: boolean;
}

const parties: Record<string, Party> = {};

export const findParty = (id: string): Party | null => parties[id];
export const setParty = (id: string, data: Party): void => {
    parties[id] = data;
};
export const findPlayerInParty = (party: Party, socketId: string): Player | undefined => party.players.find((player: Player) => player.id === socketId);
export const findUserParties = (socketId: string): Party[] => Object.values(parties).filter((party: Party) => !!findPlayerInParty(party, socketId));
export const removeUserFromParty = (partyId: string, socketId: string): void => {
    const party = findParty(partyId)!;
    const player = findPlayerInParty(party, socketId);

    party.players = party.players.filter((playerIt: Player) => playerIt !== player);

    if (party.players.length <= 0) {
        delete parties[partyId];
    }
};
export const generateRandomPartyId = (): string => {
    // @ts-ignore
    const chars = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
    // eslint-disable-next-line no-bitwise
    const partyId = [...Array(6)].map(() => chars[Math.random() * chars.length | 0]).join('');

    return !parties[partyId]
        ? partyId
        : generateRandomPartyId();
};
