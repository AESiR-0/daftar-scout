import { FileInfo } from "@/types/files";

export function getFileInfo(file: File): FileInfo {
  const sizeInMB = file.size / (1024 * 1024);
  const size =
    sizeInMB > 1
      ? `${sizeInMB.toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(2)} KB`;

  return {
    type: file.type || file.name.split(".").pop() || "Unknown",
    size,
    lastModified: new Date(file.lastModified).toLocaleString(),
  };
}
