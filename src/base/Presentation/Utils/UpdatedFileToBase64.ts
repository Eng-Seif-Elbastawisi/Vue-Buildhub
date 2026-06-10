async function urlToBase64(url: string): Promise<string> {
  if (!url.startsWith('blob:') && !url.startsWith('data:')) {
    return url;
  }

  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;

    reader.readAsDataURL(blob);
  });
}
export { urlToBase64 };
