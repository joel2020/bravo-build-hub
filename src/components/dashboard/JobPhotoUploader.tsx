import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

const photoTypes = ["before", "after", "issue", "install", "equipment", "receipt", "invoice", "paperwork"];

export function JobPhotoUploader({ jobId, customerId, onUploaded }: { jobId: string; customerId?: string | null; onUploaded: () => void }) {
  const { userId } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [photoType, setPhotoType] = useState("issue");
  const [submitting, setSubmitting] = useState(false);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !userId) return;
    setSubmitting(true);

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${jobId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("job-photos").upload(path, file, {
      upsert: false,
      contentType: file.type,
    });

    if (!uploadError) {
      await supabase.from("job_photos" as any).insert({
        job_id: jobId,
        customer_id: customerId || null,
        uploaded_by: userId,
        file_path: path,
        caption: caption || null,
        photo_type: photoType,
      });
      setFile(null);
      setCaption("");
      onUploaded();
    }

    setSubmitting(false);
  };

  return (
    <form onSubmit={onSubmit} className="border border-border rounded-lg p-4 space-y-3 bg-card">
      <h3 className="font-semibold">Upload job photo</h3>
      <div>
        <Label htmlFor="job-photo">Photo</Label>
        <Input id="job-photo" type="file" accept="image/*" capture="environment" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </div>
      {previewUrl && <img src={previewUrl} alt="Preview" className="h-32 rounded border" />}
      <div>
        <Label htmlFor="photo-type">Type</Label>
        <select id="photo-type" className="mt-1 w-full border rounded px-3 py-2 bg-background" value={photoType} onChange={(e) => setPhotoType(e.target.value)}>
          {photoTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <Label htmlFor="caption">Caption</Label>
        <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Optional" />
      </div>
      <Button type="submit" disabled={!file || submitting}>{submitting ? "Uploading..." : "Upload photo"}</Button>
    </form>
  );
}
