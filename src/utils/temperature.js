export function convertTemperature(valueC, unit) {
  if (unit === 'F') {
    return Math.round((valueC * 9) / 5 + 32);
  }
  if (unit === 'K') {
    return Math.round(valueC + 273.15);
  }
  return Math.round(valueC);
}
