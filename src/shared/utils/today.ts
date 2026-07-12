export const today = (): Date => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};
