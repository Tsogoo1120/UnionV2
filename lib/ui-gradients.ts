/** Gradient palette for lesson/media cards — shared with ImageWithFallback */
export const LESSON_GRADS = [
  "linear-gradient(135deg,#3A352E,#262220)",
  "linear-gradient(135deg,#1F2B4C,#262220)",
  "linear-gradient(135deg,#E84A1F,#B8341A)",
  "linear-gradient(135deg,#4A453E,#262220)",
  "linear-gradient(135deg,#3D2A1A,#262220)",
  "linear-gradient(135deg,#1F2B4C,#3A352E)",
] as const;

export function gradForKey(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h + key.charCodeAt(i) * (i + 3)) % LESSON_GRADS.length;
  return LESSON_GRADS[h] ?? LESSON_GRADS[0];
}
