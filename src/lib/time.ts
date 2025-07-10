import dayjs from "dayjs";

export const getTodaysDate = () => {
  const today = dayjs().format("YYYY-MM-DD");
  return today;
};

export const timeUntilTomorrow = () => {
  const now = dayjs();
  const tomorrow = dayjs().add(1, "day").startOf("day"); // start of the next day

  const ms = tomorrow.diff(now); // difference in milliseconds

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds };
};
