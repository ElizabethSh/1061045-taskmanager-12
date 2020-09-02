import SiteMenuView from "./view/site-menu.js";
import {generateTask} from "./mock/task.js";
import BoardPresenter from "./presenter/board.js";
import FilterPresenter from "./presenter/filter.js";
import TasksModel from "./model/tasks.js";
import FilterModel from "./model/filter.js";
import {render, RenderPosition} from "./utils/render.js";

const TASK_COUNT = 22;
const tasks = new Array(TASK_COUNT).fill().map(generateTask);

const tasksModel = new TasksModel();
const filterModel = new FilterModel();

tasksModel.setTasks(tasks);

const main = document.querySelector(`.main`);
const siteHeader = main.querySelector(`.main__control`);

const boardPresenter = new BoardPresenter(main, tasksModel, filterModel);
const filterPresenter = new FilterPresenter(main, filterModel, tasksModel);

// отрисовывает меню
render(siteHeader, new SiteMenuView(), RenderPosition.BEFOREEND);

// отрисовывает фильтры
filterPresenter.init();

// отрисовывает доску со всем содержимым
boardPresenter.init();

document.querySelector(`#control__new-task`) .addEventListener(`click`, (evt) => {
  evt.preventDefault();
  boardPresenter.createTask();
});
