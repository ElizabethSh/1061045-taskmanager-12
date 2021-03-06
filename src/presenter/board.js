import BoardView from "../view/board.js";
import SortView from "../view/sort.js";
import TaskListView from "../view/task-list.js";
import NoTaskView from "../view/no-task.js";
import TaskPresenter from "../presenter/task.js";
import TaskNewPresenter from "../presenter/task-new.js";
import LoadMoreButtonView from "../view/load-button.js";
import LoadingView from "../view/loading.js";
import {filter} from "../utils/filter.js";
import {sortTaskUp, sortTaskDown} from "../utils/task.js";
import {render, RenderPosition, remove} from "../utils/render.js";
import {SortType, UserAction, UpdateType} from "../const.js";

const TASK_COUNT_PER_STEP = 8;

export default class Board {
  constructor(boardContainer, TasksModel, filterModel, api) {
    this._boardContainer = boardContainer;
    this._tasksModel = TasksModel;
    this._filterModel = filterModel;
    this._api = api;
    this._renderedTaskCount = TASK_COUNT_PER_STEP;
    this._currentSortType = SortType.DEFAULT;
    this._taskPresenter = {}; // переменная для хранения колбеков

    this._boardComponent = new BoardView();
    this._isLoading = true;
    this._sortComponent = null;
    this._taskListComponent = new TaskListView();
    this._noTaskComponent = new NoTaskView();
    this._loadingComponent = new LoadingView();
    this._loadMoreButtonComponent = null;

    this._handleLoadMoreButtonClick = this._handleLoadMoreButtonClick.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);
    this._handleViewAction = this._handleViewAction.bind(this);
    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleModeChange = this._handleModeChange.bind(this);

    this._taskNewPresenter = new TaskNewPresenter(this._taskListComponent, this._handleViewAction);
  }

  init() {
    // отрисовывает доску со всем содержимым
    render(this._boardContainer, this._boardComponent, RenderPosition.BEFOREEND);

    // отрисовываем список задач
    render(this._boardComponent, this._taskListComponent, RenderPosition.BEFOREEND);

    this._tasksModel.addObserver(this._handleModelEvent);
    this._filterModel.addObserver(this._handleModelEvent);


    this._renderBoard();
  }

  destroy() {
    this._clearBoard({resetRenderedTaskCount: true, resetSortType: true});

    remove(this._taskListComponent);
    remove(this._boardComponent);

    this._tasksModel.removeObserver(this._handleModelEvent);
    this._filterModel.removeObserver(this._handleModelEvent);

  }

  createTask(callback) {
    this._taskNewPresenter.init(callback);
  }

  // добавим обертку над методом модели для получения задач,
  // в будущем так будет удобнее получать из модели данные в презенторе
  _getTasks() {
    const filterType = this._filterModel.getFilter();
    const tasks = this._tasksModel.getTasks();
    const filteredTasks = filter[filterType](tasks);

    switch (this._currentSortType) {
      case SortType.DATE_UP:
        return filteredTasks.sort(sortTaskUp);
      case SortType.DATE_DOWN:
        return filteredTasks.sort(sortTaskDown);
    }

    return filteredTasks;
  }

  _handleModeChange() {
    this._taskNewPresenter.destroy();
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
        // обновляем задачу на сервере
        this._api.updateTask(update).then((response) => {
          // когда сервер пришлет 200 что задача обновилась,
          // обновляем представление
          // представление обновится тогда, когда на это отреагирует сервер
          this._tasksModel.updateTask(updateType, response);
        }
        );
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
  _handleModelEvent(updateType, data) {
    switch (updateType) {
      case UpdateType.PATCH:
        // перерендер только карточки
        this._taskPresenter[data.id].init(data);
        break;

      case UpdateType.MINOR:
        // перерендер листа задач
        this._clearBoard();
        this._renderBoard();
        break;

      case UpdateType.MAJOR:
        // перерендер всей доски с сортировкой и кнопкой Load More
        this._clearBoard({resetRenderedTaskCount: true, resetSortType: true});
        this._renderBoard();
        break;

      case UpdateType.INIT:
        this._isLoading = false;
        remove(this._loadingComponent);
        this._renderBoard();
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
    this._clearBoard({resetRenderedTaskCount: true});
    // рендерим задачи
    this._renderBoard();
  }

  _renderSort() {
    this._sortComponent = new SortView(this._currentSortType);

    this._sortComponent.setSortTypeChangeHandler(this._handleSortTypeChange);

    render(this._boardComponent, this._sortComponent, RenderPosition.AFTERBEGIN);
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

  _renderLoading() {
    render(this._boardComponent, this._loadingComponent, RenderPosition.AFTERBEGIN);
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
    this._loadMoreButtonComponent = new LoadMoreButtonView();
    this._loadMoreButtonComponent.setClickHandler(this._handleLoadMoreButtonClick);

    render(this._boardComponent, this._loadMoreButtonComponent, RenderPosition.BEFOREEND);
  }

  // метод для очистки доски
  // флаги у resetRenderedTaskCount и resetSortType говорят о
  // типе изменений (MINOR(false) or MAJOR(true))
  _clearBoard({resetRenderedTaskCount = false, resetSortType = false} = {}) {
    // получаем кол-во задач на момент очистки доски
    const taskCount = this._getTasks().length;

    this._taskNewPresenter.destroy();

    // удаление всех задач
    Object
      .values(this._taskPresenter)
      .forEach((presenter) => presenter.destroy());
    this._taskPresenter = {};

    remove(this._sortComponent); // удаление сортировки
    remove(this._loadingComponent);
    remove(this._noTaskComponent); // удаление заглушки "Нет задач"
    remove(this._loadMoreButtonComponent); // удаление кнопки допоказа

    // проверка нужно ли сбрасывать кол-во показанных задач
    if (resetRenderedTaskCount) {
      // если нужно, делаем их кол-вом по умолчанию
      this._renderedTaskCount = TASK_COUNT_PER_STEP;
    } else {
      // если нет, нужно оставить кол-во задач, кот. было показано
      // если было изменение кол-ва задач, корректируем кол-ва показанных задач
      this._renderedTaskCount = Math.min(taskCount, this._renderedTaskCount);
    }

    // если сбрасывается сортировка, то по умолчанию она д.б. SortType.DEFAULT
    if (resetSortType) {
      this._currentSortType = SortType.DEFAULT;
    }
  }

  _renderBoard() {
    if (this._isLoading) {
      this._renderLoading();
      return;
    }

    const tasks = this._getTasks();
    const taskCount = tasks.length;

    if (taskCount === 0) {
      this._renderNoTasks();
      return;
    }

    this._renderSort();

    this._renderTasks(tasks.slice(0, Math.min(taskCount, this._renderedTaskCount)));

    if (taskCount > this._renderedTaskCount) {
      this._renderLoadMoreButton();
    }
  }
}
