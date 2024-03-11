import { parse } from "partial-json";

export const parsePartialJsonMarkdown = <T>(
  s: string,
  parser: (s: string) => T = parse,
) => {
  s = s.trim();

  const match = /```(json)?(.*)(?:```|$)/s.exec(s);
  const jsonString = match ? match[2] : s;

  if (jsonString.length === 0) return null;

  return parser(jsonString);
};
