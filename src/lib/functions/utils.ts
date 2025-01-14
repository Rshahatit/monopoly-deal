import { Schema } from "../../../amplify/data/resource"
import { generateClient } from "@aws-amplify/api"

// Initialize the AWS Amplify client for database operations
export const client = generateClient<Schema>()

// Helper function to shuffle an array
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}
