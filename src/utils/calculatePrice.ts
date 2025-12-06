/**
 * @param dailyRate Daily rent price of the vehicle
 * @param start Start date string (YYYY-MM-DD)
 * @param end End date string (YYYY-MM-DD)
 * @returns Total price as number
 */
export const calculatePrice = (dailyRate: number, start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return dailyRate * diffDays;
};
