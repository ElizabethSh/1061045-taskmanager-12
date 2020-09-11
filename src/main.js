import SiteMenuView from "./view/site-menu.js";
import StatisticsView from "./view/statistics.js";
import BoardPresenter from "./presenter/board.js";
import FilterPresenter from "./presenter/filter.js";
import TasksModel from "./model/tasks.js";
import FilterModel from "./model/filter.js";
import {render, RenderPosition, remove} from "./utils/render.js";
import {MenuItem, UpdateType, FilterType} from "./const.js";
import Api from "./api.js";

const AUTHORIZATION = `Basic hS2sd3dfSwcl1sa2j`;
const END_POINT = `https://12.ecmascript.pages.academy/task-manager`; // адрес сервера

const main = document.querySelector(`.main`);
const siteHeader = main.querySelector(`.main__control`);
const api = new Api(END_POINT, AUTHORIZATION);

const tasksModel = new TasksModel();
const filterModel = new FilterModel();

const siteMenuComponent = new SiteMenuView();
const boardPresenter = new BoardPresenter(main, tasksModel, filterModel, api);
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

// отрисовывает фильтры
filterPresenter.init();

// отрисовывает доску со всем содержимым
boardPresenter.init();

// полученные с сервера задачи отправляем в tasksModel
api.getTasks()
  .then((tasks) => {
    tasksModel.setTasks(UpdateType.INIT, tasks);
    // отрисовывает меню
    render(siteHeader, siteMenuComponent, RenderPosition.BEFOREEND);
    siteMenuComponent.setMenuClickHandler(handleSiteMenuClick);
  })
  // сервер может не вернуть задачи, но приложение должно работать
  // описываем catch, в который массива задач передаем пустой массив
  .catch(() => {
    tasksModel.setTasks(UpdateType.INIT, []);
    // отрисовывает меню
    render(siteHeader, siteMenuComponent, RenderPosition.BEFOREEND);
    siteMenuComponent.setMenuClickHandler(handleSiteMenuClick);
  });
