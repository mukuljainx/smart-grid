export const get2DArray = <T>(count: number) => {
  const arr: T[][] = [];

  for (let i = 0; i < count; i++) {
    arr.push([]);
  }

  return arr;
};
