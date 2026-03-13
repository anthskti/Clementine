"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { FullAnalysis, Plant } from "@/types/portfolio";
import { FLOWER_TYPES, GARDENER_TYPES } from "@/types/garden";
import BookModal from "@/components/garden/BookModal";

export default function GardenPage() {
  const [isBookOpen, setIsBookOpen] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [analysisData, setAnalysisData] = useState<FullAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch analysis from sessionStorage after component mounts
    const savedAnalysis = sessionStorage.getItem("clementine_analysis");
    if (savedAnalysis) {
      try {
        const analysis = JSON.parse(savedAnalysis);
        setAnalysisData(analysis);
      } catch (error) {
        console.error("Failed to parse analysis data:", error);
      }
    }
    setIsLoading(false);
  }, []);

  const plantPositions = useMemo(() => {
    if (!analysisData || !analysisData.garden) return [];

    return analysisData.garden.plants.map(() => ({
      // Keep within 10% to 90% bounds so they don't clip off screen
      top: Math.floor(Math.random() * 80) + 10,
      left: Math.floor(Math.random() * 80) + 10,
    }));
  }, [analysisData]);

  if (isLoading || !analysisData || !analysisData.garden) {
    return (
      <div className="w-screen h-screen flex items-center justify-center text-white">
        <Image
          src="/assets/home/dirt_background.jpg"
          alt="dirtbg"
          fill
          className="object-cover"
        />
        Loading your garden...
      </div>
    );
  }

  return (
    // Dirt Background Container
    <div className="relative w-screen h-screen overflow-hidden bg-cover bg-center">
      <Image
        src="/assets/home/dirt_background.jpg"
        alt="HomePage"
        fill
        className="object-cover"
      />
      {/* --- GARDEN LAYER --- */}
      {!isBookOpen && (
        <>
          {/* Render Scattered Stocks */}
          {analysisData.garden.plants.map((plant, index) => (
            <div
              key={plant.symbol}
              className="absolute cursor-pointer transform hover:scale-110 transition-transform"
              style={{
                top: `${plantPositions[index].top}%`,
                left: `${plantPositions[index].left}%`,
              }}
              onClick={() => setSelectedPlant(plant)}
            >
              <Image
                src={
                  FLOWER_TYPES[plant.plant_type] ||
                  "/assets/flowers/default.png"
                }
                alt={plant.symbol}
                width={64}
                height={64}
              />
              <span className="bg-black/50 text-white text-xs px-2 py-1 rounded mt-2 block text-center">
                {plant.symbol}
              </span>
            </div>
          ))}

          {/* Clementine with Watering Can (Left Side) */}
          <div className="absolute left-10 bottom-10 hover:scale-105 transition-transform">
            <Image
              src="/assets/photos/clementine_with_watering_can.png"
              alt="Clementine with watering can"
              width={300}
              height={300}
            />
          </div>

          {/* Closed Book Trigger (Bottom Right Corner) */}
          <button
            onClick={() => setIsBookOpen(true)}
            className="absolute bottom-10 right-10 hover:scale-105 transition-transform"
          >
            <Image
              src="/assets/photos/closed_book.png"
              alt="Open Analysis"
              width={100}
              height={120}
            />
          </button>
        </>
      )}

      {/* --- POP-UP MODAL FOR FLOWERS --- */}
      {selectedPlant && !isBookOpen && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-sm text-black shadow-xl">
            <h3 className="text-2xl font-bold mb-2">{selectedPlant.symbol}</h3>
            <p className="text-gray-600 mb-4">{selectedPlant.caption}</p>
            <button
              onClick={() => setSelectedPlant(null)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Book Modal*/}
      {isBookOpen && (
        <div>
          <BookModal
            analysisData={analysisData}
            onClose={() => setIsBookOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
