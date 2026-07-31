"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import productLeft from "@/assets/product08 3.png";
import productRight from "@/assets/product01 13.png";

// ── Countdown logic ────────────────────────────────────────────

/** Returns a target date always ~3 days ahead so the timer never hits zero in dev */
function getTargetDate() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  d.setHours(9, 49, 49, 0);
  return d;
}

interface TimeLeft {
  days: string;
  hours: string;
  mins: string;
  secs: string;
}

function useCountdown(target: Date): TimeLeft {
  const calc = (): TimeLeft => {
    const diff = Math.max(0, target.getTime() - Date.now());
    const totalSecs = Math.floor(diff / 1000);
    const days  = String(Math.floor(totalSecs / 86400)).padStart(2, "0");
    const hours = String(Math.floor((totalSecs % 86400) / 3600)).padStart(2, "0");
    const mins  = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, "0");
    const secs  = String(totalSecs % 60).padStart(2, "0");
    return { days, hours, mins, secs };
  };

  const [time, setTime] = useState<TimeLeft>(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);                        // eslint-disable-line react-hooks/exhaustive-deps

  return time;
}

// ── Timer number ───────────────────────────────────────────────

function TimerNumber({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl font-extrabold tracking-tight text-white md:text-[44px]">{value}</span>
      <span className="mt-1 text-sm font-semibold text-white">{label}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────

export function HotDealBanner() {
  const target = getTargetDate();
  const { days, hours, mins, secs } = useCountdown(target);

  return (
    <section className="w-full bg-[#E3D1F6]">
      <div className="container-wide relative py-12 md:py-20">
        <div className="relative overflow-hidden rounded-[20px] bg-[#292929] px-8 py-12 shadow-xl md:px-16 md:py-16">
          <div className="flex flex-col items-center justify-between gap-12 md:flex-row md:gap-8">
            
            {/* Left content */}
            <div className="flex w-full flex-col gap-8 md:w-1/2 z-10">
              <div className="space-y-4">
                <h2 className="text-4xl font-extrabold uppercase tracking-tight text-white md:text-5xl lg:text-[54px] leading-[1.1]">
                  HOT DEALS THIS<br />WEEK
                </h2>
                <p className="text-lg font-medium text-gray-300">
                  New Products upto 50% Discount
                </p>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-6 lg:gap-8">
                <TimerNumber value={days} label="Days" />
                <TimerNumber value={hours} label="Hours" />
                <TimerNumber value={mins} label="Mins" />
                <TimerNumber value={secs} label="Sec" />
              </div>

              {/* Buttons */}
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/products?deals=true"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3.5 text-sm font-bold text-[#6D349F] shadow-sm transition-colors hover:bg-gray-100"
                >
                  Shop Now
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-500 bg-transparent px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-gray-800"
                >
                  Know more About Us
                </Link>
              </div>
            </div>

            {/* Right Images */}
            <div className="relative flex w-full items-center justify-center md:w-1/2 md:justify-end">
              <div className="relative h-64 w-full max-w-[450px] md:h-[350px]">
                {/* Back / Dark Laptop */}
                <div className="absolute left-0 top-0 z-10 w-[65%] drop-shadow-2xl">
                  <Image
                    src={productLeft}
                    alt="Laptop Deal"
                    width={400}
                    height={300}
                    className="h-auto w-full object-contain"
                    style={{ transform: "rotate(-10deg)" }}
                  />
                </div>
                {/* Front / Silver Laptop */}
                <div className="absolute bottom-0 right-0 z-20 w-[75%] drop-shadow-2xl">
                  <Image
                    src={productRight}
                    alt="MacBook Deal"
                    width={400}
                    height={300}
                    className="h-auto w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
