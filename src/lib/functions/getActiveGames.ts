import { client } from "./utils"

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export async function handler(_event: any) {
  try {
    const games = await client.models.Game.list({
      filter: {
        or: [{ status: { eq: "waiting" } }, { status: { eq: "active" } }],
      },
    })

    return {
      statusCode: 200,
      body: JSON.stringify(games),
    }
  } catch (error) {
    console.error("Error fetching active games:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error fetching active games" }),
    }
  }
}
