export const detectJobType = (text?: string | null) => {
  const value = (text || "").toLowerCase();
  if (value.includes("not cooling")) return "ac_not_cooling";
  if (value.includes("no heat")) return "no_heat";
  if (value.includes("not turning on")) return "not_turning_on";
  return "general_service";
};
