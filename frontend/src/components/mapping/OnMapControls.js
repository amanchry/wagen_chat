import {
  Cross2Icon,
  Crosshair2Icon,
  EnterFullScreenIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@radix-ui/react-icons";
import { Box, Flex, IconButton } from "@radix-ui/themes";
import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useGlobal } from "@/hooks/useGlobal";

function OnMapControls({
  setIsFullScreen,
  isFullScreen,
  statsHeight = 200,
  section,
}) {
  const { map } = useGlobal();

  const handleZoom = (delta) => {
    if (map && map.getView) {
      const view = map.getView();
      const currentZoom = view.getZoom();
      view.animate({ zoom: currentZoom + delta, duration: 300 });
    }
  };

  return (
    <Flex
      position="absolute"
      right="4"
      gap="2"
      style={section === "home" ? { bottom: "34px" } : { bottom: "34px" }}
    >
      <button
        className="bg-lightGray p-1 rounded text-gray2"
        onClick={() => setIsFullScreen(!isFullScreen)}
      >
        <EnterFullScreenIcon width="24" height="24" />
      </button>
      <button
        className="bg-lightGray p-1 rounded text-gray2"
        onClick={() => handleZoom(1)}
      >
        <ZoomInIcon width="24" height="24" />
      </button>
      <button
        className="bg-lightGray p-1 rounded text-gray2"
        onClick={() => handleZoom(-1)}
      >
        <ZoomOutIcon width="24" height="24" />
      </button>
    </Flex>
  );
}

export default OnMapControls;
