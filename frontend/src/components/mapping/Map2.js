"use client";

import { useEffect, useRef, useState } from "react";
import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import OSM from "ol/source/OSM.js";
import VectorSource from "ol/source/Vector.js";
import Draw from "ol/interaction/Draw.js";
import { Fill, Stroke, Style, Circle as CircleStyle } from "ol/style.js";
import { GeoJSON } from "ol/format";
import "ol/ol.css";
import { PenTool, MapPin, Slash, Undo2, Trash2, Upload } from "lucide-react";

export default function DrawMap() {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const sourceRef = useRef(null);
  const drawRef = useRef(null);
  const fileInputRef = useRef(null);

  const [activeTool, setActiveTool] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const raster = new TileLayer({
      source: new OSM(),
    });

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

    const map = new Map({
      target: mapRef.current,
      layers: [raster, vector],
      view: new View({
        center: [0, 0],
        zoom: 2,
        projection: "EPSG:4326",
      }),
    });

    mapObj.current = map;

    return () => map.setTarget(undefined);
  }, []);

  // ✅ Add or remove drawing interaction dynamically
  const toggleDrawInteraction = (type) => {
    const map = mapObj.current;
    const source = sourceRef.current;
    if (!map || !source) return;

    if (isDrawing && activeTool === type) {
      if (drawRef.current) map.removeInteraction(drawRef.current);
      drawRef.current = null;
      setIsDrawing(false);
      setActiveTool(null);
      return;
    }

    if (drawRef.current) {
      map.removeInteraction(drawRef.current);
      drawRef.current = null;
    }

    const draw = new Draw({ source, type });

    draw.on("drawend", (evt) => {
      const feature = evt.feature;
      const geojson = new GeoJSON().writeFeatureObject(feature);
      console.log("✅ Drawn Feature:", geojson);

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

  // ✅ Undo last point
  const handleUndo = () => {
    if (drawRef.current) drawRef.current.removeLastPoint();
  };

  // ✅ Clear all drawings
  const handleClear = () => {
    sourceRef.current?.clear();
  };

  // ✅ Handle GeoJSON upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const geojsonData = JSON.parse(e.target.result);
        const format = new GeoJSON();
        const features = format.readFeatures(geojsonData, {
          featureProjection: "EPSG:4326",
        });

        if (features.length > 0) {
          sourceRef.current.addFeatures(features);

          // Zoom to the uploaded features
          const extent = sourceRef.current.getExtent();
          mapObj.current.getView().fit(extent, {
            duration: 800,
            padding: [40, 40, 40, 40],
          });
          console.log("✅ GeoJSON loaded successfully.");
        } else {
          alert("No valid features found in the GeoJSON file.");
        }
      } catch (error) {
        alert("⚠️ Invalid GeoJSON file!");
        console.error("GeoJSON parse error:", error);
      }
    };

    reader.readAsText(file);
    event.target.value = ""; // reset input
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative w-full h-screen bg-gray-100">
      {/* Map */}
      <div ref={mapRef} className="absolute inset-0" />

      {/* Sidebar Toolbar */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 bg-white shadow-lg rounded-xl flex flex-col items-center gap-3 p-3 z-50 border border-gray-200">

        {/* 🟦 Polygon */}
        <button
          title="Draw Polygon"
          onClick={() => toggleDrawInteraction("Polygon")}
          className={`p-2 rounded-md transition ${
            activeTool === "Polygon" && isDrawing
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
          className={`p-2 rounded-md transition ${
            activeTool === "LineString" && isDrawing
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
          className={`p-2 rounded-md transition ${
            activeTool === "Point" && isDrawing
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
          className={`p-2 rounded-md transition ${
            isDrawing
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

        {/* 📂 Upload GeoJSON */}
        <button
          title="Upload GeoJSON"
          onClick={handleUploadClick}
          className="p-2 rounded-md hover:bg-gray-100 text-blue-600"
        >
          <Upload size={20} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept=".geojson,application/geo+json,application/json"
          onChange={handleFileUpload}
          className="hidden"
        />

        
      </div>
    </div>
  );
}
