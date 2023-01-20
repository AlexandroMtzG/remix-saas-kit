import { Month } from "./Month";

const allMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const months: Month[] = [];
for (let month = 1; month <= 12; month++) {
  months.push({
    value: month,
    title: allMonths[month - 1].toString(),
    shortTitle: allMonths[month - 1].substr(0, 3),
  });
}

export default months;
