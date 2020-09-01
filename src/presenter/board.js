import BoardView from "../view/board.js";
import SortView from "../view/sort.js";
import TaskListView from "../view/task-list.js";
import NoTaskView from "../view/no-task.js";
import TaskPresenter from "../presenter/task.js";
import LoadMoreButtonView from "../view/load-button.js";
import {sortTaskUp, sortTaskDown} from "../utils/task.js";
import {render, RenderPosition, remove} from "../utils/render.js";
import {SortType, UserAction, UpdateType} from "../const.js";

const TASK_COUNT_PER_STEP = 8;

export default class Board {
  constructor(boardContainer, TasksModel) {
    this._boardContainer = boardContainer;
    this._tasksModel = TasksModel;
    this._renderedTaskCount = TASK_COUNT_PER_STEP;
    this._currentSortType = SortType.DEFAULT;
    this._taskPresenter = {}; // переменная для хранения колбеков

    this._boardComponent = new BoardView();
    this._sortComponent = new SortView();
    this._taskListComponent = new TaskListView();
    this._noTaskComponent = new NoTaskView();
    this._loadMoreButtonComponent = new LoadMoreButtonView();

    this._handleLoadMoreButtonClick = this._handleLoadMoreButtonClick.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);
    this._handleViewAction = this._handleViewAction.bind(this);
    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleModeChange = this._handleModeChange.bind(this);

    // добавляем в массив обзерверов TasksModel
    // обработчик-наблюдатель _handleModelEvent,
    // который будет реагировать на изменения модели
    // когда произойдет изменение Model, она будет вызывать
    // этот колбэк
    this._tasksModel.addObserver(this._handleModelEvent);
  }

  init() {
    // отрисовывает доску со всем содержимым
    render(this._boardContainer, this._boardComponent, RenderPosition.BEFOREEND);

    // отрисовываем список задач
    render(this._boardComponent, this._taskListComponent, RenderPosition.BEFOREEND);

    this._renderBoard();
  }

  // добавим обертку над методом модели для получения задач,
  // в будущем так будет удобнее получать из модели данные в презенторе
  _getTasks() {
    switch (this._currentSortType) {
      case SortType.DATE_UP:
        return this._tasksModel.getTasks().slice().sort(sortTaskUp);
      case SortType.DATE_DOWN:
        return this._tasksModel.getTasks().slice().sort(sortTaskDown);
    }

    return this._tasksModel.getTasks();
  }

  _handleModeChange() {
    Object
      .values(this._taskPresenter)
      .forEach((presenter) => presenter.resetView());
  }

  // Здесь будем вызывать обновление модели.
  // actionType - действие пользователя, нужно чтобы понять, какой метод модели вызвать
  // updateType - тип изменений, нужно чтобы понять, что после нужно обновить
  // update - обновленные данные
  // этот обработчик ПЕРЕДАЕМ В TaskPresenter!
  // Мы больше не вызываем изменение задачи напрямую,
  // а делегируем ее изменение модели, задача презентера - обработать
  // действие пользователя
  // handleViewAction - обработать действие на View (представлении)
  _handleViewAction(actionType, updateType, update) {

    switch (actionType) {
      case UserAction.UPDATE_TASK:
        this._tasksModel.updateTask(updateType, update);
        break;

      case UserAction.ADD_TASK:
        this._tasksModel.addTask(updateType, update);
        break;

      case UserAction.DELETE_TASK:
        this._tasksModel.deleteTask(updateType, update);
        break;
    }
  }

  // В зависимости от типа изменений решаем, что делать:
  // - обновить часть списка (например, когда поменялось описание)
  // - обновить список (например, когда задача ушла в архив)
  // - обновить всю доску (например, при переключении фильтра)
  // обработчик-наблюдатель _handleModelEvent,
  // который будет реагировать на изменения модели
  _handleModelEvent(updateType, update) {
    switch (updateType) {
      case UpdateType.PATCH:
        // перерендер только карточки
        this._taskPresenter[update.id].init(update);
        break;

      case UpdateType.MINOR:
        // перерендер листа задач
        break;

      case UpdateType.MAJOR:
        // перерендер всей доски с сортировкой и кнопкой Load More
        break;
    }
  }

  _handleSortTypeChange(sortType) {
    // если выбрана текущая сортировка, ничего не делай
    if (this._currentSortType === sortType) {
      return;
    }

    this._currentSortType = sortType;
    // очищаем список
    this._clearTaskList();
    // рендерим задачи
    this._renderTaskList();
  }

  _renderSort() {
    render(this._boardComponent, this._sortComponent, RenderPosition.AFTERBEGIN);
    this._sortComponent.setSortTypeChangeHandler(this._handleSortTypeChange);
  }

  _clearTaskList() {
    // заменяем innerHTML. Находим у объекта this._taskPresenter все
    // значения - все задачи и у каждой вызываем метод destroy()
    Object
      .values(this._taskPresenter)
      .forEach((presenter) => presenter.destroy());

    // обнуляем объект this._taskPresenter
    this._taskPresenter = {};

    this._renderedTaskCount = TASK_COUNT_PER_STEP;
  }


  _renderTask(task) {
    const taskPresenter = new TaskPresenter(this._taskListComponent, this._handleViewAction, this._handleModeChange);
    taskPresenter.init(task);
    // запоминаем экземпляр taskPresenter в свойство this._taskPresenter,
    // где ключом выступает task.id, а занчением сам целый презентер
    // из-за этой записи есть объект this._taskPresenter,
    // который помнит все презентеры
    this._taskPresenter[task.id] = taskPresenter;
  }

  _renderTasks(tasks) {
    tasks.forEach((task) => this._renderTask(task));
  }

  _renderNoTasks() {
    render(this._boardComponent, this._noTaskComponent, RenderPosition.AFTERBEGIN);
  }

  _handleLoadMoreButtonClick() {
    const taskCount = this._getTasks().length;
    const newRenderedTaskCount = Math.min(taskCount, this._renderedTaskCount + TASK_COUNT_PER_STEP);
    const tasks = this._getTasks().slice(this._renderedTaskCount, newRenderedTaskCount);

    this._renderTasks(tasks);
    this._renderedTaskCount = newRenderedTaskCount;

    if (this._renderedTaskCount >= taskCount) {
      remove(this._loadMoreButtonComponent);
    }
  }

  _renderLoadMoreButton() {
    render(this._boardComponent, this._loadMoreButtonComponent, RenderPosition.BEFOREEND);
    this._loadMoreButtonComponent.setClickHandler(this._handleLoadMoreButtonClick);
  }

  _renderTaskList() {
    const taskCount = this._getTasks().length;
    const tasks = this._getTasks().slice(0, Math.min(taskCount, TASK_COUNT_PER_STEP));

    this._renderTasks(tasks);

    if (taskCount > TASK_COUNT_PER_STEP) {
      this._renderLoadMoreButton();
    }
  }

  _renderBoard() {
    // если все задачи в архиве, рисуй заглушку
    if (this._getTasks().every((task) => task.isArchive)) {
      this._renderNoTasks();
      return;
    }

    this._renderSort(); // рисует сортировку
    this._renderTaskList(); // рисует список задач
  }
}
