"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { formatCurrency, type Currency } from "@/lib/currency";

const COLORS = ["#7c3aed", "#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

interface Props {
  data: { name: string; icon: string; value: number }[];
  currency: Currency;
}

export default function CategoryPieChart({ data, currency }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <span className="text-3xl mb-2">📊</span>
        <p className="text-sm text-slate-400">No spending data yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={210}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="45%"
          outerRadius={75}
          innerRadius={38}
          paddingAngle={3}
          label={({ name, percent }: PieLabelRenderProps) =>
            `${name ?? ""} ${(((percent as number) ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
          formatter={(value) => [formatCurrency(Number(value), currency), "Spent"]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
