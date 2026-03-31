/**
 * Kortana logo — uses /logo.png from the public directory.
 * Place the Kortana "K" logo image at frontend/public/logo.png
 *
 * Props:
 *  size  — "sm" (24px) | "md" (32px, default) | "lg" (48px) | "xl" (80px)
 *  text  — show "Kortana" wordmark next to icon (default true)
 *  className — extra classes on the wrapper
 */
const SIZES = {
  sm: "h-6 w-auto",
  md: "h-8 w-auto",
  lg: "h-12 w-auto",
  xl: "h-20 w-auto",
};

export default function Logo({ size = "md", text = true, className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/logo.svg"
        alt="Kortana"
        className={SIZES[size] ?? SIZES.md}
        draggable={false}
      />
      {text && (
        <span className="font-bold tracking-tight text-white" style={{ fontSize: size === "xl" ? "1.75rem" : size === "lg" ? "1.25rem" : "1.125rem" }}>
          Kortana
        </span>
      )}
    </div>
  );
}
