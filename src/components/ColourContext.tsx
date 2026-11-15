"use client";
import { createContext, useContext, useState } from "react";

/** Shares the chosen colour and filament type between the pickers, the price and the product photos. */
type Choice = { colour: string; setColour: (c: string) => void; material: string; setMaterial: (m: string) => void };
const Ctx = createContext<Choice | null>(null);

export function ColourProvider({ initial, initialMaterial = "", children }: { initial: string; initialMaterial?: string; children: React.ReactNode }) {
  const [colour, setColour] = useState(initial);
  const [material, setMaterial] = useState(initialMaterial);
  return <Ctx.Provider value={{ colour, setColour, material, setMaterial }}>{children}</Ctx.Provider>;
}

export const useColour = () => useContext(Ctx);
