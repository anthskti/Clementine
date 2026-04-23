"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Portfolio } from "@/types/portfolio";

interface PortfolioChartProps {
  portfolio: Portfolio;
}

// Some Garden Colour Palette I found online. 10 for ones on the chart
const COLORS = [
  "#92c12e",
  "#446d44",
  "#44580f",
  "#69334b",
  "#3e3465",
  "#e49c9c",
  "#d5bfb4",
  "#9dae33",
  "#658436",
  "#2a5f2d",
  "#d4d4d8", // grey for other
];

// Blossom copy of chart
const renderTickerBubble = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  name,
  index,
}: any) => {
  const RADIAN = Math.PI / 180;

  const radius = innerRadius + (outerRadius - innerRadius) + 25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <g>
      {/* Background */}
      <rect
        x={x - 22}
        y={y - 12}
        width={44}
        height={24}
        fill="#ffffff"
        stroke={index === 10 ? "#a1a1aa" : COLORS[index % COLORS.length]}
        strokeWidth={2}
        rx={12} // rounded
        className="drop-shadow-sm"
      />
      {/* Ticker Text */}
      <text
        x={x}
        y={y}
        fill="#3f3f46"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[8px] font-bold tracking-tight"
      >
        {name}
      </text>
    </g>
  );
};

export default function PortfolioChart({ portfolio }: PortfolioChartProps) {
  if (!portfolio || portfolio.positions.length == 0) {
    return (
      <div className="flex items-center justify-center h-64 text-green-800/50 font-medium">
        No portfolio data available.
      </div>
    );
  }

  // 1a. Get total Value
  const totalValue =
    portfolio.portfolio_value ||
    portfolio.positions.reduce((sum, p) => sum + p.market_value, 0);
  // 1b. Sort port from largest to smallest
  const sortedPositions = [...portfolio.positions].sort(
    (a, b) => b.market_value - a.market_value,
  );

  // 2. Top 10 + others
  const top10 = sortedPositions.slice(0, 10);
  const other = sortedPositions.slice(10);

  // 3. Data transformation for recharts, then group other stocks together
  const chartData = top10.map((p) => ({
    name: p.symbol,
    value: p.market_value,
  }));

  if (other.length > 0) {
    const otherMarketValue = other.reduce((sum, p) => sum + p.market_value, 0);
    chartData.push({
      name: "OTHER",
      value: otherMarketValue,
    });
  }

  return (
    <div className="relative flex items-center justify-center h-72 w-full">
      <div className="absolute flex flex-col items-center justify-center pointer-events-none z-10">
        <span className="text-xs font-bold text-green-800/60 uppercase tracking-widest">
          Total
        </span>
        <span className="text-xl font-extrabold text-green-900 drop-shadow-sm">
          $
          {totalValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={95}
            paddingAngle={1} // Gap between stocks
            dataKey="value"
            labelLine={false} // Hides default lines
            label={renderTickerBubble} // Uses custom bubbles built above
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                // Force the "Other" category to always use the gray color at the end of the array
                fill={entry.name === "OTHER" ? COLORS[10] : COLORS[index % 10]}
              />
            ))}
          </Pie>
          <Tooltip
            wrapperStyle={{ zIndex: 100 }}
            formatter={(value: any) => {
              const percent = ((value / totalValue) * 100).toFixed(1);
              const formattedValue = value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
              return [`$${formattedValue} (${percent}%)`, "Market Value"];
            }}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #dcfce7",
              fontWeight: "bold",
            }}
            itemStyle={{ color: "#166534" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
