'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface DataPoint {
  date: string;
  orders: number;
  revenue: number;
}

interface AnalyticsChartProps {
  data: DataPoint[];
  type: 'orders' | 'revenue';
}

export default function AnalyticsChart({ data, type }: AnalyticsChartProps) {
  if (!data || data.length === 0) return null;

  const values = data.map(d => d[type]);
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  
  const width = 1000;
  const height = 200;
  const padding = 20;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((d[type] / max) * (height - padding * 2) + padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full bg-white rounded-3xl p-6 border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xs font-bold uppercase tracking-widest text-[#888888]">
          Last 30 Days: {type.toUpperCase()}
        </h4>
        <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full">
          + Trendy
        </div>
      </div>
      
      <div className="relative h-[200px] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Fill Area */}
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            d={`M ${padding},${height} L ${points} L ${width - padding},${height} Z`}
            fill="url(#chartGradient)"
          />

          {/* Line */}
          <motion.polyline
            fill="none"
            stroke="#0f172a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
            const y = height - ((d[type] / max) * (height - padding * 2) + padding);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="white"
                stroke="#0f172a"
                strokeWidth="2"
                className="cursor-pointer hover:r-6 transition-all"
              />
            );
          })}
        </svg>
      </div>

      <div className="flex justify-between mt-4">
        <span className="text-[10px] font-bold text-[#888888]">{data[0].date}</span>
        <span className="text-[10px] font-bold text-[#888888]">{data[data.length - 1].date}</span>
      </div>
    </div>
  );
}
