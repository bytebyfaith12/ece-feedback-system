import { Download, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastNotification";

async function downloadFile(path: string, filename: string) {
  const token = localStorage.getItem("ecePulseToken");
  const response = await fetch(path, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!response.ok) throw new Error("Export failed.");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ReportExportButtons({ query }: { query: string }) {
  const { showToast } = useToast();

  const run = async (type: "csv" | "pdf" | "print") => {
    try {
      if (type === "print") {
        window.print();
      } else {
        await downloadFile(`/api/reports/export/${type}${query}`, `ece-pulse-report.${type}`);
      }
      showToast({ title: "Report ready", message: `${type.toUpperCase()} report generated.`, type: "success" });
    } catch (error) {
      showToast({ title: "Export failed", message: error instanceof Error ? error.message : "Please try again.", type: "error" });
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => run("csv")}><Download className="size-4" /> Export CSV</Button>
      <Button variant="secondary" onClick={() => run("pdf")}><FileText className="size-4" /> Export PDF</Button>
      <Button variant="secondary" onClick={() => run("print")}><Printer className="size-4" /> Print report</Button>
    </div>
  );
}
