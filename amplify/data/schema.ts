import { type ClientSchema, a } from "@aws-amplify/backend";

const schema = {
  Card: a.model({
    id: a.string().required(),
    type: a.enum(['property', 'money', 'action']).required(),
    name: a.string().required(),
    value: a.integer().required(),
    color: a.string(),
    imageUrl: a.string(),
  }).authorization([a.allow.public()]),

  Player: a.model({
    id: a.string().required(),
    username: a.string().required(),
    email: a.string().required(),
    avatarUrl: a.string(),
    gamesPlayed: a.integer(),
    gamesWon: a.integer(),
    currentGameId: a.string(),
  }).authorization([a.allow.public()]),

  Game: a.model({
    id: a.string().required(),
    status: a.enum(['waiting', 'active', 'completed']).required(),
    currentPlayerId: a.string(),
    playerIds: a.array(a.string()).required(),
    createdAt: a.datetime().required(),
    updatedAt: a.datetime().required(),
    winner: a.string(),
    deck: a.array(a.string()).required(),
    discardPile: a.array(a.string()).required(),
  }).authorization([a.allow.public()]),

  PlayerGameState: a.model({
    id: a.string().required(),
    playerId: a.string().required(),
    gameId: a.string().required(),
    hand: a.array(a.string()).required(),
    properties: a.array(a.string()).required(),
    bank: a.array(a.string()).required(),
  }).authorization([a.allow.public()]),

  Move: a.model({
    id: a.string().required(),
    gameId: a.string().required(),
    playerId: a.string().required(),
    type: a.enum(['draw', 'play', 'discard']).required(),
    cardIds: a.array(a.string()).required(),
    timestamp: a.datetime().required(),
    targetPlayerId: a.string(),
  }).authorization([a.allow.public()]),
};

export default schema;
export type Schema = ClientSchema<typeof schema>;