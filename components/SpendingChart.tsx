"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Currency } from "@/lib/currency";

interface Props {
  data: { date: string; total: number }[];
  currency?: Currency;
}

function fmtTick(v: number, currency: Currency) {
  if (currency === "KHR") {
    return v >= 1000 ? `${(v / 1000).toFixed(0)}k ៛` : `${v} ៛`;
  }
  return `$${v}`;
}

function fmtTooltip(value: number, currency: Currency) {
  if (currency === "KHR") {
    return `${Math.round(value).toLocaleString("en-US")} ៛`;
  }
  return `$${value.toFixed(2)}`;
}

export default function SpendingChart({ data, currency = "USD" }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <span className="text-3xl mb-2">📈</span>
        <p className="text-sm text-slate-400">No spending data yet</p>
      </div>
    );
  }

  const formatted = data.map((d) => ({ ...d, label: d.date.slice(5) }));
  const gradId = `grad-${currency}`;

  return (
    <ResponsiveContainer width="100%" height={210}>
      <AreaChart data={formatted} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => fmtTick(v, currency)}
        />
        <Tooltip
          contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
          formatter={(value) => [fmtTooltip(Number(value), currency), "ចំណាយ"]}
          labelFormatter={(l) => `កាលបរិច្ឆេទ: ${l}`}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#7c3aed"
          strokeWidth={2.5}
          fill={`url(#${gradId})`}
          dot={false}
          activeDot={{ r: 5, fill: "#7c3aed", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
