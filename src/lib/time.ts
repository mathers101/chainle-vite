export const getTodaysDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export const timeUntilTomorrow = () => {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0); // local midnight next day
  let ms = tomorrow.getTime() - now.getTime();

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds };
};
