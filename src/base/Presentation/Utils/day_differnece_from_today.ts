export function getDaysDifferenceFromToday(date: string | Date): number {
  const givenDate = new Date(date); // Convert input to a Date object

  if (isNaN(givenDate.getTime())) {
    throw new Error("Invalid date format. Please provide a valid date.");
  }

  const currentDate = new Date(); // Get the current date
  const timeDifference = currentDate.getTime() - givenDate.getTime(); // Difference in milliseconds
  return Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert to days
}
