import TasksModel from "./model/tasks.js";

const Method = {
  GET: `GET`,
  PUT: `PUT`
};

const SuccessHTTPStatusRange = {
  MIN: 200,
  MAX: 299
};

export default class Api {
  constructor(endPoint, autorization) {
    this._endPoint = endPoint; // адрес сервера
    this._autorization = autorization; // данные для авторизации
  }

  // метод будет будет запрашивать на сервере
  // информацию о задачах
  getTasks() {
    // вызываем метод _load и передаем ему url - адрес ресурса
    return this._load({url: `tasks`})
    // полученный результат обрабатываем с пом. статич. метода Api.toJSON
    // который вызывает метод json у объекта ответа сервера
      .then(Api.toJSON)
      // каждую полученную задачу адаптируем для фронтенда
      .then((tasks) => tasks.map(TasksModel.adaptToClient));
  }


  updateTask(task) {
    // вызываем метод _load, но передаем ему немного другие данные
    return this._load({
      // чтобы обновить конкретную задачу нужно обратиться к url=tasks
      // и передать идентификатор задачи (task.id)
      url: `tasks/${task.id}`,
      // обновление задачи происходит с пом.
      // метода PUT - полная замена всех данных
      method: Method.PUT,
      // передаем тело запроса - ту задачу, кот. нужно обновить
      // задачу, получ. в параметре стерилизуем с пом.
      // метода stringify() и адаптируем для бэкенда
      body: JSON.stringify(TasksModel.adaptToServer(task)),
      // передаем заголовок, в кот. указываем что данные
      // находятся в формате aplication/json
      headers: new Headers({"Content-Type": `application/json`})
    })
    // получ. запрос обрабатываем с пом. статич. метода Api.toJSON
      .then(Api.toJSON)
      // и адаптируется для фронтенда
      .then(TasksModel.adaptToClient);
  }

  _load({
    url,
    method = Method.GET,
    body = null,
    headers = new Headers()
  }) {
    headers.append(`Authorization`, this._autorization);

    // вызываем fetch и передаем ему полный путь к желаемому ресурсу
    return fetch(
        // полный путь состоит из имени сервера(this._endPoint) и адреса ресурса (url)
        // например доступ к задачам будет по ресурсу tasks - это и будет url
        `${this._endPoint}/${url}`,
        {method, body, headers}
    )
    // fetch вернет промис - используем then, в кот. передаем колбэк
    .then(Api.checkStatus)
    .catch(Api.catchError);
  }

  // метод для проверки статуса ответа сервера
  static checkStatus(response) {

    // если код статуса меньше 200 и больше 299, то
    // бросить ошибку
    if (
      response.status < SuccessHTTPStatusRange.MIN ||
      response.status > SuccessHTTPStatusRange.MAX
    ) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    // иначе - вернуть запрос
    return response;
  }

  // метод который вызывает метод .json у объекта ответа сервера
  static toJSON(response) {
    return response.json();
  }

  // метод для обработки ошибок в .catch
  static catchError(err) {
    throw err;
  }
}
