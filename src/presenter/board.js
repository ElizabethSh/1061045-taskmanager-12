import BoardView from "../view/board.js";
import SortView from "../view/sort.js";
import TaskListView from "../view/task-list.js";
import NoTaskView from "../view/no-task.js";
import TaskPresenter from "../presenter/task.js";
import LoadMoreButtonView from "../view/load-button.js";
import {sortTaskUp, sortTaskDown} from "../utils/task.js";
import {render, RenderPosition, remove} from "../utils/render.js";
import {SortType} from "../const.js";
import {updateItem} from "../utils/common.js";

const TASK_COUNT_PER_STEP = 8;

export default class Board {
  constructor(boardContainer) {
    this._boardContainer = boardContainer;
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
    this._handleTaskChange = this._handleTaskChange.bind(this);
    this._handleModeChange = this._handleModeChange.bind(this);
  }

  init(boardTasks) {
    // бэкап списка задач
    this._boardTasks = boardTasks.slice();

    // бэкап списка задач для сортировки по умолчанию
    this._sourcedBoardTask = boardTasks.slice();

    // отрисовывает доску со всем содержимым
    render(this._boardContainer, this._boardComponent, RenderPosition.BEFOREEND);

    // отрисовываем список задач
    render(this._boardComponent, this._taskListComponent, RenderPosition.BEFOREEND);

    this._renderBoard();
  }

  _handleModeChange() {
    Object
      .values(this._taskPresenter)
      .forEach((presenter) => presenter.resetView());
  }

  // updatedTask сообщает какой элемент хотим обновить
  _handleTaskChange(updatedTask) {
    // обновляет элемент в моках
    // объект с обновленной задачей подставляется в массивы this._boardTasks
    // и this._sourcedBoardTask
    this._boardTasks = updateItem(this._boardTasks, updatedTask);
    this._sourcedBoardTask = updateItem(this._sourcedBoardTask, updatedTask);

    // вызывает init у существующего TaskPresenter, передав обновленные данные,
    // что приводит к перерисовке карточки
    this._taskPresenter[updatedTask.id].init(updatedTask);
  }

  _sortTasks(sortType) {
    switch (sortType) {
      case SortType.DATE_UP:
        this._boardTasks.sort(sortTaskUp);
        break;
      case SortType.DATE_DOWN:
        this._boardTasks.sort(sortTaskDown);
        break;
      default:
        this._boardTasks = this._sourcedBoardTask.slice();
    }
    this._currentSortType = sortType;
  }

  _handleSortTypeChange(sortType) {
    // если выбрана текущая сортировка, ничего не делай
    if (this._currentSortType === sortType) {
      return;
    }
    this._sortTasks(sortType);
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
    const taskPresenter = new TaskPresenter(this._taskListComponent, this._handleTaskChange, this._handleModeChange);
    taskPresenter.init(task);
    // запоминаем экземпляр taskPresenter в свойство this._taskPresenter,
    // где ключом выступает task.id, а занчением сам целый презентер
    // из-за этой записи есть объект this._taskPresenter,
    // который помнит все презентеры
    this._taskPresenter[task.id] = taskPresenter;
  }


  _renderTasks(from, to) {
    this._boardTasks
      .slice(from, to)
      .forEach((boardTask) => this._renderTask(boardTask));
  }


  _renderNoTasks() {
    render(this._boardComponent, this._noTaskComponent, RenderPosition.AFTERBEGIN);
  }


  _handleLoadMoreButtonClick() {
    this._renderTasks(this._renderedTaskCount, this._renderedTaskCount + TASK_COUNT_PER_STEP);
    this._renderedTaskCount += TASK_COUNT_PER_STEP;

    if (this._renderedTaskCount >= this._boardTasks.length) {
      remove(this._loadMoreButtonComponent);
    }
  }

  _renderLoadMoreButton() {
    render(this._boardComponent, this._loadMoreButtonComponent, RenderPosition.BEFOREEND);
    this._loadMoreButtonComponent.setClickHandler(this._handleLoadMoreButtonClick);
  }

  _renderTaskList() {
    this._renderTasks(0, Math.min(this._boardTasks.length, TASK_COUNT_PER_STEP));

    if (this._boardTasks.length > TASK_COUNT_PER_STEP) {
      this._renderLoadMoreButton();
    }
  }

  _renderBoard() {
    // если все задачи в архиве, рисуй заглушку
    if (this._boardTasks.every((task) => task.isArchive)) {
      this._renderNoTasks();
      return;
    }

    this._renderSort(); // рисует сортировку
    this._renderTaskList(); // рисует список задач
  }
}
