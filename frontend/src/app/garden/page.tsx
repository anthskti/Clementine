"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FullAnalysis, Plant } from "@/types/portfolio";
import { FLOWER_TYPES, CLEMENTINE_ACTIONS } from "@/types/garden";
import BookModal from "@/components/garden/BookModal";

export default function GardenPage() {
  const router = useRouter();
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<{
    plant: Plant;
    top: number;
    left: number;
  } | null>(null);
  const [analysisData, setAnalysisData] = useState<FullAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Method that get data from saved storage.
  // Since we don't have a database, utilizing in hackathons is good.
  useEffect(() => {
    const savedAnalysis = sessionStorage.getItem("clementine_analysis");
    if (savedAnalysis) {
      const analysis = JSON.parse(savedAnalysis);
      setAnalysisData(analysis);
      setIsLoading(false);
    } else {
      // If no data is found, send them back
      router.push("/");
    }
  }, [router]);

  const plantPositions = useMemo(() => {
    if (!analysisData || !analysisData.garden) return [];

    return analysisData.garden.plants.map(() => ({
      top: Math.floor(Math.random() * 50) + 15,
      left: Math.floor(Math.random() * 60) + 20,
    }));
  }, [analysisData]);

  if (isLoading || !analysisData || !analysisData.garden) {
    return (
      <div className="w-screen min-h-screen flex items-center justify-center text-white">
        <Image
          src="/assets/home/dirt_background.jpg"
          alt="DirtBG"
          fill
          className="object-cover"
        />
        Loading your garden portfolio...
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
      {/* Garden */}
      {!isBookOpen && (
        <>
          {/* Render Scattered Stocks */}
          {analysisData?.garden?.plants.map((plant, index) => (
            <div
              key={plant.symbol}
              className="absolute cursor-pointer transform hover:scale-110 transition-transform duration-400"
              style={{
                top: `${plantPositions[index].top}%`,
                left: `${plantPositions[index].left}%`,
              }}
              onClick={() =>
                setSelectedPlant({
                  plant: plant,
                  top: plantPositions[index].top,
                  left: plantPositions[index].left,
                })
              }
            >
              <Image
                src={
                  FLOWER_TYPES[plant.plant_type] ||
                  "/assets/flowers/healthy_plant.png"
                }
                alt={plant.symbol}
                width={64}
                height={64}
              />
              <span className="bg-black/50 text-white text-xs font-bold px-2 py-1 rounded mt-2 block text-center">
                {plant.symbol}
              </span>
            </div>
          ))}

          {/* Clementine with Watering Can (Left Side) */}
          {selectedPlant ? (
            <div></div>
          ) : (
            <div className="absolute left-15 bottom-10 transition-transform">
              <Image
                src="/assets/photos/clementine_standing.png"
                alt="Clementine with watering can"
                width={180}
                height={180}
              />
            </div>
          )}

          {/* Closed Book Trigger (Bottom Right Corner) */}
          <button
            onClick={() => setIsBookOpen(true)}
            className="absolute bottom-10 right-10 hover:scale-105 transition-transform"
          >
            <Image
              src="/assets/photos/closed_book.png"
              alt="Open Analysis"
              width={220}
              height={220}
            />
          </button>
        </>
      )}

      {/* --- POP-UP MODAL FOR FLOWERS --- */}
      {/* {selectedPlant && !isBookOpen && (
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
      )} */}
      {/* --- CLEMENTINE ACTION OVERLAY --- */}
      {selectedPlant && !isBookOpen && (
        <div
          className="absolute z-50 flex items-end pointer-events-none"
          style={{
            top: `${selectedPlant.top}%`,
            left: `${selectedPlant.left}%`,
            // This pulls her up and to the left slightly so she stands *next* to the flower, not on top of it
            transform: "translate(-60%, -70%)",
          }}
        >
          {/* 1. Clementine Doing the Action */}
          <div className="relative w-[150px] h-[150px]">
            <Image
              src={
                CLEMENTINE_ACTIONS[selectedPlant.plant.plant_type] ||
                "/assets/photos/clementine_standing.png"
              }
              alt="Clementine taking action"
              fill
              className="object-contain drop-shadow-2xl"
            />
          </div>

          {/* 2. The Text Box (Speech Bubble Style) */}
          <div className="absolute left-[80%] bottom-[80%] w-56 bg-white border-2 border-amber-900 rounded-xl shadow-xl p-3 pointer-events-auto transition-all animate-in fade-in zoom-in duration-200">
            {/* The little 'X' button in the top left/right */}
            <button
              onClick={() => setSelectedPlant(null)}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white hover:bg-red-600 shadow-md"
            >
              ✕
            </button>

            <h4 className="font-bold text-lg text-amber-950 border-b border-amber-900/20 mb-1 pb-1">
              {selectedPlant.plant.symbol}
            </h4>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              "{selectedPlant.plant.caption}"
            </p>
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
