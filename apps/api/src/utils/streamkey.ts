import { v4 as uuidv4 } from "uuid";

export const generateStreamKey = (): string => {
  return uuidv4().replace(/-/g, "");
};
