# Kids Chess Game

A modern, interactive chess game built with React, featuring an AI opponent and a friendly chess coach. Perfect for kids learning chess!

🎮 **[Play Live Demo](https://ai-powered-chess-game.vercel.app/)**

## Live Demo
The game is deployed and playable at: https://ai-powered-chess-game.vercel.app/

Features available in the live demo:
- Full gameplay functionality
- AI opponent
- Interactive chess coach
- Multiplayer support
- User authentication

## Features

### 🎮 Game Modes
- **Single Player vs AI**
  - Play against an AI opponent
  - AI adapts to player's skill level
  - Real-time move analysis

- **Multiplayer**
  - Play with friends online
  - Shareable game IDs
  - Real-time game synchronization
  - Player status indicators

### 🧙‍♂️ Interactive Chess Coach
- Personal chess buddy that offers:
  - Move suggestions
  - Strategy tips
  - Friendly conversation
  - Real-time game analysis
  - Kid-friendly explanations

### 🎯 Game Features
- Intuitive drag-and-drop interface
- Legal move highlighting
- Move history with clear notations
- Game state preservation
- One-click game restart
- Sound effects for moves and captures

### 👥 User Management
- User authentication
- Guest play option
- Profile management
- Game history tracking

### 🎨 Kid-Friendly UI
- Bright, engaging colors
- Clear visual feedback
- Emoji indicators
- Animated pieces
- Responsive design

### 🔒 Security
- Firebase authentication
- Secure game state management
- Protected multiplayer sessions

## Technical Stack
- React
- Firebase (Authentication & Firestore)
- chess.js for game logic
- p5.js for board rendering
- Google AI for chess coach
- Real-time websocket connections

## Getting Started

### Play Online
Visit [https://ai-powered-chess-game.vercel.app/](https://ai-powered-chess-game.vercel.app/) to play immediately.

### Run Locally
1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Copy your Firebase config to `firebase.jsx`

4. Start the development server:
```bash
npm run dev
```

## Project Structure
```
src/
├── components/         # React components
│   ├── ChessBoard/    # Board rendering
│   ├── ChessCoach/    # AI coach interface
│   └── GameControls/  # Game management
├── context/           # React context providers
├── services/          # External services
├── firebase/          # Firebase configuration
└── utils/            # Helper functions
```

## Game Controls
- **Left Click + Drag**: Move pieces
- **Release**: Complete move
- **Cancel**: Drag piece back or click elsewhere
- **Restart**: Click restart button
- **AI Toggle**: Enable/disable AI opponent

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Chess.js for chess logic
- p5.js for rendering
- Firebase for backend services
- Google AI for chess coach functionality
