

export function cifValidation(cif) {
  if (typeof cif !== 'string' || cif.length === 0) {
    return false;
  }

  const value = cif.toUpperCase().trim();

  if (!/^[A-Z]\d{7}[A-Z0-9]$/.test(value)) {
    return false;
  }

  const firstLetter = value.substring(0, 1);
  const numericPart = value.substring(1, 8);
  const controlDigit = value.substring(8, 9);

  if (!/^[ABCDEFGHJKLMNPQRSUVW]$/.test(firstLetter)) {
    return false;
  }

  let evenSum = 0;
  for (let i = 1; i < numericPart.length; i += 2) {
    evenSum += parseInt(numericPart[i], 10);
  }

  let oddSum = 0;
  for (let i = 0; i < numericPart.length; i += 2) {
    const double = parseInt(numericPart[i], 10) * 2;
    oddSum += double < 10 ? double : Math.floor(double / 10) + (double % 10);
  }

  const totalSum = evenSum + oddSum;
  const sumUnitsDigit = totalSum % 10;
  const calculatedControlDigit = sumUnitsDigit === 0 ? 0 : 10 - sumUnitsDigit;
  const calculatedControlLetter = 'JABCDEFGHI'[calculatedControlDigit];

  if (['K', 'P', 'Q', 'S'].includes(firstLetter)) {
    return controlDigit === calculatedControlLetter;
  } else if (['A', 'B', 'E', 'H'].includes(firstLetter)) {
    return controlDigit === String(calculatedControlDigit);
  } else {
    return controlDigit === String(calculatedControlDigit) || controlDigit === calculatedControlLetter;
  }
}