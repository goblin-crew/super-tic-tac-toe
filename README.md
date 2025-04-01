# Super Tic Tac Toe

A modern implementation of Super Tic Tac Toe with a dark glassmorphism theme.

## Playing the game

The game is deployed here: https://goblin-crew.github.io/super-tic-tac-toe/

### Game Rules

Super Tic Tac Toe begins with a 3x3 grid, but in each of its squares another tic tac toe game is placed. The first player can play in any of these 81 spaces. The next player must play in the game whose location corresponds to the square chosen in the previous move.

For example, if player X chooses the upper right square in one of the sub-boards, player O must play in the upper right sub-board. Play continues like this until someone gets 3 in a row in one of the sub-boards. When they do, that entire square is marked for them.

If a player is ever forced to play in a sub-board that has already been won, they can choose to play anywhere. Play continues until someone wins 3 sub-boards in a row.

## Features

- Dark glassmorphism UI theme with subtle glow effects
- Local and online multiplayer modes
- Peer-to-peer connection for online play
- Responsive design
- Symmetrical square game board with consistent spacing
- Visual player turn indicators with color-coded highlights
- Animated UI elements for better user experience

## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`
Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
