import SiteMenuView from "./view/site-menu.js";
import StatisticsView from "./view/statistics.js";
import {generateTask} from "./mock/task.js";
import BoardPresenter from "./presenter/board.js";
import FilterPresenter from "./presenter/filter.js";
import TasksModel from "./model/tasks.js";
import FilterModel from "./model/filter.js";
import {render, RenderPosition, remove} from "./utils/render.js";
import {MenuItem, UpdateType, FilterType} from "./const.js";

const TASK_COUNT = 22;
const tasks = new Array(TASK_COUNT).fill().map(generateTask);

const tasksModel = new TasksModel();
const filterModel = new FilterModel();

tasksModel.setTasks(tasks);

const main = document.querySelector(`.main`);
const siteHeader = main.querySelector(`.main__control`);
const siteMenuComponent = new SiteMenuView();

const boardPresenter = new BoardPresenter(main, tasksModel, filterModel);
const filterPresenter = new FilterPresenter(main, filterModel, tasksModel);

// хэндлер, кот. будет вызван на собитие закрытия формы добавления задачи
const handleTaskNewFormClose = () => {
  siteMenuComponent.getElement().querySelector(`[value=${MenuItem.TASKS}]`).disabled = false;
  siteMenuComponent.setMenuItem(MenuItem.TASKS);
};

let statisticsComponent = null;

const handleSiteMenuClick = (menuItem) => {
  switch (menuItem) {

    // этот случай нужен, чтобы предусмотреть случай когда со
    // статистики пользватель пытается добавить задачу
    case MenuItem.ADD_NEW_TASK:
      // Скрыть статистику
      remove(statisticsComponent);

      // Показать доску
      // 1. Чтобы показать форму добавления задачи
      // сначала нужно удалить доску (уничтожить презентер)
      boardPresenter.destroy();
      // 2. Установить фильтр по умолчанию (ALL)
      filterModel.setFilter(UpdateType.MAJOR, FilterType.ALL);
      // 3. Заново инициализировать доску
      boardPresenter.init();

      // Показать форму добавления новой задачи
      boardPresenter.createTask(handleTaskNewFormClose);

      // Убрать выделение с ADD NEW TASK после сохранения
      siteMenuComponent.getElement().querySelector(`[value=${MenuItem.TASKS}]`).disabled = true;
      break;

      // на случай переключения сразу на tasks
      // нужно сделать сразу инит доски
    case MenuItem.TASKS:
      // Показать доску
      boardPresenter.init();
      // Скрыть статистику
      remove(statisticsComponent);
      break;

    // при переключении на статистику сделать destroy
    case MenuItem.STATISTICS:
      // Скрыть доску
      boardPresenter.destroy();
      // Показать статистику
      statisticsComponent = new StatisticsView(tasksModel.getTasks());
      render(main, statisticsComponent, RenderPosition.BEFOREEND);
      break;
  }
};

siteMenuComponent.setMenuClickHandler(handleSiteMenuClick);

// отрисовывает меню
render(siteHeader, siteMenuComponent, RenderPosition.BEFOREEND);

// отрисовывает фильтры
filterPresenter.init();

// отрисовывает доску со всем содержимым
boardPresenter.init();
