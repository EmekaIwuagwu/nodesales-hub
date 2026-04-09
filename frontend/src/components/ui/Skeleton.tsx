"use client";

import { cn } from "./Button";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-bg-tertiary/50 rounded-xl",
        className
      )}
    />
  );
}
