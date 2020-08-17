export const getCurrentDate = () => {
  const currentDate = new Date();
  currentDate.setHours(23, 59, 59, 999); // будем считать срок у всех задач - это 23:59:59 установленной даты
  return new Date(currentDate);
};

// функция перевода даты в человеческий вид
export const humanizeTaskDueDate = (dueDate) => {
  return dueDate.toLocaleString(`en-US`, {day: `numeric`, month: `long`});
};

// Функция для определения просрочена ли дата (true/false)
export const isTaskExpired = (dueDate) => {
  if (dueDate === null) {
    return false;
  }

  const currentDate = getCurrentDate();

  return currentDate.getTime() > dueDate.getTime();
};

// функция определяет истекает ли дата сегодня (true/false)
export const isTaskExpiringToday = (dueDate) => {
  if (dueDate === null) {
    return false;
  }

  const currentDate = getCurrentDate();
  return currentDate.getTime() === dueDate.getTime();
};

// функция для определения повторяемости задачи (true/false)
export const isTaskRepeating = (repeating) => {
  return Object.values(repeating).some(Boolean);
};
