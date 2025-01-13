import { type ClientSchema, a, defineData } from "@aws-amplify/backend"

const schema = a.schema({
  Player: a
    .model({
      id: a.string().required(),
      username: a.string().required(),
      email: a.string().required(),
      avatarUrl: a.string(),
      gamesPlayed: a.integer(),
      gamesWon: a.integer(),
      currentGameId: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Game: a
    .model({
      id: a.string().required(),
      status: a.enum(["waiting", "active", "completed", "initializing"]),
      currentPlayerId: a.string(),
      playerIds: a.string().array().required(),
      createdAt: a.datetime().required(),
      updatedAt: a.datetime().required(),
      winner: a.string(),
      discardPile: a.string().array().required(), // Array of card IDs
      deck: a.string().array().required(), // Array of card IDs
    })
    .authorization((allow) => [allow.publicApiKey()]),

  PlayerGameState: a
    .model({
      id: a.string().required(),
      playerId: a.string().required(),
      gameId: a.string().required(),
      hand: a.string().array().required(), // Array of card IDs
      properties: a.string().array().required(), // Array of card IDs
      bank: a.string().array().required(), // Array of card IDs
      isCreator: a.boolean(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Move: a
    .model({
      id: a.string().required(),
      gameId: a.string().required(),
      playerId: a.string().required(),
      type: a.enum(["draw", "play", "discard", "stack", "initial_deal"]),
      cardIds: a.string().array().required(),
      timestamp: a.datetime().required(),
      targetPlayerId: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
})

export type Schema = ClientSchema<typeof schema>
export default schema

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
})
