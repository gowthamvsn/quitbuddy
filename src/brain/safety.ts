// src/brain/safety.ts
const BLOCKED = [
  /gum/i, /patch/i, /lozenge/i, /chantix/i, /zyban/i,
  /die/i, /kill/i, /suicide/i, /hurt/i,
  /therap/i, /counsel/i, /psych/
];

export const isSafe = (text: string): boolean => {
  return !BLOCKED.some(r => r.test(text));
};

export const redirect = (): string => {
  return "I'm here to help you quit nicotine. Let's focus on your journey. What’s on your mind today?";
};