import {COLORS} from "../const.js";
import {getRandomInteger} from "../utils.js";


const generateDescription = () => {
  const descriptions = [
    `Изучить теорию`,
    `Сделать домашку`,
    `Пройти интенсив на соточку`
  ];

  const randomIndex = getRandomInteger(0, descriptions.length - 1);
  return descriptions[randomIndex];
};

const generateDate = () => {
  const isDate = Boolean(getRandomInteger(0, 1));

  // определяем задача с датой или нет
  if (!isDate) {
    return null;
  }

  // генерируем расписание для задачи без даты
  const maxDaysGap = 7;
  const daysGap = getRandomInteger(-maxDaysGap, maxDaysGap); // задача может повторяться один из 7 дней
  const currentDate = new Date();
  currentDate.setHours(23, 59, 59, 999); // будем считать срок у всех задач - это 23:59:59 установленной даты
  currentDate.setDate(currentDate.getDate() + daysGap);

  return new Date(currentDate);
};

// генерируем дни повторений задачи
const generateRepeating = () => {
  return {
    mo: false,
    tu: false,
    we: Boolean(getRandomInteger(0, 1)),
    th: false,
    fr: Boolean(getRandomInteger(0, 1)),
    sa: false,
    su: false
  };
};

const getRandomColor = () => {
  const randomIndex = getRandomInteger(0, COLORS.length - 1);
  return COLORS[randomIndex];
};

export const generateTask = () => {
  const dueDate = generateDate();

  // если дата отсутствует (dueDate === null), то нужно генерировать дни повторений, иначе - не нужно, все дни false
  const repeating = dueDate === null ? generateRepeating() : {
    mo: false,
    tu: false,
    we: false,
    th: false,
    fr: false,
    sa: false,
    su: false
  };

  return {
    description: generateDescription(),
    dueDate,
    repeating,
    color: getRandomColor(),
    isFavorite: Boolean(getRandomInteger(0, 1)),
    isArchive: Boolean(getRandomInteger(0, 1)),
  };
};
