import Lottie from "lottie-react";
import xAnimation from "../assets/lottie/xAnimation.json";
import oAnimation from "../assets/lottie/oAnimation.json";

interface PlayerIconProps {
  player: "X" | "O" | "Draw" | null;
}

const PlayerIcon: React.FC<PlayerIconProps> = ({ player }) => {
  const imageMap: { [key: string]: { frame: string; icon: string } } = {
    X: {
      frame:
        "https://cdn.akamai.steamstatic.com/steamcommunity/public/images/items/1505620/1fce705218bd7ff793aff02555ca00d4de0b147c.png",
      icon: "/icons/x.gif",
    },
    O: {
      frame: "/icons/o_frame.gif",
      icon: "/icons/o.gif",
    },
  };

  const mode: "lottie" | "image" = "image"; // Change this to "image" to use the image instead of Lottie

  return (
    <>
      {mode === "image" ? (
        <img
          src={imageMap[player as string]?.frame}
          alt={player || ""}
          style={{
            width: "100%",
            height: "100%",
            margin: "0 auto",
          }}
        />
      ) : (
        <>
          {player === "Draw" && "D"}
          {player === "X" && <Lottie animationData={xAnimation} loop={true} />}
          {player === "O" && <Lottie animationData={oAnimation} loop={true} />}
        </>
      )}
    </>
  );
};

export default PlayerIcon;
