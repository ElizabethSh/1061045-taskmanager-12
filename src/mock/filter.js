import {isTaskExpired, isTaskExpiringToday, isTaskRepeating} from "../utils/task.js";

const taskToFilterMap = {
  all: (tasks) => tasks.filter((task) => !task.isArchive).length, // посчитает все не заархивированные задачи
  overdue: (tasks) => tasks.filter((task) => !task.isArchive)
            .filter((task) => isTaskExpired(task.dueDate)).length, // кол-во простроченных задач
  today: (tasks) => tasks.filter((task) => !task.isArchive)
            .filter((task) => isTaskExpiringToday(task.dueDate)).length, // кол-во задач, протухающих сегодня
  favorites: (tasks) => tasks.filter((task) => !task.isArchive)
              .filter((task) => !task.isFavorite).length, // кол-во избранных задач
  repeating: (tasks) => tasks.filter((task) => !task.isArchive)
            .filter((task) => isTaskRepeating(task.repeating)).length, // кол-во задач без срока исполнения
  archive: (tasks) => tasks.filter((task) => task.isArchive).length // кол-во заархивированных задач
};


export const generateFilter = (tasks) => {
  return Object.entries(taskToFilterMap).map(([filterName, countTasks]) =>{
    return {
      name: filterName,
      count: countTasks(tasks)
    };
  });
};
