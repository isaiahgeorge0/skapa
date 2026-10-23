function channel(hex: string, index: number) {
  const value = parseInt(hex.replace("#", "").slice(index, index + 2), 16) / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function contrastRatio(foreground: string, background: string) {
  const luminance = (hex: string) =>
    0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 2) + 0.0722 * channel(hex, 4);
  const left = luminance(foreground);
  const right = luminance(background);
  const [hi, lo] = left > right ? [left, right] : [right, left];
  return (hi + 0.05) / (lo + 0.05);
}

/** Black or white, whichever is readable on the given background. */
export function inkOn(background: string) {
  const white = contrastRatio("#FFFFFF", background);
  const black = contrastRatio("#0A0A0A", background);
  return white >= black ? "#FFFFFF" : "#0A0A0A";
}

/** Brand background on a chip when it stays readable, otherwise black or white. */
export function chipInk(accent: string, background: string) {
  return contrastRatio(background, accent) >= 4.5 ? background : inkOn(accent);
}
