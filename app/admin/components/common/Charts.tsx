"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

// Default data for fallback
const monthlyData = [
  { name: "Jan", bookings: 12, revenue: 4500 },
  { name: "Feb", bookings: 19, revenue: 6800 },
  { name: "Mar", bookings: 15, revenue: 5200 },
  { name: "Apr", bookings: 25, revenue: 8900 },
  { name: "May", bookings: 30, revenue: 10500 },
  { name: "Jun", bookings: 22, revenue: 7800 },
];

const userGrowthData = [
  { name: "Jan", students: 150, landlords: 20 },
  { name: "Feb", students: 180, landlords: 25 },
  { name: "Mar", students: 210, landlords: 30 },
  { name: "Apr", students: 240, landlords: 35 },
  { name: "May", students: 280, landlords: 40 },
  { name: "Jun", students: 310, landlords: 45 },
];

const propertyTypeData = [
  { name: "Apartments", value: 45, color: "#3b82f6" },
  { name: "Houses", value: 30, color: "#8b5cf6" },
  { name: "Villas", value: 15, color: "#10b981" },
  { name: "Studios", value: 10, color: "#f59e0b" },
];

const revenueData = [
  { name: "Jan", revenue: 4500, expenses: 2800 },
  { name: "Feb", revenue: 6800, expenses: 3500 },
  { name: "Mar", revenue: 5200, expenses: 3200 },
  { name: "Apr", revenue: 8900, expenses: 4800 },
  { name: "May", revenue: 10500, expenses: 5200 },
  { name: "Jun", revenue: 7800, expenses: 4100 },
];

interface RevenueChartProps {
  data?: typeof revenueData;
}

interface UserGrowthChartProps {
  data?: typeof userGrowthData;
}

interface PropertyTypeChartProps {
  data?: typeof propertyTypeData;
}

interface BookingTrendChartProps {
  data?: typeof monthlyData;
}

export function RevenueChart({ data = revenueData }: RevenueChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b" }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            animationDuration={1500}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorExpenses)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function UserGrowthChart({ data = userGrowthData }: UserGrowthChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b" }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="students"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 5, fill: "#3b82f6" }}
            activeDot={{ r: 7 }}
            animationDuration={1500}
          />
          <Line
            type="monotone"
            dataKey="landlords"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 5, fill: "#10b981" }}
            activeDot={{ r: 7 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function PropertyTypeChart({ data = propertyTypeData }: PropertyTypeChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            animationDuration={1500}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.1)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function BookingTrendChart({ data = monthlyData }: BookingTrendChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b" }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend />
          <Bar
            dataKey="bookings"
            fill="#3b82f6"
            radius={[8, 8, 0, 0]}
            animationDuration={1500}
          />
          <Bar
            dataKey="revenue"
            fill="#8b5cf6"
            radius={[8, 8, 0, 0]}
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
