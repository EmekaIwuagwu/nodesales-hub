import { ethers } from "ethers";

export const fmtUSDT = (raw) =>
  (Number(raw) / 1e6).toLocaleString("en-US", { style: "currency", currency: "USD" });

export const fmtDNR = (raw) =>
  `${parseFloat(ethers.formatUnits(raw, 18)).toLocaleString(undefined, { maximumFractionDigits: 4 })} DNR`;

export const fmtAddress = (addr, chars = 6) =>
  addr ? `${addr.slice(0, chars)}...${addr.slice(-4)}` : "";

export const fmtDate = (date) =>
  new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export const fmtTimestamp = (ts) => fmtDate(ts * 1000);
