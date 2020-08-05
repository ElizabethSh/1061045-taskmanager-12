import {isTaskExpired, humanizeTaskDueDate, isTaskRepeating} from "../utils.js";

export const createTaskTemplate = (task) => {
  const {color, description, dueDate, repeating, isFavorite, isArchive} = task;

  // если есть дата дедлайна, приводит ее в человеческий вид
  const date = (dueDate !== null)
    ? humanizeTaskDueDate(dueDate) : ``;

  // если есть дедлайн, добавляет соответствующий класс
  const deadlineClassName = isTaskExpired(dueDate) ? `card--deadline` : ``;

  // если задача повторяемая, добавляет соответствующий класс
  const repeatClassName = isTaskRepeating(repeating) ? `card--repeat` : ``;

  // если задача в архиве, добавляет disabled на кнопку
  const arciveClassName = isArchive
    ? `card__btn--archive card__btn--disabled` : `card__btn--archive`;

  // если задача в избранном, добавляет disabled на кнопку
  const favoritClassName = isFavorite
    ? `card__btn--favorites card__btn--disabled` : `card__btn--favorites`;

  return (
    `<article class="card card--${color} ${deadlineClassName} ${repeatClassName}">
      <div class="card__form">
        <div class="card__inner">
          <div class="card__control">
            <button type="button" class="card__btn card__btn--edit">
              edit
            </button>
            <button type="button" class="card__btn ${arciveClassName}">
              archive
            </button>
            <button
              type="button"
              class="card__btn ${favoritClassName}"
            >
              favorites
            </button>
          </div>

          <div class="card__color-bar">
            <svg class="card__color-bar-wave" width="100%" height="10">
              <use xlink:href="#wave"></use>
            </svg>
          </div>

          <div class="card__textarea-wrap">
            <p class="card__text">${description}</p>
          </div>

          <div class="card__settings">
            <div class="card__details">
              <div class="card__dates">
                <div class="card__date-deadline">
                  <p class="card__input-deadline-wrap">
                    <span class="card__date">${date}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>`
  );
};
