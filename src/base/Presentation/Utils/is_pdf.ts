const getFileType = (fileUrl: string) => {
  // Extract file type from URL or MIME type
  const extension = fileUrl?.split(".").pop()?.toLowerCase();
  return extension === "pdf" ? "pdf" : "image";
};
export const isPDF = (fileUrl: string) => {
  // Check if the file is PDF by extension or MIME type
  // console.log(fileUrl);
  return (
    fileUrl?.endsWith(".pdf") ||
    fileUrl?.includes("application/pdf") ||
    getFileType(fileUrl) === "pdf"
  );
};
