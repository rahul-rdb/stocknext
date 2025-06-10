"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A linear area chart showing live stock data";

interface StockData {
  timestamp: string;
  price: number;
}

const chartConfig = {
  price: {
    label: "Price",
    color: "oklch(77.7% 0.152 181.912)",
  },
} satisfies ChartConfig;

function getMarketStatus(): { isOpen: boolean; status: string } {
  const now = new Date();
  const et = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const day = et.getDay();
  const hour = et.getHours();
  const minute = et.getMinutes();
  const currentTime = hour * 60 + minute;

  // Check if it's a weekday
  if (day === 0 || day === 6) {
    return { isOpen: false, status: "Market Closed (Weekend)" };
  }

  // Regular market hours: 9:30 AM - 4:00 PM ET
  const marketOpen = 9 * 60 + 30; // 9:30 AM
  const marketClose = 16 * 60; // 4:00 PM

  // Pre-market: 4:00 AM - 9:30 AM ET
  const preMarketOpen = 4 * 60; // 4:00 AM
  const preMarketClose = marketOpen;

  // After-hours: 4:00 PM - 8:00 PM ET
  const afterHoursOpen = marketClose;
  const afterHoursClose = 20 * 60; // 8:00 PM

  if (currentTime >= marketOpen && currentTime < marketClose) {
    return { isOpen: true, status: "Market Open" };
  } else if (currentTime >= preMarketOpen && currentTime < preMarketClose) {
    return { isOpen: true, status: "Pre-Market" };
  } else if (currentTime >= afterHoursOpen && currentTime < afterHoursClose) {
    return { isOpen: true, status: "After-Hours" };
  } else {
    return { isOpen: false, status: "Market Closed" };
  }
}

export function ChartAreaLinear() {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [marketStatus, setMarketStatus] = useState(getMarketStatus());
  const [error, setError] = useState<string | null>(null);

  const [trades, setTrades] = useState<Trade[]>([]);
  const API_KEY = "d0l1iv9r01qhb025nmbgd0l1iv9r01qhb025nmc0";

  useEffect(() => {
    const socket = new WebSocket(`wss://ws.finnhub.io?token=${API_KEY}`);

    socket.onopen = () => {
      console.log("WebSocket opened");
      socket.send(JSON.stringify({ type: "subscribe", symbol: "AAPL" }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "trade") {

        const latestTrade = data.data[0];
        const newPrice = latestTrade.p;
        const newData = {
          timestamp: new Date().toLocaleTimeString(),
          price: newPrice,
        };

        setTrades((prevData) => {
          const updatedData = [...prevData, newData];
          return updatedData.slice(-30); // Keep last 30 data points
        });
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      socket.send(JSON.stringify({ type: "unsubscribe", symbol: "AAPL" }));
      socket.close();
    };
  }, []);

  console.log(trades);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live AAPL Stock Price</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span>Real-time stock price updates</span>
          <span
            className={`px-2 py-1 text-xs rounded ${
              marketStatus.isOpen
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {marketStatus.status}
          </span>
          <span
            className={`px-2 py-1 text-xs rounded ${
              connectionStatus === "connected"
                ? "bg-green-100 text-green-800"
                : connectionStatus === "connecting"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {connectionStatus}
          </span>
          {error && (
            <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
              {error}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={trades}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              domain={["auto", "auto"]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" hideLabel />}
            />
            <Area
              dataKey="price"
              type="linear"
              fill="var(--color-price)"
              fillOpacity={0.4}
              stroke="var(--color-price)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {priceChange >= 0 ? (
                <>
                  Up {priceChange.toFixed(2)}%{" "}
                  <TrendingUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Down {Math.abs(priceChange).toFixed(2)}%{" "}
                  <TrendingUp className="h-4 w-4 rotate-180" />
                </>
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Last Price: ${lastPrice?.toFixed(2) || "Loading..."}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
