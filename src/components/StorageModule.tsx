"use client";

import { useEffect, useState } from "react";
import type { SupabaseSession } from "@/lib/supabase";
import { getSupabaseClient, hydrateRealtimeSession } from "@/lib/supabaseClient";

const bucket = "fitsutra-assets";

type StorageModuleProps = {
  session: SupabaseSession | null;
  gymId: string | null;
};

type StoredFile = {
  name: string;
  updated_at: string;
  size: number;
};

export default function StorageModule({ session, gymId }: StorageModuleProps) {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadFiles() {
    if (!session?.access_token || !gymId) return;
    await hydrateRealtimeSession(session);
    const supabase = getSupabaseClient();
    const { data, error: listError } = await supabase.storage
      .from(bucket)
      .list(gymId, { limit: 50, sortBy: { column: "updated_at", order: "desc" } });

    if (listError) {
      setError(listError.message);
      return;
    }

    setFiles(
      (data ?? []).map((item) => ({
        name: item.name,
        updated_at: item.updated_at ?? "",
        size: item.metadata?.size ?? 0,
      }))
    );
  }

  useEffect(() => {
    loadFiles();
  }, [session?.access_token, gymId]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!session?.access_token || !gymId) return;
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      await hydrateRealtimeSession(session);
      const supabase = getSupabaseClient();
      const filePath = `${gymId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw new Error(uploadError.message);
      await loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="glass rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl text-slate-100">Brand Assets</h2>
          <p className="mt-2 text-sm text-slate-300">
            Upload logos, waiver PDFs, and marketing creatives.
          </p>
        </div>
        <label className="rounded-full bg-amber-400 px-5 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-amber-500/30">
          {uploading ? "Uploading..." : "Upload File"}
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {files.length === 0 && (
          <p className="text-sm text-slate-400">No assets uploaded yet.</p>
        )}
        {files.map((file) => (
          <div
            key={file.name}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/70 bg-slate-950/50 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-slate-100">{file.name}</p>
              <p className="text-xs text-slate-500">
                {file.size} bytes · {file.updated_at}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
