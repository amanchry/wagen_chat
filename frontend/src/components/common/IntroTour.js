import React, { useRef } from "react";
import { Steps } from "intro.js-react";
import "intro.js/introjs.css";

export default function IntroTour({ run, setRun }) {
  const steps = [
    {
      element: "#selectLocation",
      intro: `
        <div>
          <div class="p-6 pt-0">
            Select your preferred view and feature. Click on the search button to update results.
          </div>
          <img src="/images/selectLocation.jpg" alt="" width="337" height="225" class="w-full" />
        </div>
      `,
      title: "Select location of interest",
      position: "right",
    },
    {
      element: "#viewAreaStats",
      intro: `
        <div >
            <div class="p-6 pt-0">
              Switch to find an overview of total area or cropland area
              statistics across different parameters.
            </div>
            <img
              src="/images/viewAreaStats.jpg"
              alt=""
              width="337"
              height="225"
            />
        </div>
          `,
      title: "Overview Stats",
      position: "bottom-middle-aligned",
    },
    {
      element: "#overview",
      intro: `
        <div >
          <div class="p-6 pt-0">
            Find statistical overview of Total or Cropland area for your
              selected location of interest.
          </div>
        </div>
      `,
      title: "Overview",
      position: "right",
    },
    {
      element: "#water",
      intro: `
            <div class="p-6 pt-0">
              Find information around Evapotranspiration, Precipitation, Water
              Footprint, Virtual Water and Water Productivity here.
            </div>
        `,
      title: "Water Availability & Usage",
      position: "right",
    },
    {
      element: "#ecosystem",
      intro: `
            <div class="p-6 pt-0">
              Find information around Biomass Production, Land Cover
              classification and Hydronomic Zones here.
            </div>
        `,
      title: "Ecosystem & Land Insights",
      position: "right",
    },
    {
      element: "#climate",
      intro: `
              <div class="p-6 pt-0">
                Find information around Drought Condition and Climate Change here.
              </div>
          `,
      title: "Climate & Environmental Conditions",
      position: "right",
    },
    {
      element: "#data",
      intro: `
            <div class="p-6 pt-0">
                Find additional data like Cropping Intensity, Population Density,
            Elevation etc. for your selected location of interest visualised
            on the map.
            </div>
            `,
      title: "Additional Data",
      position: "right",
    },
  ];

  const observerRef = useRef(null);

  const onExit = () => {
    setRun(false);
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  };

  return (
    <>
      <style jsx global>{`
        .introjs-tooltipReferenceLayer * {
          font-family: var(--font-dm-sans), "sans-serif";
        }
        .introjs-helperLayer {
          padding: 0 !important;
        }
        .introjs-tooltip-header {
          padding: 50px 24px 4px;
        }
        .introjs-tooltiptext {
          font-size: 12px;
          color: #60646c;
          padding: 0;
        }
        .introjs-tooltip {
          display: flex;
          flex-direction: column;
          min-width: 340px;
          max-width: 340px;
          width: 100%;
        }
        .introjs-skipbutton {
          top: 24px;
        }
        .introjs-helperNumberLayer {
          font-size: 12px;
          color: #000;
          position: absolute;
          top: 24px;
          left: 24px;
          padding: 0;
        }
        .introjs-stepnumber {
          order: 0;
          margin-bottom: 8px;
          align-self: flex-end;
          background: #264c73 !important;
          color: #fff !important;
          font-weight: bold;
          font-size: 14px;
        }
        .introjs-tooltip-title {
          order: 1;
          color: #1c2024;
          font-weight: 500;
          font-size: 20px;
        }
        .introjs-button,
        .introjs-donebutton {
          background: #32669a !important ;
          color: #fff !important;
          text-shadow: none;
          border: none !important;
          min-width: 80px;
          text-align: center;
          border-radius: 4px;
        }
        .introjs-prevbutton {
          background: #d9e5f2 !important;
          color: #3f7fc0 !important;
        }
        .introjs-tooltipbuttons {
          border: none;
          padding: 10px 24px 24px;
        }
        .customHighlight {
          box-shadow: rgba(33, 33, 33, 0.8) 0px 0px 0px 0px,
            rgba(33, 33, 33, 0.9) 0px 0px 0px 5000p !important;
        }
        .customHighlight:after {
          content: "";
          position: absolute;
          inset: 0;
          border: 5px solid rgba(33, 33, 33, 0.9);
        }
      `}</style>
      <Steps
        enabled={run}
        steps={steps}
        initialStep={0}
        onExit={onExit}
        options={{
          showStepNumbers: true,
          stepNumbersOfLabel: "/",
          showProgress: false,
          showBullets: false,
          exitOnOverlayClick: false,
          exitOnEsc: true,
          nextLabel: "Next",
          prevLabel: "Previous",
          skipLabel: `<span style='display:flex;align-items:center;justify-content:center'><svg width='24' height='24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 1 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06Z' fill='currentColor'/></svg></span>`,
          doneLabel: "Done",
          overlayOpacity: 0.9,
          tooltipClass: "customTooltip",
          highlightClass: "customHighlight",
        }}
      />
    </>
  );
}
