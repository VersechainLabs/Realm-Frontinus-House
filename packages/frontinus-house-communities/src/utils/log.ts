export const log = (label: string, message: string) => {
  const time = new Date().toLocaleString();
  console.log(`[Nest] - ${time} \t LOG [${label}] ${message}`);
};
