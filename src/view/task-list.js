import AbstractView from "./abstract.js";

const createTaskListTemplate = () => {
  return `<div class="board__tasks"></div>`;
};

export default class TaskList extends AbstractView {
  _getTemplate() {
    return createTaskListTemplate();
  }
}
