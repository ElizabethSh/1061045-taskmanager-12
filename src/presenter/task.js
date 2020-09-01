import TaskView from "../view/task.js";
import TaskEditView from "../view/task-edit.js";
import {render, RenderPosition, replace, remove} from "../utils/render.js";
import {Mode, UserAction, UpdateType} from "../const.js";


export default class Task {
  constructor(taskListContainer, changeData, changeMode) {
    this._taskListContainer = taskListContainer;
    this._changeData = changeData;
    this._changeMode = changeMode;

    this._taskComponent = null;
    this._taskEditComponent = null;
    this._mode = Mode.DEFAULT;

    this._escKeyDownHandler = this._escKeyDownHandler.bind(this);
    this._handleEditClick = this._handleEditClick.bind(this);
    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleFavoriteClick = this._handleFavoriteClick.bind(this);
    this._handleArchiveClick = this._handleArchiveClick.bind(this);
  }

  init(task) {
    this._task = task;

    // запоминаем предыдущие версии TaskComponent и TaskEditComponent,
    // если предыдущих версий не было запишется null
    const prevTaskComponent = this._taskComponent;
    const prevTaskEditComponent = this._taskEditComponent;

    this._taskComponent = new TaskView(task);
    this._taskEditComponent = new TaskEditView(task);

    this._taskComponent.setEditClickHandler(this._handleEditClick);
    this._taskEditComponent.setFormSubmitHandler(this._handleFormSubmit);
    this._taskComponent.setFavoriteClickHandler(this._handleFavoriteClick);
    this._taskComponent.setArchiveClickHandler(this._handleArchiveClick);

    // если один из прерыдущих компонентов равен null (первый вызов init),
    // отрисовываем taskComponent
    if (prevTaskComponent === null || prevTaskEditComponent === null) {
      render(this._taskListContainer, this._taskComponent, RenderPosition.BEFOREEND);
      return;
    }

    // проверка, есть ли в DOM то, что мы пытаемся заменить (чтобы не пытаться
    // заменить то, что не было отрисовано)
    if (this._mode === Mode.DEFAULT) {
      replace(this._taskComponent, prevTaskComponent);
    }

    if (this._mode === Mode.EDITING) {
      replace(this._taskEditComponent, prevTaskEditComponent);
    }

    // удаляем более не нужные переменные
    remove(prevTaskComponent);
    remove(prevTaskEditComponent);
  }

  resetView() {
    if (this._mode !== Mode.DEFAULT) {
      this._replaceFormToCard();
    }
  }

  // метод для удаления карточки и формы редактирования чтобы
  // очищать список
  destroy() {
    remove(this._taskComponent);
    remove(this._taskEditComponent);
  }

  _replaceCardToForm() {
    replace(this._taskEditComponent, this._taskComponent);
    document.addEventListener(`keydown`, this._escKeyDownHandler);
    this._changeMode();
    this._mode = Mode.EDITING;
  }

  _replaceFormToCard() {
    replace(this._taskComponent, this._taskEditComponent);
    document.removeEventListener(`keydown`, this._escKeyDownHandler);
    this._mode = Mode.DEFAULT;
  }

  _escKeyDownHandler(evt) {
    if (evt.key === `Escape` || evt.key === `Esc`) {
      evt.preventDefault();
      this._taskEditComponent.reset(this._task);
      this._replaceFormToCard();
    }
  }

  _handleEditClick() {
    this._replaceCardToForm();
  }

  _handleFavoriteClick() {
    // 3. отдать обратно в _changeData
    this._changeData(
        UserAction.UPDATE_TASK,
        UpdateType.MINOR,
        Object.assign(
            {},
            // 1. взять задачу
            this._task, {
              // 2. поменять ей одно свойство favorite
              isFavorite: !this._task.isFavorite
            }
        )
    );
  }

  _handleArchiveClick() {
    // 3. отдать обратно в _changeData
    this._changeData(
        UserAction.UPDATE_TASK,
        UpdateType.MINOR,
        Object.assign(
            {},
            // 1. взять задачу
            this._task, {
              // 2. поменять ей одно свойство Archive
              isArchive: !this._task.isArchive
            }
        )
    );
  }

  _handleFormSubmit(task) {
    this._changeData(
        UserAction.UPDATE_TASK,
        UpdateType.MINOR,
        task);
    this._replaceFormToCard();
  }
}
