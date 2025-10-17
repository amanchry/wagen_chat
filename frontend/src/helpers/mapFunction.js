export const BaseMapsLayers = [
    {
        name: "Street Map",
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Basemap: Esri, TomTom, FAO, NOAA, USGS'
    },
    {
        name: "Hybrid Map",
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: "Basemap: ©2024 NASA, TerraMetrics <a href='https://www.google.com/intl/en-US_US/help/terms_maps/'> Terms</a>"
    },
  // ...add more as needed
];

export const mapCenter = [0,0]
export const setInitialMapZoom = () => {
  if (typeof window === "undefined") return 5; // default zoom for SSR
  const viewportWidth = window.innerWidth;
  if (viewportWidth <= 767) return 5;
  if (viewportWidth >= 2000) return 6.5;
  if (viewportWidth >= 1600) return 6;
  if (viewportWidth >= 768) return 5.5;
  return 5;
};

export const setDragging = () => {
  if (typeof window === "undefined") return true; // default to true for SSR
  const viewportWidth = window.innerWidth;
  return viewportWidth >= 768;
};

export const maxBounds = [24, -10, 54, 10]; // [minX, minY, maxX, maxY] in EPSG:4326

