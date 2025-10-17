"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Tile, Group } from "ol/layer";
import { XYZ } from "ol/source";
import * as ol from "ol";
import { useGlobal } from "@/hooks/useGlobal";
import "ol/ol.css";
import { defaults as defaultControls, ScaleLine } from "ol/control";
import { View } from "ol";
import { useSelectedFeatureContext } from "@/provider/SelectedFeatureContext";
import { mapCenter } from "@/helpers/mapFunction";
import VectorSource from "ol/source/Vector.js";
import { Fill, Stroke, Style, Circle as CircleStyle } from "ol/style.js";
import { GeoJSON } from "ol/format";
import VectorLayer from "ol/layer/Vector.js";
import { PenTool, MapPin, Slash, Undo2, Trash2, Upload } from "lucide-react";
import Draw from "ol/interaction/Draw.js";
import shp from 'shpjs';
import { useToast } from "@/provider/ToastContext";


function Map({ children }) {
  const { setMap } = useGlobal();

  const { drawnGeojson, setDrawnGeojson } = useGlobal();

  const mapRef = useRef();
  const baseLayersRef = useRef({});
  const mapObjRef = useRef();
  const throttleRef = useRef(null);

  const sourceRef = useRef(null);
  const drawRef = useRef(null);
  const fileInputRef = useRef(null);

  const [activeTool, setActiveTool] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { showToast } = useToast();


  // Refs for direct DOM manipulation
  const scaleRef = useRef(null);
  const coordsRef = useRef(null);

  const [hoverCoords, setHoverCoords] = useState(null);
  const [activeAttribution, setActiveAttribution] = useState("");


  const updateScale = map => {
    // Try to get the scale directly from the ScaleLine control
    const scaleLineControl = map
      .getControls()
      .getArray()
      .find(control => control instanceof ScaleLine);

    let displayDistance;

    if (scaleLineControl) {
      // Access the rendered scale line element
      const scaleElement = scaleLineControl.element;
      const scaleText = scaleElement?.querySelector(".ol-scale-text");

      if (scaleText && scaleText.textContent) {
        displayDistance = scaleText.textContent.trim();
      }
    }

    // Fallback to manual calculation if we can't read from ScaleLine
    if (!displayDistance) {
      const view = map.getView();
      const resolution = view.getResolution();
      const center = view.getCenter();
      const latitude = center[1];

      // Calculate meters per degree at current latitude (same as OpenLayers ScaleLine)
      const metersPerDegree =
        111319.49079327358 * Math.cos((latitude * Math.PI) / 180);

      // This is the ground distance per pixel
      const metersPerPixel = resolution * metersPerDegree;

      // OpenLayers ScaleLine typically uses a standard width (like 64 or 100 pixels)
      // Let's use 100 pixels to match common ScaleLine behavior
      const scaleBarWidthPixels = 100;
      const scaleBarDistanceMeters = metersPerPixel * scaleBarWidthPixels;

      // Format the distance the same way OpenLayers does
      if (scaleBarDistanceMeters >= 1000) {
        const km = scaleBarDistanceMeters / 1000;
        if (km >= 100) {
          displayDistance = `${Math.round(km)} km`;
        } else if (km >= 10) {
          displayDistance = `${Math.round(km)} km`;
        } else {
          displayDistance = `${km.toFixed(1)} km`;
        }
      } else {
        if (scaleBarDistanceMeters >= 100) {
          displayDistance = `${Math.round(scaleBarDistanceMeters)} m`;
        } else if (scaleBarDistanceMeters >= 10) {
          displayDistance = `${Math.round(scaleBarDistanceMeters)} m`;
        } else {
          displayDistance = `${scaleBarDistanceMeters.toFixed(1)} m`;
        }
      }
    }

    // Update DOM directly via ref
    if (scaleRef.current) {
      scaleRef.current.textContent = displayDistance;
    }
  };

  useEffect(() => {
    const satellite = new Tile({
      source: new XYZ({
        url: "http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
        attributions: "Basemap: &copy;2024 NASA, TerraMetrics <a href='https://www.google.com/intl/en-US_US/help/terms_maps/'> Terms</a>",
        crossOrigin: "anonymous",
      }),
      baseLayer: true,
      title: "satellite",
      visible: true,
    });
    const street = new Tile({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        attributions: "Basemap: Esri, TomTom, FAO, NOAA, USGS",
        crossOrigin: "anonymous",
      }),
      baseLayer: true,
      title: "street",
      visible: false,
    });
    baseLayersRef.current = { satellite, street };

    // Create ScaleLine control and store reference
    const scaleLineControl = new ScaleLine();


    const source = new VectorSource({ wrapX: false });
    sourceRef.current = source;

    const vector = new VectorLayer({
      source: source,
      style: new Style({
        fill: new Fill({ color: "rgba(0, 150, 255, 0.3)" }),
        stroke: new Stroke({ color: "#0077ff", width: 2 }),
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color: "#0077ff" }),
        }),
      }),
    });


    const op = {
      view: new View({
        projection: "EPSG:4326",
        zoom: 2,
        center: mapCenter,
      }),
      layers: [satellite, street, vector],
      controls: defaultControls({
        zoom: false,
        rotate: false,
        attribution: false,
      }),
    };

    let mapObj = new ol.Map(op);
    mapObj.setTarget(mapRef.current);
    setMap(mapObj);
    mapObjRef.current = mapObj;

    setActiveAttribution(satellite.getSource().getAttributions());



    mapObj.getLayers().forEach((layer) => {
      layer.on("change:visible", () => {
        if (layer.getVisible()) {
          setActiveAttribution(layer.getSource().getAttributions());
        }
      });
    });

    // Add pointermove event to update coordinates
    const handlePointerMove = evt => {
      if (evt.coordinate) {
        setHoverCoords(evt.coordinate);

        // Update coordinates directly via ref (no throttling needed since we're not using state)
        if (coordsRef.current) {
          coordsRef.current.textContent = `Lat: ${evt.coordinate[1].toFixed(
            4
          )}, Lon: ${evt.coordinate[0].toFixed(4)}`;
        }
      } else {
        setHoverCoords(null);
        if (coordsRef.current) {
          coordsRef.current.textContent = "Lat: 0.0000, Lon: 0.0000";
        }
      }
    };

    // Add view change events to update scale
    const handleViewChange = () => {
      updateScale(mapObj);
    };

    mapObj.on("pointermove", handlePointerMove);
    mapObj.getView().on("change:resolution", handleViewChange);
    mapObj.getView().on("change:center", handleViewChange); // Add this for latitude changes

    // Initial scale update
    updateScale(mapObj);

    return () => {
      if (mapObj) {
        mapObj.setTarget(undefined);
        mapObj.un("pointermove", handlePointerMove);
        mapObj.getView().un("change:resolution", handleViewChange);
        mapObj.getView().un("change:center", handleViewChange);
      }
      setMap(null);
      mapObjRef.current = null;
    };
  }, []);


  const toggleDrawInteraction = (type) => {
    const map = mapObjRef.current;
    const source = sourceRef.current;
    if (!map || !source) return;

    // If the same tool is active → disable draw mode
    if (isDrawing && activeTool === type) {
      if (drawRef.current) map.removeInteraction(drawRef.current);
      drawRef.current = null;
      setIsDrawing(false);
      setActiveTool(null);
      return;
    }

    // Remove any existing interaction before adding new
    if (drawRef.current) {
      map.removeInteraction(drawRef.current);
      drawRef.current = null;
    }

    const draw = new Draw({ source, type });

    draw.on("drawend", (evt) => {
      const feature = evt.feature;
      const geojson = new GeoJSON().writeFeatureObject(feature);
      const featureCollection = {
        type: "FeatureCollection",
        features: [geojson],
      };
      setDrawnGeojson(featureCollection);


      // Auto-disable after drawing one feature
      map.removeInteraction(draw);
      drawRef.current = null;
      setIsDrawing(false);
      setActiveTool(null);
    });

    map.addInteraction(draw);
    drawRef.current = draw;
    setIsDrawing(true);
    setActiveTool(type);
  };

  const handleUndo = () => {
    if (drawRef.current) drawRef.current.removeLastPoint();
  };

  // ✅ Clear all drawings
  const handleClear = () => {
    sourceRef.current?.clear();
    setDrawnGeojson(null)
  };




  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // ✅ 20MB file limit
    if (file.size > 20 * 1024 * 1024) {
      showToast("⚠️ File size should not exceed 20MB");
      event.target.value = "";
      return;
    }

    const fileName = file.name.toLowerCase();

    try {
      let geojsonData = null;

      // ✅ Handle .geojson / .json files
      if (fileName.endsWith(".geojson") || fileName.endsWith(".json")) {
        const text = await file.text();
        geojsonData = JSON.parse(text);
        setDrawnGeojson(geojsonData)

        // ✅ Handle zipped shapefile (.zip)
      } else if (fileName.endsWith(".zip")) {
        const arrayBuffer = await file.arrayBuffer();
        geojsonData = await shp(arrayBuffer);
        setDrawnGeojson(geojsonData)


      } else {
        showToast("Unsupported file type. Please upload a .geojson, .json, or zipped shapefile (.zip).");
        event.target.value = "";
        return;
      }

      // ✅ Ensure data validity
      if (!geojsonData || !geojsonData.features || geojsonData.features.length === 0) {
        showToast("No valid features found in the uploaded file.");
        event.target.value = "";
        return;
      }

      // ✅ Add to OpenLayers source
      const format = new GeoJSON();
      const features = format.readFeatures(geojsonData, {
        featureProjection: "EPSG:4326",
      });

      sourceRef.current.addFeatures(features);

      // ✅ Zoom to extent
      const extent = sourceRef.current.getExtent();
      mapObjRef.current.getView().fit(extent, {
        duration: 800,
        padding: [40, 40, 40, 40],
      });

      showToast("✅ File uploaded successfully!");
    } catch (error) {
      console.error("File upload error:", error);
      showToast("⚠️ Invalid file format or parse error.");
    }

    // Reset file input
    event.target.value = "";
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };





  return (

    <div ref={mapRef} className="absolute inset-0">
      {children}
      <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs px-2 py-1 rounded-sm z-50 flex items-center gap-2 sm:gap-3 max-w-[calc(100vw-1rem)]">
        <span ref={scaleRef}>Scale</span>
        <div className="w-[1.5px] h-4 bg-white/50 hidden sm:block"></div>
        <span ref={coordsRef} className="hidden sm:inline">
          Lat: 0.0000, Lon: 0.0000
        </span>
        <div className="w-[1.5px] h-4 bg-white/50 hidden md:block"></div>
        <span
          className="hidden md:inline truncate"
          dangerouslySetInnerHTML={{ __html: activeAttribution }}
        />

      </div>

      <div className="absolute top-1/2 -translate-y-1/2 left-4 bg-white shadow-lg rounded-xl flex flex-col items-center gap-3 p-3 z-50 border border-gray-200">

        {/* 🟦 Polygon */}
        <button
          title="Draw Polygon"
          onClick={() => toggleDrawInteraction("Polygon")}
          className={`p-2 rounded-md transition ${activeTool === "Polygon" && isDrawing
            ? "bg-blue-600 text-white"
            : "hover:bg-gray-100 text-gray-700"
            }`}
        >
          <PenTool size={20} />
        </button>

        {/* ➖ Line */}
        <button
          title="Draw Line"
          onClick={() => toggleDrawInteraction("LineString")}
          className={`p-2 rounded-md transition ${activeTool === "LineString" && isDrawing
            ? "bg-blue-600 text-white"
            : "hover:bg-gray-100 text-gray-700"
            }`}
        >
          <Slash size={20} />
        </button>

        {/* ⚫ Point */}
        <button
          title="Draw Point"
          onClick={() => toggleDrawInteraction("Point")}
          className={`p-2 rounded-md transition ${activeTool === "Point" && isDrawing
            ? "bg-blue-600 text-white"
            : "hover:bg-gray-100 text-gray-700"
            }`}
        >
          <MapPin size={20} />
        </button>

        <div className="w-full border-t border-gray-300 my-1" />

        {/* ↩️ Undo */}
        <button
          title="Undo Last Point"
          onClick={handleUndo}
          disabled={!isDrawing}
          className={`p-2 rounded-md transition ${isDrawing
            ? "hover:bg-gray-100 text-gray-700"
            : "opacity-50 cursor-not-allowed text-gray-400"
            }`}
        >
          <Undo2 size={20} />
        </button>

        {/* 🗑️ Clear */}
        <button
          title="Clear All Drawings"
          onClick={handleClear}
          className="p-2 rounded-md hover:bg-gray-100 text-red-600"
        >
          <Trash2 size={20} />
        </button>

        <button
          title="Upload GeoJSON or Shapefile"
          onClick={handleUploadClick}
          className="p-2 rounded-md hover:bg-gray-100 text-blue-600"
        >
          <Upload size={20} />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          accept=".geojson,.json,.zip"
          onChange={handleFileUpload}
          className="hidden"
        />





      </div>











    </div>
  );
}

export default React.memo(Map);
