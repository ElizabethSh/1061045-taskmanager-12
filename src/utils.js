export const RenderPosition = {
  AFTERBEGIN: `afterbegin`,
  BEFOREEND: `beforeend`
};

export const render = (container, element, position) => {
  switch (position) {
    case RenderPosition.AFTERBEGIN:
      container.prepend(element);
      break;
    case RenderPosition.BEFOREEND:
      container.append(element);
      break;
  }
};

export const renderTemplate = (container, template, position) => {
  container.insertAdjacentHTML(position, template);
};

// функция для превращения щаблонной строки в разметку (DOM-элемент)
export const createElement = (template) => {
  const newElement = document.createElement(`div`); // создаем пустой div
  newElement.innerHTML = template; // берем HTML в виде строки и вкладываем в div, превращая в DOM-элемент

  return newElement.firstChild; // возвращаем этот DOM-элемент
};

export const getCurrentDate = () => {
  const currentDate = new Date();
  currentDate.setHours(23, 59, 59, 999); // будем считать срок у всех задач - это 23:59:59 установленной даты
  return new Date(currentDate);
};

// Функция по генерации случайного числа из диапазона
export const getRandomInteger = (a = 0, b = 1) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));

  return Math.floor(lower + Math.random() * (upper - lower + 1));
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

