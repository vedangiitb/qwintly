export const getPagination = (size: number, page: number) => {
  const queryLimit = size ?? 10;
  const queryPage = page ?? 1;
  const from = (queryPage - 1) * queryLimit;
  const to = from + queryLimit - 1;
  return { from, to };
};
