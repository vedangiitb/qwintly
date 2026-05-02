export const getSecondsUntilUTCMidnight = () => {
  const now = new Date();
  const midnight = new Date();
  midnight.setUTCHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
};

export const getUTCDateString = () => {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
};
