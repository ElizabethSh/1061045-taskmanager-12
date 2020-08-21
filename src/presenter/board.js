import BoardView from "../view/board.js";
import SortView from "../view/sort.js";
import TaskListView from "../view/task-list.js";
import NoTaskView from "../view/no-task.js";
import TaskView from "../view/task.js";
import TaskEditView from "../view/task-edit.js";
import LoadMoreButtonView from "../view/load-button.js";
import {sortTaskUp, sortTaskDown} from "../utils/task.js";
import {render, RenderPosition, replace, remove} from "../utils/render.js";
import {SortType} from "../const.js";

const TASK_COUNT_PER_STEP = 8;

export default class Board {
  constructor(boardContainer) {
    this._boardContainer = boardContainer;
    this._renderedTaskCount = TASK_COUNT_PER_STEP;
    this._currentSortType = SortType.DEFAULT;

    this._boardComponent = new BoardView();
    this._sortComponent = new SortView();
    this._taskListComponent = new TaskListView();
    this._noTaskComponent = new NoTaskView();
    this._loadMoreButtonComponent = new LoadMoreButtonView();

    this._handleLoadMoreButtonClick = this._handleLoadMoreButtonClick.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);
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
    this._taskListComponent.getElement().innerHTML = ``;
    this._renderedTaskCount = TASK_COUNT_PER_STEP;
  }


  _renderTask(task) {
    const taskComponent = new TaskView(task);
    const taskEditComponent = new TaskEditView(task);

    const replaceCardToForm = () => {
      replace(taskEditComponent, taskComponent);
    };

    const replaceFormToCard = () => {
      replace(taskComponent, taskEditComponent);
    };

    const onEscKeyDown = (evt) => {
      if (evt.key === `Escape` || evt.key === `Esc`) {
        evt.preventDefault();
        replaceFormToCard();
        document.removeEventListener(`keydown`, onEscKeyDown);
      }
    };

    taskComponent.setEditClickHandler(() => {
      replaceCardToForm();
      document.addEventListener(`keydown`, onEscKeyDown);
    });

    taskEditComponent.setFormSubmitHandler(() => {
      replaceFormToCard();
      document.removeEventListener(`keydown`, onEscKeyDown);
    });

    render(this._taskListComponent, taskComponent, RenderPosition.BEFOREEND);
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
