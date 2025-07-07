export const transpose = (matrix: any[][]) => {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
};
