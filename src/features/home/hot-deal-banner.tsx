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

// ── Timer bubble ───────────────────────────────────────────────

function TimerBubble({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="flex h-20 w-20 flex-col items-center justify-center rounded-full text-white md:h-24 md:w-24"
      style={{ background: "#834AB9" }}
    >
      <span className="text-2xl font-extrabold leading-none md:text-3xl">{value}</span>
      <span className="mt-0.5 text-xs font-medium">{label}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────

export function HotDealBanner() {
  const target = getTargetDate();
  const { days, hours, mins, secs } = useCountdown(target);

  return (
    <section className="w-full bg-[#D4BAF0]">

      {/* ── Hot Deal This Week ──────────────────────────────────── */}
      <div className="container-wide relative py-12 md:py-16">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr]">

          {/* Left laptop */}
          <div className="hidden justify-end md:flex">
            <div className="relative h-56 w-72 drop-shadow-2xl lg:h-64 lg:w-80">
              <Image
                src={productLeft}
                alt="Laptop deal"
                fill
                sizes="320px"
                className="object-contain"
                style={{ transform: "rotate(-8deg)" }}
              />
            </div>
          </div>

          {/* Centre content */}
          <div className="flex flex-col items-center gap-5 text-center">
            {/* Countdown */}
            <div className="flex items-center gap-3">
              <TimerBubble value={days}  label="Days"  />
              <TimerBubble value={hours} label="Hours" />
              <TimerBubble value={mins}  label="Mins"  />
              <TimerBubble value={secs}  label="Sec"   />
            </div>

            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 md:text-4xl">
                HOT DEAL THIS WEEK
              </h2>
              <p className="mt-2 text-base text-neutral-600">
                New Products upto 50% Discount
              </p>
            </div>

            <Link
              href="/products?deals=true"
              className="inline-flex items-center justify-center rounded-lg px-10 py-3 text-base font-bold text-white shadow-brand-md transition-all duration-200 hover:brightness-110 hover:-translate-y-px"
              style={{ background: "#834AB9" }}
            >
              Shop Now
            </Link>
          </div>

          {/* Right laptop */}
          <div className="hidden justify-start md:flex">
            <div className="relative h-56 w-72 drop-shadow-2xl lg:h-64 lg:w-80">
              <Image
                src={productRight}
                alt="MacBook deal"
                fill
                sizes="320px"
                className="object-contain"
                style={{ transform: "rotate(6deg)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
