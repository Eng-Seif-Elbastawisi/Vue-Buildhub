export const fullDateFormat = (date: string | Date): string => {
  const parsedDate = date instanceof Date ? date : new Date(date);

  // Check if the date is valid
  if (isNaN(parsedDate.getTime())) {
    return "";
  }
  // Extract day, month, and year
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = String(parsedDate.getFullYear()); // Full year
  const hours = String(parsedDate.getHours()).padStart(2, "0");
  const minutes = String(parsedDate.getMinutes()).padStart(2, "0");
  const seconds = String(parsedDate.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
