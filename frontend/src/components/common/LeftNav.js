import { Box, Button, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useGlobalStorage } from "@/provider/GlobalProvider";
import Link from "next/link";
import styles from "./LeftNav.module.css";

function LeftNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("overView");
  const {
    showNav,
    setShowNav,
    showDataManual,
    setShowDataManual,
    showDownloads,
    setShowDownloads,
  } = useGlobalStorage();

useEffect(() => {
  if (pathname === "/") {
    setActiveNav("overView");
  } else if (pathname.startsWith("/water")) {
    setActiveNav("water");
  }else if (pathname.startsWith("/wagen")) {
    setActiveNav("overView");
  }else if (pathname.startsWith("/info")) {
    setActiveNav("info");
  }else {
    setActiveNav(""); // reset to none
  }
}, [pathname]);



  return (
    <>
      <Flex
        className="bg-[#FCFCFD]"
        direction="column"
        py="4"
        display={{ initial: "none", sm: "flex" }}
      >
        <Flex width="48px" height="48px" justify="center" align="center">
          <Tooltip content="Water Accounting Report Generator" side="right">
            <IconButton
              variant={activeNav === "overView" ? "soft" : "ghost"}
              size="4"
              radius="none"
              onClick={() => router.push("/")}
              id="overview"
              className={`${styles.navButton} ${activeNav === "overView" ? styles.active : ""}`}
              style={activeNav === "overView" ? { backgroundColor: "#EDF3F9" } : {}}
            >
              <Box
                as="span"
                className={`${
                  activeNav === "overView"
                    ? "icon-IconCrosshairSimple1"
                    : "icon-IconCrosshairSimple"
                } text-2xl ${styles.navIcon}`}
                style={activeNav === "overView" ? { color: "#3F7FC0" } : {}}
              ></Box>
            </IconButton>
          </Tooltip>
        </Flex>
        {/* <Flex width="48px" height="48px" justify="center" align="center">
          <Tooltip content="Water Balance & Usage" side="right">
            <IconButton
              variant={activeNav === "water" ? "soft" : "ghost"}
              size="4"
              radius="none"
              onClick={() =>
                router.push("/water")
              }
              id="water"
              className={`${styles.navButton} ${activeNav === "water" ? styles.active : ""}`}
              style={activeNav === "water" ? { backgroundColor: "#EDF3F9" } : {}}
            >
              <Box
                as="span"
                className={`${
                  activeNav === "water"
                    ? "icon-IconDropHalfBottom1"
                    : "icon-IconDropHalfBottom"
                } text-2xl ${styles.navIcon}`}
                style={activeNav === "water" ? { color: "#3F7FC0" } : {}}
              ></Box>
            </IconButton>
          </Tooltip>
        </Flex> */}


        

        <Flex width="48px" height="48px" justify="center" align="center">
          <Tooltip content="Info" side="right">
            <IconButton
              variant={activeNav === "info" ? "soft" : "ghost"}
              size="4"
              radius="none"
              onClick={() => router.push("/info")}
              id="info"
              className={`${styles.navButton} ${activeNav === "info" ? styles.active : ""}`}
              style={activeNav === "info" ? { backgroundColor: "#EDF3F9" } : {}}
            >
              <Box
                as="span"
                className={`${
                  activeNav === "info"
                    ? "icon-IconInfo"
                    : "icon-IconInfo"
                } text-2xl ${styles.navIcon}`}
                style={activeNav === "info" ? { color: "#3F7FC0" } : {}}
              ></Box>
            </IconButton>
          </Tooltip>
        </Flex>

        {/* <Flex width="48px" height="48px" justify="center" align="center">
          <Tooltip content="Water Accounting Report Generator" side="right">
            <IconButton
              variant={activeNav === "wagen" ? "soft" : "ghost"}
              size="4"
              radius="none"
              onClick={() => router.push("/wagen")}
              id="wagen"
              className={`${styles.navButton} ${activeNav === "wagen" ? styles.active : ""}`}
              style={activeNav === "wagen" ? { backgroundColor: "#EDF3F9" } : {}}
            >
              <Box
                as="span"
                className={`${
                  activeNav === "wagen"
                    ? "icon-Iconpdf1"
                    : "icon-Iconpdf"
                } text-2xl ${styles.navIcon}`}
                style={activeNav === "wagen" ? { color: "#3F7FC0" } : {}}
              ></Box>
            </IconButton>
          </Tooltip>
        </Flex> */}


      </Flex>

      <Flex
        position="fixed"
        width="300px"
        bottom="0"
        top="49px"
        left={showNav ? "0" : "-300px"}
        className={`bg-[#FCFCFD] z-20 transition-all easy-in-out max-w-[620px]`}
        direction="column"
        py="4"
        px="3"
        display={{ initial: "flex", sm: "none" }}
      >
        <Text size="5" my="5">
          Zambia Water Informatics Dashboard
        </Text>
        <Flex height="48px" align="center" className="w-full">
          <Tooltip content="Overview" side="right">
            <Link
              id="overview"
              className={`w-full flex gap-2 items-center ${styles.navLink} ${activeNav === "overView" ? styles.active : ""}`}
              href="/"
              style={activeNav === "overView" ? { backgroundColor: "#EDF3F9", padding: "8px", borderRadius: "4px" } : { padding: "8px" }}
            >
              <Box
                as="span"
                className={`${
                  activeNav === "overView"
                    ? "icon-IconCrosshairSimple1"
                    : "icon-IconCrosshairSimple"
                } text-lg ${styles.navIcon}`}
                style={activeNav === "overView" ? { color: "#3F7FC0" } : {}}
              ></Box>{" "}
              <Text>Overview</Text>
            </Link>
          </Tooltip>
        </Flex>
        <Flex height="48px" align="center">
          <Tooltip content="Water Balance & Usage" side="right">
            <Link
              href="/water"
              id="water"
              className={`w-full flex gap-2 items-center ${styles.navLink} ${activeNav === "water" ? styles.active : ""}`}
              style={activeNav === "water" ? { backgroundColor: "#EDF3F9", padding: "8px", borderRadius: "4px" } : { padding: "8px" }}
            >
              <Box
                as="span"
                className={`${
                  activeNav === "water"
                    ? "icon-IconDropHalfBottom1"
                    : "icon-IconDropHalfBottom"
                } text-lg ${styles.navIcon}`}
                style={activeNav === "water" ? { color: "#3F7FC0" } : {}}
              ></Box>{" "}
              <Text>Water Balance & Usage</Text>
            </Link>
          </Tooltip>
        </Flex>
        <Flex height="48px" justify="center" align="center">
          <Tooltip content="Ecosystem Productivity & Land Use" side="right">
            <Link
              id="ecosystem"
              className={`w-full flex gap-2 items-center ${styles.navLink} ${activeNav === "ecosystem" ? styles.active : ""}`}
              href="/ecosystem"
              style={activeNav === "ecosystem" ? { backgroundColor: "#EDF3F9", padding: "8px", borderRadius: "4px" } : { padding: "8px" }}
            >
              <Box
                as="span"
                className={`${
                  activeNav === "ecosystem"
                    ? "icon-IconMountains1"
                    : "icon-IconMountains"
                } text-lg ${styles.navIcon}`}
                style={activeNav === "ecosystem" ? { color: "#3F7FC0" } : {}}
              ></Box>{" "}
              <Text>Ecosystem Productivity & Land Use</Text>
            </Link>
          </Tooltip>
        </Flex>
        <Flex height="48px" justify="center" align="center">
          <Tooltip content="Climate & Environmental Conditions" side="right">
            <Link
              id="climate"
              className={`w-full flex gap-2 items-center ${styles.navLink} ${activeNav === "climate" ? styles.active : ""}`}
              href="/climate"
              style={activeNav === "climate" ? { backgroundColor: "#EDF3F9", padding: "8px", borderRadius: "4px" } : { padding: "8px" }}
            >
              <Box
                as="span"
                className={`${
                  activeNav === "climate"
                    ? "icon-IconCloudSun1"
                    : "icon-IconCloudSun"
                } text-lg ${styles.navIcon}`}
                style={activeNav === "climate" ? { color: "#3F7FC0" } : {}}
              ></Box>{" "}
              <Text>Climate & Environmental Conditions</Text>
            </Link>
          </Tooltip>
        </Flex>
        <Flex height="48px" justify="center" align="center">
          <Tooltip content="Additional Data & Resources" side="right">
            <Link
              id="data"
              className={`w-full flex gap-2 items-center ${styles.navLink} ${activeNav === "data" ? styles.active : ""}`}
              href="/other-data"
              style={activeNav === "data" ? { backgroundColor: "#EDF3F9", padding: "8px", borderRadius: "4px" } : { padding: "8px" }}
            >
              <Box
                as="span"
                className={`${
                  activeNav === "data"
                    ? "icon-IconDatabase1"
                    : "icon-IconDatabase"
                } text-lg ${styles.navIcon}`}
                style={activeNav === "data" ? { color: "#3F7FC0" } : {}}
              ></Box>{" "}
              <Text size="3">Additional Data & Resources</Text>
            </Link>
          </Tooltip>
        </Flex>
        <hr className="border-[var(--gray-6)] w-full my-4" />
        <Flex height="48px" justify="start" align="center">
          <Flex
            radius="none"
            variant="ghost"
            size="4"
            gap="2"
            onClick={() => {
              setShowDownloads(!showDownloads);
              setShowNav(false);
            }}
          >
            <Box as="span" className="icon-IconDownloadSimple text-lg"></Box>{" "}
            <Text>Downloads</Text>
          </Flex>
        </Flex>
        <Flex height="48px" justify="start" align="center">
          <Flex
            radius="none"
            variant="ghost"
            size="4"
            gap="2"
            onClick={() => {
              setShowDataManual(!showDataManual);
              setShowNav(false);
            }}
          >
            <Box as="span" className="icon-IconBook text-lg"></Box>{" "}
            <Text>Data Manual</Text>
          </Flex>
        </Flex>
      </Flex>
      {showNav && (
        <Box
          position="fixed"
          inset="0"
          top="49px"
          className="bg-black/50 z-[11]"
          onClick={() => setShowNav(false)}
        />
      )}
    </>
  );
}

export default LeftNav;
