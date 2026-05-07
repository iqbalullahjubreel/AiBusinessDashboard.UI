import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import { filesApi } from "@/services/api";
import { recentFiles } from "@/lib/mock-data";
import type { UploadedFile } from "@/lib/types";
import { Upload, FileText, FileImage, FileSpreadsheet, FileType2, Trash2, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/files")({
  component: FilesPage,
});

const iconFor = (type: string) => {
  if (type.startsWith("image/")) return FileImage;
  if (type.includes("csv") || type.includes("spreadsheet")) return FileSpreadsheet;
  if (type.includes("pdf")) return FileType2;
  return FileText;
};

function FilesPage() {
  const [files, setFiles] = useState<UploadedFile[]>(recentFiles);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (list: FileList | File[]) => {
    for (const file of Array.from(list)) {
      const placeholder: UploadedFile = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        status: "uploading",
        progress: 0,
        uploadedAt: new Date().toISOString(),
      };
      setFiles((f) => [placeholder, ...f]);
      try {
        await filesApi.upload(file, (p) => {
          setFiles((all) => all.map((x) => (x.id === placeholder.id ? { ...x, progress: p } : x)));
        });
        setFiles((all) => all.map((x) => (x.id === placeholder.id ? { ...x, status: "ready", progress: 100 } : x)));
        toast.success(`${file.name} uploaded`);
      } catch {
        setFiles((all) => all.map((x) => (x.id === placeholder.id ? { ...x, status: "error" } : x)));
        toast.error(`${file.name} failed`);
      }
    }
  }, []);

  const remove = async (id: string) => {
    await filesApi.remove(id);
    setFiles((f) => f.filter((x) => x.id !== id));
    toast.success("File removed");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Files</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upload PDFs, docs, CSVs, and images for AI processing.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files) upload(e.dataTransfer.files); }}
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-dashed bg-card p-12 text-center transition-all",
          drag ? "border-primary bg-primary/5 shadow-glow" : "border-border",
        )}
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
          <Upload className="h-6 w-6 text-primary-foreground" />
        </div>
        <p className="mt-4 text-base font-medium">Drop files here or click to upload</p>
        <p className="mt-1 text-sm text-muted-foreground">Supports PDF, DOCX, TXT, CSV, and images up to 25MB</p>
        <Button onClick={() => inputRef.current?.click()} className="mt-4 bg-gradient-primary shadow-glow hover:opacity-90">Choose files</Button>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => e.target.files && upload(e.target.files)} />
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {["PDF", "DOCX", "TXT", "CSV", "PNG", "JPG"].map((t) => (
            <span key={t} className="rounded-full border border-border bg-background/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">{t}</span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <p className="text-sm font-semibold">Upload history</p>
        <div className="mt-4 divide-y divide-border">
          {files.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No files yet — upload your first one above.</p>
          )}
          {files.map((f) => {
            const Icon = iconFor(f.type);
            return (
              <div key={f.id} className="flex items-center gap-3 py-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground"><Icon className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB · {f.type.split("/")[1] || "file"}</p>
                  {f.status === "uploading" && <Progress value={f.progress} className="mt-2 h-1" />}
                </div>
                <div className="flex items-center gap-2">
                  {f.status === "uploading" && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> {f.progress}%</span>}
                  {f.status === "ready" && <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success"><CheckCircle2 className="h-3 w-3" /> Ready</span>}
                  {f.status === "processing" && <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">Processing</span>}
                  {f.status === "error" && <span className="flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3 w-3" /> Failed</span>}
                  <Button size="icon" variant="ghost" onClick={() => remove(f.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
