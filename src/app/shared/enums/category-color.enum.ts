export enum ECategoryColor {
  gray = 1,
  darkGray = 2,
  yellow = 3,
  pink = 4,
  orange = 5,
  red = 6,
  green = 7,
  darkGreen = 8,
  mediumPink = 9,
  darkPink = 10,
  purple = 11,
  cyan = 12,
  blue = 13,
  darkBlue = 14,
  mediumPurple = 15,
  darkPurple = 16,
  mediumYellow = 17,
  darkYellow = 18,
}

export const categoryColors = Object.keys(ECategoryColor)
  .filter((k) => isNaN(Number(k)))
  .map((k) => ECategoryColor[k as keyof typeof ECategoryColor]);
