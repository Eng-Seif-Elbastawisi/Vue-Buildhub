export const convertToBase64 = (
  files: File | File[],
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.8, // Quality between 0 (low) and 1 (high)
): Promise<string | string[]> => {
  if (!files) {
    return Promise.reject("No files provided");
  }

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          let { width, height } = img;

          // Maintain aspect ratio
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height *= maxWidth / width;
              width = maxWidth;
            } else {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress and convert to Base64
            const compressedDataUrl = canvas.toDataURL("image/webp", quality);
            resolve(compressedDataUrl);
          } else {
            reject(new Error("Canvas context is not available"));
          }
        };

        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = reader.result as string;
      };

      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  if (Array.isArray(files)) {
    // Handle multiple files
    return Promise.all(files.map((file) => compressImage(file)));
  }

  // Handle single file
  return compressImage(files);
};
