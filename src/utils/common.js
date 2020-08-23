// Функция по генерации случайного числа из диапазона
export const getRandomInteger = (a = 0, b = 1) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));

  return Math.floor(lower + Math.random() * (upper - lower + 1));
};

// функция обновления элемента массива
// (передаем массив и объект, который хотим заменить)
export const updateItem = (items, update) => {
  // ищем в массиве этот объект по id,
  // если есть, вернет индекс элемента
  const index = items.findIndex((item) => (item.id === update.id));

  // если объекта в массиве нет, верни массив обратно
  if (index === -1) {
    return items;
  }

  // если объект есть, делаем новый массив из части до найденного элемента,
  // из самого обновленного объекта (update), и из части после
  // spread-оператор передает элементы массива в виде отдельных элементов (аргументов)
  return [
    ...items.slice(0, index),
    update,
    ...items.slice(index + 1)
  ];
};
