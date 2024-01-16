const formatCurrency = (number) => {
  // Convierte el número a un entero
  const integerNumber = Math.trunc(number);

  // Convierte el número entero a una cadena y extrae el signo
  const sign = Math.sign(integerNumber) === -1 ? "-" : "";
  const absoluteNumber = Math.abs(integerNumber);

  // Convierte el número absoluto a una cadena y revierte la cadena
  const reversedNumberString = absoluteNumber
    .toString()
    .split("")
    .reverse()
    .join("");

  // Divide la cadena en grupos de tres dígitos y luego une los grupos con comas
  const formattedNumber =
    reversedNumberString.match(/.{1,3}/g)?.join(",") || "";

  // Vuelve a invertir la cadena para obtener el orden correcto
  const result = sign + formattedNumber.split("").reverse().join("");

  return result;
};

const calculateTotalPercentage = (percentageToDisccountOrAdd) => {
  return percentageToDisccountOrAdd < 0
    ? String(percentageToDisccountOrAdd).length > 1
      ? 1 - Math.abs(percentageToDisccountOrAdd) / 100
      : 1.0 + percentageToDisccountOrAdd / 100
    : String(percentageToDisccountOrAdd).length > 1
    ? 1 + Math.abs(percentageToDisccountOrAdd) / 100
    : 1.0 + percentageToDisccountOrAdd / 100;
};

function formatCheckoutDate(checkoutDate) {
  const date = new Date(checkoutDate);
  const day = (date.getDate() + 1).toString().padStart(2, "0"); // Agrega cero adelante si es menor a 10
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Agrega cero adelante si es menor a 10
  const formattedDate = `${day}/${month}/${date.getFullYear()}`;
  return formattedDate;
}

module.exports = {
  formatCurrency,
  calculateTotalPercentage,
  formatCheckoutDate,
};
