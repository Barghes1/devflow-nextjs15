import { techMap } from "@/constants/techMap";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const geteDeviconClassName = (techName: String) => {
  const normilizedTechName = techName.replace(/[ .]/g, "").toLowerCase();

  return techMap[normilizedTechName]
    ? `${techMap[normilizedTechName]} colored`
    : "devicon-devicon-plain";
};
