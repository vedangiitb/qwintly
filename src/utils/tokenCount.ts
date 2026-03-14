import { encode } from "gpt-tokenizer";

export const tokenCounter = (text: string): number => {
  return encode(text).length;
};
