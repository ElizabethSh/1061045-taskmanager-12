import moment from "moment";
import {Color} from "../const.js";
import {isDatesEqual} from "./task.js";

export const colorToHex = {
  [Color.BLACK]: `#000000`,
  [Color.BLUE]: `#0c5cdd`,
  [Color.GREEN]: `#31b55c`,
  [Color.PINK]: `#ff3cb9`,
  [Color.YELLOW]: `#ffe125`
};

// форматирование даты в нужном формате
export const parceChartDate = (date) => moment(date).format(`D MMM`);

// посчитать кол-во задач в заданном диапазоне дат
export const countTaskinDateRange = (dates, tasks) => {
  return dates.map(
      (date) => tasks.filter(
          (task) => isDatesEqual(task.dueDate, date)
      ).length
  );
};

export const getDatesInRange = (dateFrom, dateTo) => {
  const dates = [];
  let stepDate = new Date(dateFrom);

  // получить все даты из диапазона,
  // чтобы корректно отразить их на графике.
  // Для этого проходим в цикле от даты "от"
  // до даты "до" и каждый день, что между,
  // заносим в результирующий массив dates
  while (moment(stepDate).isSameOrBefore(dateTo)) {
    dates.push(new Date(stepDate));
    stepDate.setDate(stepDate.getDate() + 1);
  }

  return dates;
};

// Используем особенности Set, чтобы удалить дубли в массиве
export const makeItemUniq = (items) => [...new Set(items)];

// отсортирует массив задач по цвету и посчитает его длину
export const countTasksByColor = (tasks, color) => {
  return tasks.filter((task) => task.color === color).length;
};

export const countCompletedTaskInDayeRange = (tasks, dateFrom, dateTo) => {
  return tasks.reduce((counter, task) => {
    if (task.dueDate === null) {
      return counter;
    }

    // С помощью moment.js проверям, сколько задач с дедлайном
    // попадают в диапазон дат
    if (
      moment(task.dueDate).isSame(dateFrom) ||
      moment(task.dueDate).isBetween(dateFrom, dateTo) ||
      moment(task.dueDate).isSame(dateTo)
    ) {
      return counter + 1;
    }
    return counter;
  }, 0);
};
