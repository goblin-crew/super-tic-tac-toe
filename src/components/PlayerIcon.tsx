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
      icon: `${process.env.PUBLIC_URL}/icons/x.gif`,
    },
    O: {
      frame: `${process.env.PUBLIC_URL}/icons/o_frame.gif`,
      icon: `${process.env.PUBLIC_URL}/icons/o.gif`,
    },
  };

  const mode: "lottie" | "image" = "image"; // Change this to "image" to use the image instead of Lottie

  return (
    <>
      {mode === "image" && player ? (
        // <img
        //   src={imageMap[player as string]?.icon}
        //   alt={player || ""}
        //   className="object-contain w-full h-full"
        // />
        <div className="relative w-full h-full">
          {/* Frame as background */}
          <img
            src={imageMap[player as string]?.frame}
            alt={`${player || ""} frame`}
            className="object-contain absolute inset-0 w-full h-full"
          />
          {/* Icon on top */}
          <img
            src={imageMap[player as string]?.icon}
            alt={player || ""}
            className="object-contain absolute inset-0 w-full h-full z-10 p-4"
          />
        </div>
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
