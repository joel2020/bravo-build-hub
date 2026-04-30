import { supabase } from "@/integrations/supabase/client";

export const getSuggestedPartsWithPrices = async (jobType?: string | null) => {
  if (!jobType) return [];
  const { data } = await supabase
    .from("part_suggestions" as any)
    .select("part_name, priority, parts_catalog(vendor, price)")
    .eq("job_type", jobType)
    .order("priority", { ascending: true })
    .limit(8);

  return (data || []).map((row: any) => ({
    name: row.part_name,
    priority: row.priority,
    vendor: row.parts_catalog?.vendor || "Preferred vendor",
    price: Number(row.parts_catalog?.price || 0),
  }));
};
