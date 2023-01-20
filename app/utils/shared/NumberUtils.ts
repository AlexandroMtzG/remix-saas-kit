import numeral from "numeral";

const numberFormat = (value: number): string => {
  return numeral(value).format("0");
};
const decimalFormat = (value: number): string => {
  return numeral(value).format("0,0.00");
};
const intFormat = (value: number): string => {
  return numeral(value).format("0,0");
};

export default {
  numberFormat,
  decimalFormat,
  intFormat,
};
