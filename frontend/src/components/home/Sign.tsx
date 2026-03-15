"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  getMockPortfolio,
  getCSVPortfolio,
  getQuestradePortfolio,
} from "@/lib/portfolio";
import { analyzePortfolio } from "@/lib/analysis";
import { Portfolio } from "@/types/portfolio";
import {
  InvestorSurvey,
  RiskTolerance,
  InvestmentHorizon,
} from "@/types/survey";

import { ChevronDown, X, Loader, Upload, Check } from "lucide-react";

export default function OnboardingModal() {
  const router = useRouter();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  const [QuestradeToken, setQuestradeToken] = useState("");
  const [loadingQuestrade, setLoadingQuestrade] = useState(false);

  const [loadingCSV, setLoadingCSV] = useState(false);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  const [activeMethod, setActiveMethod] = useState<
    "mock" | "questrade" | "csv" | null
  >(null);

  const [survey, setSurvey] = useState<InvestorSurvey>({
    age: 25,
    risk_tolerance: "medium",
    investment_horizon: "medium",
    total_assets: 10000,
    income: 50000,
  });

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
    if (!QuestradeToken) return;
    setLoadingQuestrade(true);
    try {
      const data = await getQuestradePortfolio(QuestradeToken);
      setPortfolio(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load Questrade portfolio. Make sure you're connected.");
    } finally {
      setLoadingQuestrade(false);
    }
  };
  const handleLoadCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoadingCSV(true);
      const formData = new FormData();
      formData.append("file", file); // To match the backend API
    } catch (error) {
      console.error("Failed to upload CSV:", error);
    } finally {
      setLoadingCSV(false);
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
    // 1. Full screen background
    <div className="relative p-2">
      {/* 2. The Sign Container - This dictates the size and holds the background image */}
      {/* Background Sign Image */}
      <Image
        src="/assets/home/signv2.png"
        alt="Wooden Garden Sign"
        width={700}
        height={700}
        className="object-contain -z-10 drop-shadow-xl"
        priority
      />

      {/* 3. The Content Overlay - Stacks items vertically inside the sign */}
      <div className="absolute inset-0 justify-center px-16 pt-22">
        <div>
          {/* Header */}
          <div className="border-b border-green-800/20 text-center">
            <h2 className="text-2xl font-semibold text-green-900 drop-shadow-sm">
              Welcome to your Garden !
            </h2>
          </div>

          {/* Body */}
          <div className="pb-3 border-b border-green-800/20 shrink-0">
            {/* Loading */}
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Loader className="animate-spin w-12 h-12 text-green-700" />
                <h3 className="text-xl font-bold text-green-900">
                  Clementine analysis incoming!!!
                </h3>
                <p className="text-green-800 font-medium">
                  Reviewing your garden. This takes about 10-15 seconds.
                </p>
              </div>
            ) : (
              // Survey x Input
              <div className="space-y-4">
                {/* Section 1: Data Input */}
                <div>
                  <h3 className="text-md font-semibold text-green-900 mb-2">
                    1. Import Portfolio
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Mock Data */}
                    <button
                      onClick={() => {
                        setActiveMethod("mock");
                        handleLoadMock();
                      }}
                      className={`p-2 rounded-md border-2 text-sm font-semibold transition-colors ${
                        activeMethod === "mock" && portfolio
                          ? "bg-green-100 border-green-600 text-green-900"
                          : "bg-white/60 border-gray-300 hover:bg-gray-100 text-gray-700"
                      }`}
                      disabled={isAnalyzing}
                    >
                      {activeMethod === "mock" && portfolio
                        ? "Mock Loaded ✓"
                        : "Use Mock Data"}
                    </button>

                    {/* Questrade */}
                    <button
                      onClick={() => setActiveMethod("questrade")}
                      className={`p-2 rounded-md border-2 text-sm font-semibold transition-colors
                                ${
                                  activeMethod === "questrade"
                                    ? "bg-green-100 border-green-600 text-green-900"
                                    : "bg-white/60 border-gray-300 hover:bg-gray-100 text-gray-700"
                                }`}
                      disabled={isAnalyzing}
                    >
                      Questrade
                    </button>
                    {/* Yahoo Finance CSV */}
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleLoadCSV}
                      ref={csvFileInputRef}
                      className="hidden"
                    />
                    <button
                      onClick={() => setActiveMethod("csv")}
                      onDoubleClick={() => csvFileInputRef.current?.click()}
                      disabled={loadingCSV || isAnalyzing}
                      className={`w-full p-2 rounded-md border-2 text-sm font-semibold transition-colors ${
                        activeMethod === "csv"
                          ? "bg-green-100 border-green-600 text-green-900"
                          : "bg-white/60 border-gray-300 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {loadingCSV ? (
                        <div>Loading...</div>
                      ) : (
                        <div className="flex items-center justify-center">
                          Upload CSV
                          <Upload className="w-4 h-4 pl-1" />
                        </div>
                      )}
                    </button>
                  </div>
                  {/* Dynamic Contextual Area Below Buttons */}
                  <div className="mt-4">
                    {/* Mock Content */}
                    {activeMethod === "mock" && (
                      <p className="text-sm text-zinc-900 italic">
                        * This is a mock profile for testing, manual stock
                        adding will be implemented soon!
                      </p>
                    )}

                    {/* Questrade Content */}
                    {activeMethod === "questrade" && (
                      <div className="flex flex-row gap-2">
                        <p className="text-sm text-zinc-700">
                          Questrade Session Key:
                        </p>
                        <div className="flex gap-2 w-full">
                          <input
                            type="text"
                            placeholder="Session Key..."
                            value={QuestradeToken}
                            onChange={(e) => setQuestradeToken(e.target.value)}
                            disabled={loadingQuestrade || isAnalyzing}
                            className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-green-500"
                          />
                        </div>
                      </div>
                    )}
                    {/* CSV Yahoo Finance Content */}
                    {activeMethod === "csv" && (
                      <div className="flex flex-col gap-3">
                        <p className="text-sm text-zinc-900 italic">
                          In Yahoo Finance, navigate to{" "}
                          <strong>"My Portfolio,"</strong> open your specific
                          portfolio, and click the <strong>"Download"</strong>{" "}
                          icon and import it here. Double click the button to
                          upload file!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Survey */}
                <div>
                  <h3 className="text-md font-semibold text-green-900 mb-2">
                    2. Investor Profile
                  </h3>

                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs uppercase tracking-wider font-bold text-green-900/80 mb-0.5">
                          Age
                        </label>
                        <input
                          type="number"
                          value={survey.age}
                          onChange={(e) =>
                            setSurvey({
                              ...survey,
                              age: Number(e.target.value),
                            })
                          }
                          className="w-full bg-white/70 border-2 border-green-800/20 rounded-md p-2 focus:bg-white focus:ring-2 focus:ring-green-600 outline-none transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-wider font-bold text-green-900/80 mb-0.5">
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
                          className="w-full bg-white/70 border-2 border-green-800/20 rounded-md p-2 focus:bg-white focus:ring-2 focus:ring-green-600 outline-none transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-wider font-bold text-green-900/80 mb-0.5">
                          Annual Income ($)
                        </label>
                        <input
                          type="number"
                          value={survey.income}
                          onChange={(e) =>
                            setSurvey({
                              ...survey,
                              income: Number(e.target.value),
                            })
                          }
                          className="w-full bg-white/70 border-2 border-green-800/20 rounded-md p-2 focus:bg-white focus:ring-2 focus:ring-green-600 outline-none transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-wider font-bold text-green-900/80 mb-0.5">
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
                          className="w-full bg-white/70 border-2 border-green-800/20 rounded-md p-2 focus:bg-white focus:ring-2 focus:ring-green-600 outline-none transition-all text-sm"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs uppercase tracking-wider font-bold text-green-900/80 mb-0.5">
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
                          className="w-full bg-white/70 border-2 border-green-800/20 rounded-md p-2 focus:bg-white focus:ring-2 focus:ring-green-600 outline-none transition-all text-sm"
                        >
                          <option value="short">Short (&lt; 3 years)</option>
                          <option value="medium">Medium (3-10 years)</option>
                          <option value="long">Long (10+ years)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!isAnalyzing && (
            <div className="pt-4 mt-2 border-t border-green-800/20 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={!portfolio}
                className="w-full py-3 bg-green-700 text-white rounded-md font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-800 hover:shadow-lg transition-all"
              >
                Analyze My Garden
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
