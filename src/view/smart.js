import Abstract from "./abstract.js";

export default class Smart extends Abstract {
  constructor() {
    super();
  }

  // метод для обновления данных в свойстве _data, а потом
  // еще и вызова обновления шаблона
  updateData(update, justDataUpdating) {
    // если update нет - return
    if (!update) {
      return;
    }

    // если есть, перезаписываем this._data
    this._data = Object.assign(
        {},
        this._data, // берем данные которые были
        update // и добавляем к ним update
    );

    // чтобы обновлял только данные без перерисовки,
    // если условие true перерисовки не произойдет
    if (justDataUpdating) {
      return;
    }

    // updateData() вызывает updateElement()
    this.updateElement();
  }

  updateElement() {
    let prevElement = this.getElement();
    const parent = prevElement.parentElement;
    this.removeElement();

    const newElement = this.getElement();

    parent.replaceChild(newElement, prevElement);

    // удаляем ссылку на prevElement
    prevElement = null;

    // восстанавливаем обработчики после перерисовки карточки
    this.restoreHandlers();
  }

  restoreHandlers() {
    throw new Error(`Abstract method not implemented: restoreHandlers`);
  }
}
