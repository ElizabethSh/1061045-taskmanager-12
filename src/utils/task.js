import moment from "moment";

export const getCurrentDate = () => {
  const currentDate = new Date();
  currentDate.setHours(23, 59, 59, 999); // будем считать срок у всех задач - это 23:59:59 установленной даты
  return new Date(currentDate);
};

// функция перевода даты в человеческий вид
export const formatTaskDueDate = (dueDate) => {
  if (!(dueDate instanceof Date)) {
    return ``;
  }

  return moment(dueDate).format(`D MMMM`);
};

// Функция для определения просрочена ли дата (true/false)
export const isTaskExpired = (dueDate) => {
  if (dueDate === null) {
    return false;
  }

  const currentDate = getCurrentDate();

  // return currentDate.getTime() > dueDate.getTime();
  return moment(currentDate).isAfter(dueDate, `day`);
};

// функция определяет истекает ли дата сегодня (true/false)
export const isTaskExpiringToday = (dueDate) => {
  if (dueDate === null) {
    return false;
  }

  const currentDate = getCurrentDate();
  // return currentDate.getTime() === dueDate.getTime();
  return moment(dueDate).isSame(currentDate, `day`);
};

// функция для определения повторяемости задачи (true/false)
export const isTaskRepeating = (repeating) => {
  return Object.values(repeating).some(Boolean);
};

// Функция помещает задачи без даты в конце списка,
// возвращая нужный вес для колбэка sort
const getWeightForNullDate = (dateA, dateB) => {
  if (dateA === null && dateB === null) {
    return 0;
  }

  if (dateA === null) {
    return 1;
  }

  if (dateB === null) {
    return -1;
  }
  return null;
};

// функция сортировки даты по возрастанию
export const sortTaskUp = (taskA, taskB) => {
  const weight = getWeightForNullDate(taskA.dueDate, taskB.dueDate);

  if (weight !== null) {
    return weight;
  }

  return taskA.dueDate.getTime() - taskB.dueDate.getTime();
};

// функция сортировки даты по убыванию
export const sortTaskDown = (taskA, taskB) => {
  const weight = getWeightForNullDate(taskA.dueDate, taskB.dueDate);

  if (weight !== null) {
    return weight;
  }

  return taskB.dueDate.getTime() - taskA.dueDate.getTime();
};

export const isDatesEqual = (dateA, dateB) => {
  if (dateA === null && dateB === null) {
    return true;
  }
  // return dateA.getTime() === dateB.getTime();
  return moment(dateA).isSame(dateB, `day`);
};
