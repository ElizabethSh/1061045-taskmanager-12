import SiteMenuView from "./view/site-menu.js";
import FilterView from "./view/filter.js";
import BoardView from "./view/board.js";
import SortView from "./view/sort.js";
import TaskListView from "./view/task-list.js";
import LoadButtonView from "./view/load-button.js";
import TaskView from "./view/task.js";
import TaskEditView from "./view/task-edit.js";
import {generateTask} from "./mock/task.js";
import {generateFilter} from "./mock/filter.js";
import {render, RenderPosition} from "./utils.js";

const MAX_CARDS_AMOUNT = 22;
const CARDS_AMOUNT_PER_STEP = 8;
const tasks = new Array(MAX_CARDS_AMOUNT).fill().map(generateTask);
const filters = generateFilter(tasks);

const main = document.querySelector(`.main`);
const siteHeader = main.querySelector(`.main__control`);

const renderTask = (taskList, task) => {
  const taskComponent = new TaskView(task);
  const taskEditComponent = new TaskEditView(task);

  const renderCardToForm = () => {
    taskList.replaceChild(taskEditComponent.getElement(), taskComponent.getElement());
  };

  const renderFormToCard = () => {
    taskList.replaceChild(taskComponent.getElement(), taskEditComponent.getElement());
  };

  taskComponent.getElement().querySelector(`.card__btn--edit`).addEventListener(`click`, () => {
    renderCardToForm();
  });

  taskEditComponent.getElement().querySelector(`form`).addEventListener(`submit`, (evt) => {
    evt.preventDefault();
    renderFormToCard();
  });

  render(taskList, taskComponent.getElement(), RenderPosition.BEFOREEND);
};

render(siteHeader, new SiteMenuView().getElement(), RenderPosition.BEFOREEND);
render(main, new FilterView(filters).getElement(), RenderPosition.BEFOREEND);

const boardComponent = new BoardView();
render(main, boardComponent.getElement(), RenderPosition.BEFOREEND);
render(boardComponent.getElement(), new SortView().getElement(), RenderPosition.AFTERBEGIN);

const tasksListComponent = new TaskListView();
render(boardComponent.getElement(), tasksListComponent.getElement(), RenderPosition.BEFOREEND);

for (let i = 0; i < Math.min(tasks.length, CARDS_AMOUNT_PER_STEP); i++) {
  renderTask(tasksListComponent.getElement(), tasks[i]);
}

if (tasks.length > CARDS_AMOUNT_PER_STEP) {
  let renderTaskCount = CARDS_AMOUNT_PER_STEP;

  const loadMoreButtonComponent = new LoadButtonView();

  render(boardComponent.getElement(), loadMoreButtonComponent.getElement(), RenderPosition.BEFOREEND);

  loadMoreButtonComponent.getElement().addEventListener(`click`, (evt) => {
    evt.preventDefault();
    tasks.slice(renderTaskCount, renderTaskCount + CARDS_AMOUNT_PER_STEP)
        .forEach((task) => renderTask(tasksListComponent.getElement(), task));

    renderTaskCount += CARDS_AMOUNT_PER_STEP;

    if (renderTaskCount >= tasks.length) {
      loadMoreButtonComponent.getElement().remove();
      loadMoreButtonComponent.removeElement();
    }
  });
}


