import {FilterType} from "../const.js";
import {isTaskExpired, isTaskExpiringToday, isTaskRepeating} from "../utils/task.js";

export const filter = {
  [FilterType.ALL]: (tasks) => tasks.filter((task) => !task.isArchive), // посчитает все не заархивированные задачи
  [FilterType.OVERDUE]: (tasks) => tasks.filter((task) => isTaskExpired(task.dueDate)), // кол-во простроченных задач
  [FilterType.TODAY]: (tasks) => tasks.filter((task) => isTaskExpiringToday(task.dueDate)), // кол-во задач, протухающих сегодня
  [FilterType.FAVORITES]: (tasks) => tasks.filter((task) => !task.isFavorite), // кол-во избранных задач
  [FilterType.REPEATING]: (tasks) => tasks.filter((task) => isTaskRepeating(task.repeating)), // кол-во задач без срока исполнения
  [FilterType.ARCHIVE]: (tasks) => tasks.filter((task) => task.isArchive) // кол-во заархивированных задач
};
