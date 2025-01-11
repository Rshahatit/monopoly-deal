# Monopoly Deal Online: A Multiplayer Card Game

Monopoly Deal Online is a digital adaptation of the popular Monopoly Deal card game, offering a fast-paced and strategic multiplayer experience. This project implements the game logic, user interface, and backend infrastructure for seamless online play.

The game is built using React for the frontend, AWS Amplify for backend services, and Vite as the build tool. It features real-time game state management, user authentication, and a responsive user interface that brings the classic Monopoly Deal experience to life in a digital format.

Players can create accounts, start new games, join existing ones, and enjoy the full Monopoly Deal experience, including property trading, rent collection, and action cards. The game logic closely follows the official Monopoly Deal rules, ensuring an authentic and engaging gameplay experience.

## Repository Structure

```
.
├── amplify/
│   ├── auth/
│   ├── data/
│   ├── backend.ts
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── __tests__/
│   ├── components/
│   ├── context/
│   ├── styles/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── amplify.yml
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### Key Files:
- `src/App.tsx`: Main React component for the application
- `src/context/GameContext.tsx`: Game state management and logic
- `src/utils/CardDeck.ts`: Card deck initialization and management
- `src/utils/gameLogic.ts`: Core game rules and logic implementation
- `amplify/backend.ts`: Amplify backend configuration
- `amplify/data/schema.ts`: Data models for the application
- `vite.config.ts`: Vite build configuration

## Usage Instructions

### Installation

Prerequisites:
- Node.js (v14 or later)
- npm (v6 or later)
- AWS account with Amplify CLI configured

Steps:
1. Clone the repository:
   ```
   git clone <repository-url>
   cd monopoly-deal-online
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Initialize Amplify backend:
   ```
   amplify init
   amplify push
   ```

### Getting Started

To run the development server:

```
npm run dev
```

This will start the Vite development server, typically at `http://localhost:5173`.

### Configuration

The game uses AWS Amplify for backend services. Ensure you have the correct Amplify configuration in the `amplify` directory. You may need to update the `amplify/backend.ts` file with your specific Amplify resource configurations.

### Common Use Cases

1. Creating a new game:
   ```typescript
   const { createGame } = useGame();
   const gameId = await createGame();
   ```

2. Joining an existing game:
   ```typescript
   const { joinGame } = useGame();
   await joinGame(gameId);
   ```

3. Playing a card:
   ```typescript
   const { playCard } = useGame();
   await playCard(cardId, targetPlayerId);
   ```

4. Drawing a card:
   ```typescript
   const { drawCard } = useGame();
   await drawCard();
   ```

### Testing & Quality

To run the test suite:

```
npm test
```

This will execute the Jest test runner for all test files in the `src/__tests__` directory.

### Troubleshooting

1. Issue: Game state not updating in real-time
   - Error message: "Failed to update game state"
   - Diagnostic process:
     1. Check your internet connection
     2. Verify Amplify subscriptions are working:
        ```typescript
        const sub = client.models.Game.observeQuery().subscribe({
          next: ({ items }) => console.log(items)
        });
        ```
     3. Check AWS AppSync console for any subscription errors
   - Solution: Ensure your Amplify backend is properly configured and your AWS credentials are valid

2. Issue: Card actions not reflecting in the game
   - Error message: "Failed to play card"
   - Debugging:
     1. Enable verbose logging in `GameContext.tsx`:
        ```typescript
        console.log('Playing card:', cardId, 'Target:', targetPlayerId);
        ```
     2. Check the browser console for detailed error messages
   - Solution: Verify that the card action is valid for the current game state and player turn

### Performance Optimization

- Monitor API call frequency using AWS CloudWatch
- Implement caching for frequently accessed game data
- Use React.memo for components that render frequently but rarely change

## Data Flow

The Monopoly Deal Online application follows a unidirectional data flow pattern, leveraging React's context API and AWS Amplify for real-time updates.

1. User Action: The user interacts with the UI (e.g., plays a card, draws a card).
2. Context Update: The action is processed by the `GameContext`, which updates the local state.
3. API Call: The context makes an API call to update the backend (AWS AppSync/DynamoDB).
4. Real-time Update: Amplify's real-time subscriptions receive the update.
5. State Sync: The `GameContext` syncs the local state with the received update.
6. UI Re-render: React components re-render based on the updated context state.

```
User Action -> GameContext -> AWS AppSync -> DynamoDB
     ^                            |
     |                            v
React Components <- GameContext <- Real-time Subscription
```

Note: Ensure proper error handling and loading states are implemented throughout this flow to provide a smooth user experience.

## Infrastructure

The Monopoly Deal Online application uses AWS Amplify for its backend infrastructure. Key resources include:

- Lambda:
  - `CreateGameFunction`: Handles game creation logic
  - `JoinGameFunction`: Manages player joining process
  - `PlayCardFunction`: Processes card play actions
  - `DrawCardFunction`: Handles card drawing logic

- AppSync:
  - `MonopolyDealAPI`: GraphQL API for game operations

- DynamoDB:
  - `GameTable`: Stores game state information
  - `PlayerTable`: Manages player data
  - `MoveTable`: Records game moves and actions

- Cognito:
  - `UserPool`: Handles user authentication and authorization

- S3:
  - `AssetBucket`: Stores static assets like card images

Ensure that your `amplify/backend.ts` file correctly configures these resources for your specific deployment needs.