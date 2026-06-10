export interface FileBase64 {
  alt: string;
  file: string;
}

export function filesToBase64(
  files: File | File[],
): Promise<FileBase64 | FileBase64[]> {
  return new Promise((resolve, reject) => {
    const fileArray = Array.isArray(files) ? files : [files]; // Ensure files is an array
    const results: FileBase64[] = [];
    let filesProcessed = 0;

    fileArray.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        let dataUrl = reader.result as string;

        // Check for file extension and override MIME type if needed
        const lowerName = file.name.toLowerCase();
        if (lowerName.endsWith('.rar')) {
          const base64Data = dataUrl.split(',')[1]; // Extract pure Base64
          dataUrl = `data:application/x-rar-compressed;base64,${base64Data}`; // Updated MIME for RAR
        } else if (lowerName.endsWith('.zip')) {
          const base64Data = dataUrl.split(',')[1]; // Extract pure Base64
          dataUrl = `data:application/zip;base64,${base64Data}`; // Correct MIME for ZIP
        }

        results.push({
          alt: file.name,
          file: dataUrl, // Now with corrected MIME if applicable
        });
        filesProcessed += 1;
        if (filesProcessed === fileArray.length) {
          // Return single object if only one file was passed
          resolve(Array.isArray(files) ? results : results[0]!);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  });
}