import toast from "react-hot-toast";

export function useExport() {
  return {
    exportFile: (format: "PDF" | "Excel" | "CSV" | "PowerPoint", name = "ECE Echo report") => {
      toast.success(`Preparing ${format} export for ${name}...`);
    },
  };
}
