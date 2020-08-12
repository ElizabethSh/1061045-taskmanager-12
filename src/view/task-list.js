import {createElement} from "../utils.js";

const createTaskListTemplate = () => {
  return `<div class="board__tasks"></div>`;
};

export default class TaskList {
  constructor() {
    this._element = null;
  }

  _getTemplate() {
    return createTaskListTemplate();
  }

  getElement() {
    if (!this._element) {
      this._element = createElement(this._getTemplate());
    }
    return this._element;
  }

  removeElement() {
    this._element = null;
  }
}
