import React, { useState } from "react";
import { Heart, Star, Bookmark, ThumbsUp, Bell } from "lucide-react";
import { IconButton } from "../ui/animate-icon";

const HeartIcon = ({active , handleClick}) => {
  const [states, setStates] = useState({ 
    heart: false,
    star: false,
    bookmark: false,
    thumbs: false,
    bell: false,
  });



  return (
      <div className="flex flex-col bg-white justify- p-[4px] rounded-[10px] items-center gap-2">
        <IconButton
          icon={Heart}
          active={active}
          color={[0,0,0]} // red-500
          onClick={handleClick}
          size="sm"
        />
      </div>

  );
};

export default HeartIcon;