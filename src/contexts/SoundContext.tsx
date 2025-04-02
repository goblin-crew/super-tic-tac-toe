import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// Define the sound types
export enum SoundType {
  // UI Sounds
  BUTTON_CLICK = "button_click",
  MENU_NAVIGATION = "menu_navigation",
  GAME_START = "game_start",

  // Player X (Blue) Sounds
  X_MOVE = "x_move",
  X_HOVER = "x_hover",
  X_SUBBOARD_HOVER = "x_subboard_hover",
  X_SUBBOARD_WIN = "x_subboard_win",
  X_GAME_WIN = "x_game_win",

  // Player O (Red) Sounds
  O_MOVE = "o_move",
  O_HOVER = "o_hover",
  O_SUBBOARD_HOVER = "o_subboard_hover",
  O_SUBBOARD_WIN = "o_subboard_win",
  O_GAME_WIN = "o_game_win",

  // Game Sounds
  DRAW = "draw",

  // Music
  BACKGROUND_MUSIC = "background_music",
}

// Map sound types to file paths
const soundFiles: Record<SoundType, string> = {
  // UI Sounds
  [SoundType.BUTTON_CLICK]: "/sounds/ui_click.mp3",
  [SoundType.MENU_NAVIGATION]: "/sounds/ui_hover.mp3",
  [SoundType.GAME_START]: "/sounds/game_start.mp3",

  // Player X (Blue) Sounds
  [SoundType.X_MOVE]: "/sounds/x_move.mp3",
  [SoundType.X_HOVER]: "/sounds/x_hover.mp3",
  [SoundType.X_SUBBOARD_HOVER]: "/sounds/x_subboard_hover.mp3",
  [SoundType.X_SUBBOARD_WIN]: "/sounds/x_subboard_win.mp3",
  [SoundType.X_GAME_WIN]: "/sounds/x_game_win.mp3",

  // Player O (Red) Sounds
  [SoundType.O_MOVE]: "/sounds/o_move.mp3",
  [SoundType.O_HOVER]: "/sounds/o_hover.mp3",
  [SoundType.O_SUBBOARD_HOVER]: "/sounds/o_subboard_hover.mp3",
  [SoundType.O_SUBBOARD_WIN]: "/sounds/o_subboard_win.mp3",
  [SoundType.O_GAME_WIN]: "/sounds/o_game_win.mp3",

  // Game Sounds
  [SoundType.DRAW]: "/sounds/draw.mp3",

  // Music
  [SoundType.BACKGROUND_MUSIC]: "/sounds/background_music.mp3",
};

// Sound context interface
interface SoundContextType {
  isSoundEnabled: boolean;
  isMusicEnabled: boolean;
  volume: number;
  toggleSound: () => void;
  toggleMusic: () => void;
  setVolume: (volume: number) => void;
  playSound: (soundType: SoundType) => void;
  playMoveSound: (player: "X" | "O") => void;
  playHoverSound: (player: "X" | "O") => void;
  playSubBoardHoverSound: (player: "X" | "O") => void;
  playSubBoardWinSound: (player: "X" | "O") => void;
  playGameWinSound: (player: "X" | "O") => void;
  playDrawSound: () => void;
}

// Create the context with default values
const SoundContext = createContext<SoundContextType>({
  isSoundEnabled: true,
  isMusicEnabled: true,
  volume: 0.5,
  toggleSound: () => {},
  toggleMusic: () => {},
  setVolume: () => {},
  playSound: () => {},
  playMoveSound: () => {},
  playHoverSound: () => {},
  playSubBoardHoverSound: () => {},
  playSubBoardWinSound: () => {},
  playGameWinSound: () => {},
  playDrawSound: () => {},
});

// Sound provider props
interface SoundProviderProps {
  children: ReactNode;
}

// Cache for audio elements
const audioCache: Record<string, HTMLAudioElement> = {};

// Sound provider component
export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  // State for sound settings
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isMusicEnabled, setIsMusicEnabled] = useState<boolean>(true);
  const [volume, setVolumeState] = useState<number>(0.5);
  const [backgroundMusic, setBackgroundMusic] =
    useState<HTMLAudioElement | null>(null);

  // Load sound settings from localStorage on mount
  useEffect(() => {
    const savedSoundEnabled = localStorage.getItem("isSoundEnabled");
    const savedMusicEnabled = localStorage.getItem("isMusicEnabled");
    const savedVolume = localStorage.getItem("soundVolume");

    if (savedSoundEnabled !== null) {
      setIsSoundEnabled(savedSoundEnabled === "true");
    }

    if (savedMusicEnabled !== null) {
      setIsMusicEnabled(savedMusicEnabled === "true");
    }

    if (savedVolume !== null) {
      setVolumeState(parseFloat(savedVolume));
    }
  }, []);

  // Save sound settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("isSoundEnabled", isSoundEnabled.toString());
    localStorage.setItem("isMusicEnabled", isMusicEnabled.toString());
    localStorage.setItem("soundVolume", volume.toString());
  }, [isSoundEnabled, isMusicEnabled, volume]);

  // Initialize background music
  useEffect(() => {
    const music = new Audio(soundFiles[SoundType.BACKGROUND_MUSIC]);
    music.loop = true;
    music.volume = volume * 0.3; // Background music a bit quieter

    music.addEventListener("ended", () => {
      music.currentTime = 0;
      music.play().catch((error) => {
        console.error("Error replaying background music:", error);
      });
    });
    music.addEventListener("error", (error) => {
      console.error("Error loading background music:", error);
    });
    setBackgroundMusic(music);

    return () => {
      music.pause();
      music.currentTime = 0;
    };
  }, [volume]);

  // Track if user has interacted with the page
  const [userInteracted, setUserInteracted] = useState<boolean>(false);

  // Listen for user interaction
  useEffect(() => {
    const handleInteraction = () => {
      setUserInteracted(true);
    };

    // Add event listeners for common user interactions
    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  // Update background music state when settings change
  useEffect(() => {
    if (!backgroundMusic) return;

    if (isMusicEnabled && isSoundEnabled && userInteracted) {
      backgroundMusic.play().catch((error) => {
        console.error("Error playing background music:", error);
      });
    } else {
      backgroundMusic.pause();
    }

    backgroundMusic.volume = volume * 0.3;
  }, [isMusicEnabled, isSoundEnabled, volume, backgroundMusic, userInteracted]);

  // Get or create audio element for a sound
  const getAudio = useCallback(
    (soundType: SoundType): HTMLAudioElement => {
      const soundPath = soundFiles[soundType];

      if (!audioCache[soundPath]) {
        const prefix = window.location.origin + window.location.pathname;
        const path = prefix + soundPath;
        const finalPath = path.replace(/^\//, "");
        console.log("Loading sound:", path);
        const audio = new Audio(finalPath);
        audio.volume = volume;
        audioCache[soundPath] = audio;
      }

      // Update volume in case it changed
      audioCache[soundPath].volume = volume;

      return audioCache[soundPath];
    },
    [volume]
  );

  // Play a sound
  const playSound = useCallback(
    (soundType: SoundType) => {
      if (!isSoundEnabled || !userInteracted) return;

      // Don't play background music through this function
      if (soundType === SoundType.BACKGROUND_MUSIC) return;

      const audio = getAudio(soundType);

      // Reset the audio to the beginning if it's already playing
      audio.currentTime = 0;

      audio.play().catch((error) => {
        console.error(`Error playing sound ${soundFiles[soundType]}:`, error);
      });
    },
    [isSoundEnabled, getAudio, userInteracted]
  );

  // Helper functions for specific sound types
  const playMoveSound = useCallback(
    (player: "X" | "O") => {
      playSound(player === "X" ? SoundType.X_MOVE : SoundType.O_MOVE);
    },
    [playSound]
  );

  const playHoverSound = useCallback(
    (player: "X" | "O") => {
      playSound(player === "X" ? SoundType.X_HOVER : SoundType.O_HOVER);
    },
    [playSound]
  );

  const playSubBoardHoverSound = useCallback(
    (player: "X" | "O") => {
      playSound(
        player === "X" ? SoundType.X_SUBBOARD_HOVER : SoundType.O_SUBBOARD_HOVER
      );
    },
    [playSound]
  );

  const playSubBoardWinSound = useCallback(
    (player: "X" | "O") => {
      playSound(
        player === "X" ? SoundType.X_SUBBOARD_WIN : SoundType.O_SUBBOARD_WIN
      );
    },
    [playSound]
  );

  const playGameWinSound = useCallback(
    (player: "X" | "O") => {
      playSound(player === "X" ? SoundType.X_GAME_WIN : SoundType.O_GAME_WIN);
    },
    [playSound]
  );

  const playDrawSound = useCallback(() => {
    playSound(SoundType.DRAW);
  }, [playSound]);

  // Toggle sound on/off
  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => !prev);
  }, []);

  // Toggle music on/off
  const toggleMusic = useCallback(() => {
    setIsMusicEnabled((prev) => !prev);
  }, []);

  // Set volume
  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
  }, []);

  // Context value
  const contextValue: SoundContextType = {
    isSoundEnabled,
    isMusicEnabled,
    volume,
    toggleSound,
    toggleMusic,
    setVolume,
    playSound,
    playMoveSound,
    playHoverSound,
    playSubBoardHoverSound,
    playSubBoardWinSound,
    playGameWinSound,
    playDrawSound,
  };

  return (
    <SoundContext.Provider value={contextValue}>
      {children}
    </SoundContext.Provider>
  );
};

// Custom hook to use the sound context
export const useSound = () => useContext(SoundContext);

export default SoundContext;
