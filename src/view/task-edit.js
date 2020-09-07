import he from "he";
import SmartView from "./smart.js";
import {COLORS} from "../const.js";
import {formatTaskDueDate, isTaskRepeating} from "../utils/task.js";
import flatpickr from "flatpickr";

import "../../node_modules/flatpickr/dist/flatpickr.min.css";

const BLANK_TASK = {
  color: COLORS[0],
  description: ``,
  dueDate: null,
  repeating: {
    mo: false,
    tu: false,
    we: false,
    th: false,
    fr: false,
    sa: false,
    su: false
  },
  isArchive: false,
  isFavorite: false
};

const createTaskEditDateTemplate = (dueDate, isDueDate) => {
  return `<button class="card__date-deadline-toggle" type="button">
    date: <span class="card__date-status">${isDueDate ? `yes` : `no`}</span>
  </button>

  ${isDueDate ? `<fieldset class="card__date-deadline">
    <label class="card__input-deadline-wrap">
      <input
        class="card__date"
        type="text"
        placeholder=""
        name="date"
        value="${formatTaskDueDate(dueDate)}"
      />
    </label>
  </fieldset>` : ``}
  `;
};

const createTaskEditRepeatingTemplate = (repeating, isRepeating) => {
  return `<button class="card__repeat-toggle" type="button">
      repeat:<span class="card__repeat-status">${isRepeating ? `yes` : `no`}</span>
    </button>

    ${isRepeating ? `<fieldset class="card__repeat-days">
      <div class="card__repeat-days-inner">
        ${Object.entries(repeating).map(([day, repeat]) => `<input
          class="visually-hidden card__repeat-day-input"
          type="checkbox"
          id="repeat-${day}"
          name="repeat"
          value=${day}
          ${repeat ? `checked` : ``}
        />
        <label class="card__repeat-day" for="repeat-${day}">${day}</label
        >`).join(``)}
      </div>
    </fieldset>` : ``}`;
};

const createTaskEditColorsTemplate = (currentColor) => {

  return COLORS.map((color) => `<input
      type="radio"
      id="color-${color}"
      class="card__color-input card__color-input--${color} visually-hidden"
      name="color"
      value="${color}"
      ${currentColor === color ? `checked` : ``}
    />
    <label
      for="color-${color}"
      class="card__color card__color--${color}"
      >${color}</label
    >`).join(``);
};

const createTaskEditTemplate = (data) => {

  const {color, description, dueDate, repeating, isDueDate, isRepeating} = data;

  // получает шаблон в зависимости от ситуации
  const dateTemplate = createTaskEditDateTemplate(dueDate, isDueDate);

  // если задача повторяемая, добавляет класс card--repeat
  const repeatingClassName = isRepeating
    ? `card--repeat` : ``;

  const repeatingTemplate = createTaskEditRepeatingTemplate(repeating, isRepeating);
  const colorsTemplate = createTaskEditColorsTemplate(color);

  // блокировать кнопку или нет:
  // если DATE: Yes, но дата не выбрана
  // ИЛИ
  // если REPEAT:YES, но дни повторений не выбраны
  const isSubmitDisabled = (isDueDate && dueDate === null) || (isRepeating && !isTaskRepeating(repeating));

  return (
    `<article class="card card--edit card--${color} ${repeatingClassName}">
      <form class="card__form" method="get">
        <div class="card__inner">
          <div class="card__color-bar">
            <svg class="card__color-bar-wave" width="100%" height="10">
              <use xlink:href="#wave"></use>
            </svg>
          </div>

          <div class="card__textarea-wrap">
            <label>
              <textarea
                class="card__text"
                placeholder="Start typing your text here..."
                name="text"
              >${he.encode(description)}</textarea>
            </label>
          </div>

          <div class="card__settings">
            <div class="card__details">
              <div class="card__dates">
                ${dateTemplate}
                ${repeatingTemplate}
              </div>
            </div>

            <div class="card__colors-inner">
              <h3 class="card__colors-title">Color</h3>
              <div class="card__colors-wrap">
                ${colorsTemplate}
              </div>
            </div>
          </div>

          <div class="card__status-btns">
            <button class="card__save" type="submit" ${isSubmitDisabled ? `disabled` : ``}>save</button>
            <button class="card__delete" type="button">delete</button>
          </div>
        </div>
      </form>
    </article>`
  );
};

export default class TaskEdit extends SmartView {
  constructor(task = BLANK_TASK) {
    super();
    this._data = TaskEdit.parseTaskToData(task);
    this._datepicker = null;

    this._formSubmitHandler = this._formSubmitHandler.bind(this);
    this._formDeleteClickHandler = this._formDeleteClickHandler.bind(this);
    this._descriptionInputHahdler = this._descriptionInputHahdler.bind(this);
    this._dueDateToggleHandler = this._dueDateToggleHandler.bind(this);
    this._dueDateChangeHandler = this._dueDateChangeHandler.bind(this);
    this._repeatingToggleHandler = this._repeatingToggleHandler.bind(this);
    this._colorChangeHandler = this._colorChangeHandler.bind(this);
    this._repeatingChangeHandler = this._repeatingChangeHandler.bind(this);

    // установка обработчиков при создании карточки (первый раз)
    this._setInnerHandlers();
    this._setDatepicker();
  }

  removeElement() {
    super.removeElement();

    if (this._datepicker) {
      this._datepicker.destroy();
      this._datepicker = null;
    }
  }

  reset(task) {
    this.updateData(
        TaskEdit.parseTaskToData(task)
    );
  }

  // метод восстановления всех обработчиков
  restoreHandlers() {
    this._setInnerHandlers();
    this.setFormSubmitHandler(this._callback.formSubmit);
    this.setDeleteClickHandler(this._callback.deleteClick);
    this._setDatepicker();
  }

  _setDatepicker() {
    // flatpicker всегда нужно уничтожать если вдруг он не используется
    // например когда в форме выбрано DATE:No (дата не выбрана)
    if (this._datepicker) {
      // если flatpicker существует, нужно его удалить
      this._datepicker.destroy(); // метод библиотеки flatpicker
      this._datepicker = null; // обнуляем ссылку
    }

    // flatpickr есть смысл инициализировать ТОЛЬКО в случае,
    // если поле выбора даты доступно для заполнения DATE:Yes
    if (this._data.dueDate) {
      this._datepicker = flatpickr(
          this.getElement().querySelector(`.card__date`),
          {
            dateFormat: `j F`,
            defaultDate: this._data.dueDate,
            onChange: this._dueDateChangeHandler // На событие flatpickr передаём наш колбэк
          }
      );
    }
  }

  _getTemplate() {
    return createTaskEditTemplate(this._data);
  }

  // метод установки внутренних обработчиков, только то
  // что касается формы редактирования
  _setInnerHandlers() {
    // обработчик на кнопку даты
    this.getElement()
      .querySelector(`.card__date-deadline-toggle`)
      .addEventListener(`click`, this._dueDateToggleHandler);

    // обработчик на кнопку повторяемости
    this.getElement()
      .querySelector(`.card__repeat-toggle`)
      .addEventListener(`click`, this._repeatingToggleHandler);

    this.getElement()
      .querySelector(`.card__text`)
      .addEventListener(`input`, this._descriptionInputHahdler);

    this.getElement()
      .querySelector(`.card__colors-wrap`)
      .addEventListener(`change`, this._colorChangeHandler);

    // навешивать обработчики только если выбрана повторяемость задачи
    // т.к. если дней повторений в DOM нет, навешивать обработчики
    // не на что, будет ошибка
    if (this._data.isRepeating) {
      this.getElement()
        .querySelector(`.card__repeat-days-inner`)
        .addEventListener(`change`, this._repeatingChangeHandler);
    }
  }

  _colorChangeHandler(evt) {
    evt.preventDefault();
    this.updateData({
      color: evt.target.value
    });
  }

  _dueDateChangeHandler([userDate]) {
    userDate.setHours(23, 59, 59, 999);

    this.updateData({
      dueDate: userDate
    });
  }

  _repeatingChangeHandler(evt) {
    evt.preventDefault();
    this.updateData({
      repeating: Object.assign(
          {},
          this._data.repeating,
          {[evt.target.value]: evt.target.checked}
      )
    });
  }

  _dueDateToggleHandler(evt) {
    evt.preventDefault();
    this.updateData({
      isDueDate: !this._data.isDueDate,

      // если выбор даты нужно показать,
      // то есть когда "!this._data.isDueDate === true",
      // тогда isRepeating должно быть строго false,
      // что достигается логическим оператором &&
      isRepeating: !this._data.isDueDate && false
    });
  }

  _repeatingToggleHandler(evt) {
    evt.preventDefault();
    this.updateData({
      isRepeating: !this._data.isRepeating,

      // если выбор повторяемости нужно показать,
      // то есть когда "!this._data.isRepeating === true",
      // тогда isDueDate должно быть строго false,
      // что достигается логическим оператором &&
      isDueDate: !this._data.isRepeating && false
    });
  }

  _descriptionInputHahdler(evt) {
    evt.preventDefault();
    this.updateData({
      description: evt.target.value
    }, true);
  }

  _formSubmitHandler(evt) {
    evt.preventDefault();

    // передаем данные в колбэк, т.к. для формы колбеком будет
    // выступать метод по обновлению
    this._callback.formSubmit(TaskEdit.parseDataToTask(this._data));
  }

  _formDeleteClickHandler(evt) {
    evt.preventDefault();
    this._callback.deleteClick(TaskEdit.parseDataToTask(this._data));
  }

  setFormSubmitHandler(callback) {
    this._callback.formSubmit = callback;
    this.getElement().addEventListener(`submit`, this._formSubmitHandler);
  }

  setDeleteClickHandler(callback) {
    this._callback.deleteClick = callback;
    this.getElement()
        .querySelector(`.card__delete`)
        .addEventListener(`click`, this._formDeleteClickHandler);
  }

  // метод берет объект с задачей из мокк и приписывает к нему
  // 2 флага: isDueDate и isRepeating
  // в этих флагах с момента init TaskEditComponent будет
  // храниться признак показывать дату или нет
  static parseTaskToData(task) {
    return Object.assign(
        {},
        task,
        {
          isDueDate: task.dueDate !== null,
          isRepeating: isTaskRepeating(task.repeating)
        }
    );
  }

  static parseDataToTask(data) {
    data = Object.assign({}, data);

    // если isDueDate не установлена, установи равной null
    if (!data.isDueDate) {
      data.dueDate = null;
    }

    // если repeating(повторяемость задачи) не установлен, установи все дни false
    if (!data.isRepeating) {
      data.repeating = {
        mo: false,
        tu: false,
        we: false,
        th: false,
        fr: false,
        sa: false,
        su: false
      };
    }

    delete data.isDueDate;
    delete data.isRepeating;

    return data;
  }
}
