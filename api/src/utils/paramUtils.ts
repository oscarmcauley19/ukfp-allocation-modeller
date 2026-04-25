/**
 * Utility function to parse an ID parameter from a request.
 * @param idParam
 * @returns Parsed ID string
 * @throws Error if the parameter is an array
 */
export const parseIdParam = (idParam: string | string[]): string => {
  if (Array.isArray(idParam)) {
    throw new Error("Expected a single ID value, but received an array");
  }
  return idParam;
};

/**
 * Utility function to parse an ID parameter as an integer.
 * @param idParam
 * @returns Parsed integer ID
 * @throws Error if the parameter is an array or cannot be parsed as an integer
 */
export const parseIntIdParam = (idParam: string | string[]): number => {
  const idStr = parseIdParam(idParam);
  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    throw new Error(`Invalid ID parameter: ${idStr} is not a valid integer`);
  }
  return id;
};
