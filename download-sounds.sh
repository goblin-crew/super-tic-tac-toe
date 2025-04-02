#!/bin/bash

# Create sounds directory if it doesn't exist
mkdir -p public/sounds

# Download sound files
echo "Downloading sound files..."

# UI Sounds
curl -o public/sounds/ui_click.mp3 https://freesound.org/data/previews/242/242501_4284968-lq.mp3
curl -o public/sounds/ui_hover.mp3 https://freesound.org/data/previews/242/242503_4284968-lq.mp3
curl -o public/sounds/game_start.mp3 https://freesound.org/data/previews/320/320655_5260872-lq.mp3

# Player X (Blue/Ice/Electric) Sounds
curl -o public/sounds/x_move.mp3 https://freesound.org/data/previews/268/268557_5094301-lq.mp3
curl -o public/sounds/x_hover.mp3 https://freesound.org/data/previews/80/80921_1022651-lq.mp3
curl -o public/sounds/x_subboard_hover.mp3 https://freesound.org/data/previews/184/184652_2552-lq.mp3
curl -o public/sounds/x_subboard_win.mp3 https://freesound.org/data/previews/320/320653_5260872-lq.mp3
curl -o public/sounds/x_game_win.mp3 https://freesound.org/data/previews/320/320654_5260872-lq.mp3

# Player O (Red/Fire) Sounds
curl -o public/sounds/o_move.mp3 https://freesound.org/data/previews/156/156031_2703579-lq.mp3
curl -o public/sounds/o_hover.mp3 https://freesound.org/data/previews/117/117740_1954711-lq.mp3
curl -o public/sounds/o_subboard_hover.mp3 https://freesound.org/data/previews/234/234749_4284968-lq.mp3
curl -o public/sounds/o_subboard_win.mp3 https://freesound.org/data/previews/125/125630_1888562-lq.mp3
curl -o public/sounds/o_game_win.mp3 https://freesound.org/data/previews/125/125629_1888562-lq.mp3

# Game Sounds
curl -o public/sounds/draw.mp3 https://freesound.org/data/previews/142/142608_2494244-lq.mp3

# Background Music
curl -o public/sounds/background_music.mp3 https://freesound.org/data/previews/415/415346_7866307-lq.mp3

echo "Sound files downloaded successfully!"
