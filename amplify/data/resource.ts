import { type ClientSchema, a, defineData } from "@aws-amplify/backend"

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
})
// import { type ClientSchema, a, defineData } from "@aws-amplify/backend"

// const schema = a.schema({
//   Player: a
//     .model({
//       id: a.string().required(),
//       username: a.string().required(),
//       email: a.string().required(),
//       avatarUrl: a.string(),
//       gamesPlayed: a.integer(),
//       gamesWon: a.integer(),
//       currentGameId: a.string(),
//     })
//     .authorization((allow) => [allow.publicApiKey()]),

//   Game: a
//     .model({
//       id: a.string().required(),
//       status: a.enum(["waiting", "active", "completed"]),
//       currentPlayerId: a.string(),
//       playerIds: a.string().array().required(),
//       createdAt: a.datetime().required(),
//       updatedAt: a.datetime().required(),
//       winner: a.string(),
//       discardPile: a.string().array().required(), // Array of card IDs
//       deck: a.string().array().required(), // Array of card IDs
//     })
//     .authorization((allow) => [allow.publicApiKey()]),

//   PlayerGameState: a
//     .model({
//       id: a.string().required(),
//       playerId: a.string().required(),
//       gameId: a.string().required(),
//       hand: a.string().array().required(), // Array of card IDs
//       properties: a.string().array().required(), // Array of card IDs
//       bank: a.string().array().required(), // Array of card IDs
//       isCreator: a.boolean(),
//     })
//     .authorization((allow) => [allow.publicApiKey()]),

//   Move: a
//     .model({
//       id: a.string().required(),
//       gameId: a.string().required(),
//       playerId: a.string().required(),
//       type: a.enum(["draw", "play", "discard", "stack"]),
//       cardIds: a.string().array().required(),
//       timestamp: a.datetime().required(),
//       targetPlayerId: a.string(),
//     })
//     .authorization((allow) => [allow.publicApiKey()]),
// })

// export type Schema = ClientSchema<typeof schema>
// export default schema

// export const data = defineData({
//   schema,
//   authorizationModes: {
//     defaultAuthorizationMode: "apiKey",
//     apiKeyAuthorizationMode: {
//       expiresInDays: 30,
//     },
//   },
// })
