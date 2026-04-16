"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

export type ManualPosition = {
  symbol: string;
  quantity: number | "";
  avg_cost: number | "";
};

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (position: ManualPosition[]) => void;
  isLoading: boolean;
}

export default function ManualEntryModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: ManualEntryModalProps) {
  const [rows, setRows] = useState<ManualPosition[]>([
    { symbol: "", quantity: "", avg_cost: "" },
  ]);

  if (!isOpen) return null;
  const addRow = () => {
    setRows([...rows, { symbol: "", quantity: "", avg_cost: "" }]);
  };
  const removeRow = (index: number) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const updateRow = (
    index: number,
    field: keyof ManualPosition,
    value: string,
  ) => {
    const newRows = [...rows];
    if (field === "symbol") {
      newRows[index][field] = value.toUpperCase();
    } else {
      // Parse numbers, allow empty string for typing
      newRows[index][field] = value === "" ? "" : Number(value);
    }
    setRows(newRows);
  };

  const handleSubmit = () => {
    // Filter out completely empty rows before validating
    const validRows = rows.filter(
      (r) => r.symbol.trim() !== "" || r.quantity !== "" || r.avg_cost !== "",
    );

    // Ensure all filled rows have all 3 fields, validation
    const isValid = validRows.every(
      (r) => r.symbol.trim() !== "" && r.quantity !== "" && r.avg_cost !== "",
    );

    if (!isValid) {
      alert(
        "Please fill out all fields for your entered stocks, or delete incomplete rows.",
      );
      return;
    }

    if (validRows.length === 0) {
      alert("Please add at least one stock to analyze.");
      return;
    }

    onSubmit(validRows);
  };

  return (
    // goes onto of everything, darkens background
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      {/* Modal */}
      <div className="bg-white/95 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-green-800/20">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-green-800/10">
          <div>
            <h2 className="text-xl font-bold text-green-900">
              Manual Portfolio Entry
            </h2>
            <p className="text-sm text-green-700/80">
              Add your stocks, shares, and average cost.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Table */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* Table Headers */}
          <div className="grid grid-cols-12 gap-2 mb-2 px-2 text-xs font-bold text-green-800 uppercase tracking-wider">
            <div className="col-span-4">Ticker Symbol</div>
            <div className="col-span-3">Shares</div>
            <div className="col-span-4">Avg Cost ($)</div>
            <div className="col-span-1 text-center"></div>
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {rows.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-200"
              >
                <div className="col-span-4">
                  <input
                    type="text"
                    placeholder="e.g. AAPL"
                    value={row.symbol}
                    onChange={(e) => updateRow(index, "symbol", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 font-medium"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={row.quantity}
                    onChange={(e) =>
                      updateRow(index, "quantity", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div className="col-span-4 flex items-center gap-1">
                  <span className="text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={row.avg_cost}
                    onChange={(e) =>
                      updateRow(index, "avg_cost", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => removeRow(index)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={addRow}
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-green-300 text-green-700 font-semibold rounded-lg hover:bg-green-50 hover:border-green-400 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" /> Add Another Stock
          </button>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-green-800/10 flex justify-end gap-3 bg-gray-50/50 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-green-700 text-white text-sm font-bold rounded-md shadow-sm hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex flex-row items-center gap-2"
          >
            Save Manual Entry
          </button>
        </div>
      </div>
    </div>
  );
}
