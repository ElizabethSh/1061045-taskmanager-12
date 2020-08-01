import {createSiteMenuTemplate} from "./view/site-menu.js";
import {createFilterTemplate} from "./view/filter.js";
import {createBoardTemplate} from "./view/board.js";
import {createSortingTemplate} from "./view/sorting.js";
import {createTaskTemplate} from "./view/task.js";
import {createTaskEditTemplate} from "./view/task-editing.js";
import {loadButtonTemplate} from "./view/load-button.js";

const MAX_CARDS_AMOUNT = 3;

const main = document.querySelector(`.main`);
const siteHeader = main.querySelector(`.main__control`);

const render = (container, template, position) => {
  container.insertAdjacentHTML(position, template);
};

render(siteHeader, createSiteMenuTemplate(), `beforeend`);
render(main, createFilterTemplate(), `beforeend`);
render(main, createBoardTemplate(), `beforeend`);

const board = main.querySelector(`.board`);
render(board, createSortingTemplate(), `afterbegin`);
render(board, loadButtonTemplate(), `beforeend`);

const tasksList = board.querySelector(`.board__tasks`);
render(tasksList, createTaskEditTemplate(), `beforeend`);
for (let i = 0; i < MAX_CARDS_AMOUNT; i++) {
  render(tasksList, createTaskTemplate(), `beforeend`);
}


