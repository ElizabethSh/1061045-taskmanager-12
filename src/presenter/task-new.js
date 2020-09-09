import TaskEditView from "../view/task-edit.js";
import {generateId} from "../mock/task.js";
import {render, remove, RenderPosition} from "../utils/render.js";
import {UserAction, UpdateType} from "../const.js";

export default class TaskNew {
  constructor(TaskListContainer, changeData) {
    this._taskListContainer = TaskListContainer;
    this._changeData = changeData;
    this._taskEditComponent = null;
    this._destroyCallback = null;

    this._escKeyDownHandler = this._escKeyDownHandler.bind(this);
    this._handleDeleteClick = this._handleDeleteClick.bind(this);
    this._handleFormSubmit = this._handleFormSubmit.bind(this);
  }

  init(callback) {
    this._destroyCallback = callback;

    if (this._taskEditComponent !== null) {
      return;
    }

    this._taskEditComponent = new TaskEditView();
    this._taskEditComponent.setDeleteClickHandler(this._handleDeleteClick);
    this._taskEditComponent.setFormSubmitHandler(this._handleFormSubmit);

    render(this._taskListContainer, this._taskEditComponent, RenderPosition.AFTERBEGIN);

    document.addEventListener(`keydown`, this._escKeyDownHandler);
  }

  destroy() {
    if (this._taskEditComponent === null) {
      return;
    }

    if (this._destroyCallback !== null) {
      this._destroyCallback();
    }

    remove(this._taskEditComponent);
    this._taskEditComponent = null;

    document.removeEventListener(`keydown`, this._escKeyDownHandler);
  }

  _handleFormSubmit(task) {
    this._changeData(
        UserAction.ADD_TASK,
        UpdateType.MINOR,
        Object.assign({id: generateId()}, task)
    );
    // после добавления данных о задаче в массив задач форма удаляется
    // а презентер доски перерендерит все карточки
    this.destroy();
  }

  _handleDeleteClick() {
    this.destroy();
  }

  _escKeyDownHandler(evt) {
    if (evt.key === `Escape` || evt.key === `Esc`) {
      evt.preventDefault();
      this.destroy(); // при выходе без сохранения удалить форму
    }
  }
}
