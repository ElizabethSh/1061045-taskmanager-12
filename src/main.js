import {createSiteMenuTemplate} from "./view/site-menu.js";
import {createFilterTemplate} from "./view/filter.js";
import {createBoardTemplate} from "./view/board.js";
import {createSortingTemplate} from "./view/sorting.js";
import {createTaskTemplate} from "./view/task.js";
import {createTaskEditTemplate} from "./view/task-editing.js";
import {loadButtonTemplate} from "./view/load-button.js";
import {generateTask} from "./mock/task.js";
import {generateFilter} from "./mock/filter.js";

const MAX_CARDS_AMOUNT = 22;
const CARDS_AMOUNT_PER_STEP = 8;
const tasks = new Array(MAX_CARDS_AMOUNT).fill().map(generateTask);
const filters = generateFilter(tasks);

const main = document.querySelector(`.main`);
const siteHeader = main.querySelector(`.main__control`);

const render = (container, template, position) => {
  container.insertAdjacentHTML(position, template);
};

render(siteHeader, createSiteMenuTemplate(), `beforeend`);
render(main, createFilterTemplate(filters), `beforeend`);
render(main, createBoardTemplate(), `beforeend`);

const board = main.querySelector(`.board`);
render(board, createSortingTemplate(), `afterbegin`);

const tasksList = board.querySelector(`.board__tasks`);
render(tasksList, createTaskEditTemplate(tasks[0]), `beforeend`);
for (let i = 1; i < Math.min(tasks.length, CARDS_AMOUNT_PER_STEP); i++) {
  render(tasksList, createTaskTemplate(tasks[i]), `beforeend`);
}

if (tasks.length > CARDS_AMOUNT_PER_STEP) {
  let renderTaskCount = CARDS_AMOUNT_PER_STEP;

  render(board, loadButtonTemplate(), `beforeend`);

  const loadMoreButton = board.querySelector(`.load-more`);

  loadMoreButton.addEventListener(`click`, (evt) => {
    evt.preventDefault();
    tasks.slice(renderTaskCount, renderTaskCount + CARDS_AMOUNT_PER_STEP)
        .forEach((task) => render(tasksList, createTaskTemplate(task), `beforeend`));

    renderTaskCount += CARDS_AMOUNT_PER_STEP;

    if (renderTaskCount >= tasks.length) {
      loadMoreButton.remove();
    }
  });
}


