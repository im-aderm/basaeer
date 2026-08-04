import api from "@/lib/api";

export type BulkExportType = "ADMISSION_SLIP" | "CERTIFICATE" | "ADMISSION_LIST_EXCEL" | "ADMISSION_LIST_CSV";

export interface BulkExportFilters {
  ids?: string[];
  status?: string;
  sessionId?: string;
  search?: string;
}

export interface BulkExportJob {
  id: string;
  type: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  progress: number;
  fileUrl?: string | null;
  fileName?: string | null;
  error?: string | null;
}

function triggerDownload(fileUrl: string, fileName?: string) {
  const link = document.createElement("a");
  link.href = fileUrl;
  if (fileName) link.download = fileName;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export const BulkExportService = {
  start: async (
    type: BulkExportType,
    filters?: BulkExportFilters,
  ): Promise<{ exportId: string }> => {
    const response = await api.post("/bulk-exports", { type, filters });
    return response.data;
  },

  getStatus: async (id: string): Promise<BulkExportJob> => {
    const response = await api.get(`/bulk-exports/${id}`);
    return response.data;
  },

  /**
   * Starts a bulk export, polls until it finishes, then downloads the ZIP.
   * `onProgress` receives 0–100. Rejects if the job fails or times out.
   */
  runAndDownload: async (
    type: BulkExportType,
    filters?: BulkExportFilters,
    onProgress?: (progress: number) => void,
  ): Promise<void> => {
    const { exportId } = await BulkExportService.start(type, filters);

    const started = Date.now();
    const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
    const POLL_MS = 1500;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      await new Promise((r) => setTimeout(r, POLL_MS));
      const job = await BulkExportService.getStatus(exportId);
      onProgress?.(job.progress ?? 0);

      if (job.status === "COMPLETED" && job.fileUrl) {
        triggerDownload(job.fileUrl, job.fileName || undefined);
        return;
      }
      if (job.status === "FAILED" || job.status === "CANCELLED") {
        throw new Error(job.error || "Export failed");
      }
      if (Date.now() - started > TIMEOUT_MS) {
        throw new Error("Export timed out. Check the Exports page shortly.");
      }
    }
  },
};
