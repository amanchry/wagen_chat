import { useGlobalStorage } from "@/provider/GlobalProvider";
import { CaretLeftIcon } from "@radix-ui/react-icons";
import { Box, Flex, IconButton, Text } from "@radix-ui/themes";
import React from "react";

function LayerListAccorduinsContainer({ children }) {
    const { showLayers, setShowLayers } = useGlobalStorage();
  return (
    <Box
      position={{ sm: "absolute", initial: "fixed" }}
      right={{ sm: "5", initial: "0" }}
      top={{ sm: "5", initial: "49px" }}
      bottom={{ sm: "auto", initial: "0" }}
      left={{ sm: "auto", initial: "0" }}
      display={{ initial: showLayers ? "block" : "none", sm: "block" }}
      className="bg-white z-20 rounded-lg"
      p={{ initial: "5", sm: "0" }}
      maxWidth={{ initial: "100%", sm: "200px" }}
    >
      <Box pb="5" display={{ sm: "none" }}>
        <Flex align="center" gap="2" pb="2">
          <IconButton variant="ghost" onClick={() => setShowLayers(false)}>
            <CaretLeftIcon className="size-5" />
          </IconButton>
          <Text size="5">Map Layers</Text>
        </Flex>
        <Text color="gray">View and apply relevant layers to the map.</Text>
      </Box>
      {children}
    </Box>
  );
}

export default LayerListAccorduinsContainer;
