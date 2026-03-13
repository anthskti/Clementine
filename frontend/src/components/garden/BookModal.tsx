import React from "react";
import Image from "next/image";
import { FullAnalysis } from "@/types/portfolio";
import { GARDENER_TYPES, GARDENER_DESCRIPTION } from "@/types/garden";
import { X } from "lucide-react";

interface BookModalProps {
  analysisData: FullAnalysis;
  onClose: () => void;
}
export default function BookModal({ analysisData, onClose }: BookModalProps) {
  return (
    <div className="relative min-h-screen w-full p-2 bg-black/60 backdrop-blur-sm">
      <div className="w-[90%]">
        <Image
          src="/assets/photos/birds_eye_view_book.png"
          alt="Open book"
          fill
          className="object-cover"
        />
      </div>
      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 flex flex-row justify-between">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 text-zinc-600 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        {/* Content */}
        <div className="flex items-center justify-center">
          {/* Left Page: Investor Type, About, and Port */}
          <div className="flex flex-col w-[40%] ml-[19%] pr-[2.5%]">
            <div className="flex justify-center w-full mb-4">
              <Image
                src={
                  GARDENER_TYPES[analysisData.summary.investor_type] ||
                  "/assets/types/healthy_gardener.png" // Fallback
                }
                alt="Gardener Type"
                width={400}
                height={400}
                className="object-contain"
              />
            </div>
            {/* investor + description */}
            <div className="mb-4">
              <h2 className="text-md">
                Investor Type:{" "}
                <span className="font-bold capitalize italic">
                  {analysisData.summary.investor_type}
                </span>
              </h2>
              <p className="text-sm">
                {GARDENER_DESCRIPTION[analysisData.summary.investor_type]}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <h2>Your Portfolio</h2>
              <div className="w-48 h-48 rounded-full border-12 border-green-500 flex items-center justify-center text-green-800 font-bold bg-green-100">
                %100
              </div>
            </div>
          </div>

          {/* Right Page Summary + Highlights of Sections */}
          <div className="flex flex-col w-[40%] mr-[15%] h-[85%] pb-[12%] pl-[1.5%] items-center justify-center">
            <h2 className="text-2xl font-bold tracking-wide">Garden Summary</h2>
            {/* Diversification, Risk Assessment, Geographic Exposure */}
            <div className="space-y-4 text-sm overflow-y-auto pr-4">
              <div>
                <span className="font-bold text-lg">Diversification:</span>
                <p className="text-md">
                  {analysisData.summary.diversification}
                </p>
              </div>
              <div>
                <span className="font-bold text-lg">Risk Assessment:</span>
                <p className="text-md">
                  {analysisData.summary.risk_assessment}
                </p>
              </div>
              <div>
                <span className="font-bold text-lg">Geographic Exposure:</span>
                <p className="text-md">
                  {analysisData.summary.geographic_exposure}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
