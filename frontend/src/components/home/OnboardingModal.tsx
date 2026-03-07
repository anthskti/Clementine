"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getMockPortfolio,
  getCSVPortfolio,
  getQuestradePortfolio,
} from "@/lib/portfolio";
import { analyzePortfolio } from "@/lib/analysis";
import {
  Portfolio,
  InvestorSurvey,
  RiskTolerance,
  InvestmentHorizon,
} from "@/types/types";

import { ChevronDown, X } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({
  isOpen,
  onClose,
}: OnboardingModalProps) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loadingQuestrade, setLoadingQuestrade] = useState(false);
  const [loadingCSV, setLoadingCSV] = useState(false);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const [survey, setSurvey] = useState<InvestorSurvey>({
    age: 25,
    risk_tolerance: "medium",
    investment_horizon: "medium",
    total_assets: 10000,
    income: 50000,
  });

  if (!isOpen) return null;

  const handleLoadMock = async () => {
    try {
      const data = await getMockPortfolio();
      setPortfolio(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load mock data. Is the backend running?");
    }
  };

  const handleLoadQuestrade = async () => {
    setLoadingQuestrade(true);
    try {
      const data = await getQuestradePortfolio();
      setPortfolio(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load Questrade portfolio. Make sure you're connected.");
    } finally {
      setLoadingQuestrade(false);
    }
  };

  const handleLoadCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoadingCSV(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = getCSVPortfolio(file);

      if (!res.ok) throw new Error("Failed to parse CSV");
      const data = await res.json();
      setPortfolio(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load CSV. Please check the file format.");
    } finally {
      setLoadingCSV(false);
      if (csvFileInputRef.current) {
        csvFileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async () => {
    if (!portfolio) {
      alert("Please provide your portfolio data first.");
      return;
    }

    setIsAnalyzing(true);
    try {
      // 1. Fetch analysis from Gemini backend
      const analysis = await analyzePortfolio(portfolio, survey);

      // 2. Save to session storage so the /garden page can pick it up
      sessionStorage.setItem("clementine_analysis", JSON.stringify(analysis));
      sessionStorage.setItem("clementine_portfolio", JSON.stringify(portfolio));

      // 3. Route to the book/garden page
      router.push("/garden");
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-200">
          <h2 className="text-2xl font-bold text-green-900">
            Plant Your Seeds
          </h2>
          <button
            onClick={onClose}
            className="top-4 right-4 text-zinc-400 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {/* TIP: Drop your analyzing GIF or spinner here */}
              <div className="w-24 h-24 border-8 border-green-200 border-t-green-600 rounded-full animate-spin mb-6"></div>
              <h3 className="text-2xl font-bold text-green-900 mb-2">
                Clementine is assessing your garden...
              </h3>
              <p className="text-gray-500">
                Reviewing your positions and pulling out the weeds. This takes
                about 10-15 seconds.
              </p>
            </div>
          ) : (
            <>
              {/* Section 1: Data Input */}
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">1. Import Portfolio</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={handleLoadMock}
                    className={`p-3 rounded-lg border text-sm font-semibold transition-colors ${portfolio ? "bg-green-100 border-green-500 text-green-800" : "bg-gray-50 hover:bg-gray-100"}`}
                    disabled={isAnalyzing}
                  >
                    {portfolio ? "Mock Loaded ✓" : "Use Mock Data"}
                  </button>
                  <button className="p-3 rounded-lg border bg-gray-50 text-gray-400 text-sm cursor-not-allowed">
                    Questrade
                  </button>
                  <div>
                    <input
                      ref={csvFileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleLoadCSV}
                      className="hidden"
                    />
                    <button
                      onClick={() => csvFileInputRef.current?.click()}
                      disabled={loadingCSV || isAnalyzing}
                      className={`w-full p-3 rounded-lg border text-sm font-semibold transition-colors ${
                        loadingCSV
                          ? "bg-blue-100 border-blue-500 text-blue-800"
                          : portfolio
                            ? "bg-green-100 border-green-500 text-green-800"
                            : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      {loadingCSV ? "Loading..." : "Upload CSV"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: Survey */}
              <div>
                <h3 className="text-lg font-bold mb-4">2. Investor Profile</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={survey.age}
                      onChange={(e) =>
                        setSurvey({ ...survey, age: Number(e.target.value) })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Assets ($)
                    </label>
                    <input
                      type="number"
                      value={survey.total_assets}
                      onChange={(e) =>
                        setSurvey({
                          ...survey,
                          total_assets: Number(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Income ($)
                    </label>
                    <input
                      type="number"
                      value={survey.income}
                      onChange={(e) =>
                        setSurvey({ ...survey, income: Number(e.target.value) })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Risk Tolerance
                    </label>
                    <select
                      value={survey.risk_tolerance}
                      onChange={(e) =>
                        setSurvey({
                          ...survey,
                          risk_tolerance: e.target.value as RiskTolerance,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-green-500 focus:border-green-500 outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Investment Horizon
                    </label>
                    <select
                      value={survey.investment_horizon}
                      onChange={(e) =>
                        setSurvey({
                          ...survey,
                          investment_horizon: e.target
                            .value as InvestmentHorizon,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-green-500 focus:border-green-500 outline-none"
                    >
                      <option value="short">Short (&lt; 3 years)</option>
                      <option value="medium">Medium (3-10 years)</option>
                      <option value="long">Long (10+ years)</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isAnalyzing && (
          <div className="p-6 border-t border-zinc-200 bg-gray-50 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!portfolio}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors w-full sm:w-auto"
            >
              Analyze My Garden
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
