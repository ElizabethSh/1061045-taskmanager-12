import flatpickr from "flatpickr";
import SmartView from "./smart.js";
import {getCurrentDate} from "../utils/task.js";
import Chart from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  countCompletedTaskInDayeRange,
  colorToHex,
  makeItemUniq,
  countTasksByColor,
  parceChartDate,
  countTaskinDateRange,
  getDatesInRange
} from "../utils/statistics.js";

// Функция для отрисовки графика по цветам
const renderColorsChart = (colorsCtx, tasks) => {
  const taskColors = tasks.map((task) => task.color); // результатом будет массив цветов всех задач, т.е. будут одинаковые цвета
  const uniqColors = makeItemUniq(taskColors); // уберет дубли цветов в массиве
  const taskByColorCounts = uniqColors.map((color) => countTasksByColor(tasks, color)); // посчитает кол-во задач соответствующих цвету
  const hexColors = uniqColors.map((color) => colorToHex[color]); // переведет color в HEX

  return new Chart(colorsCtx, {
    plugins: [ChartDataLabels],
    type: `pie`,
    data: {
      labels: uniqColors, // Сюда нужно передать названия уникальных цветов, они станут ярлыками
      datasets: [{
        data: taskByColorCounts, // Сюда нужно передать в том же порядке количество задач по каждому цвету
        backgroundColor: hexColors // Сюда нужно передать в том же порядке HEX каждого цвета
      }]
    },
    options: {
      plugins: {
        datalabels: {
          display: false
        }
      },
      tooltips: {
        callbacks: {
          label: (tooltipItem, data) => {
            const allData = data.datasets[tooltipItem.datasetIndex].data;
            const tooltipData = allData[tooltipItem.index];
            const total = allData.reduce((acc, it) => acc + parseFloat(it));
            const tooltipPercentage = Math.round((tooltipData / total) * 100);
            return `${tooltipData} TASKS — ${tooltipPercentage}%`;
          }
        },
        displayColors: false,
        backgroundColor: `#ffffff`,
        bodyFontColor: `#000000`,
        borderColor: `#000000`,
        borderWidth: 1,
        cornerRadius: 0,
        xPadding: 15,
        yPadding: 15
      },
      title: {
        display: true,
        text: `DONE BY: COLORS`,
        fontSize: 16,
        fontColor: `#000000`
      },
      legend: {
        position: `left`,
        labels: {
          boxWidth: 15,
          padding: 25,
          fontStyle: 500,
          fontColor: `#000000`,
          fontSize: 13
        }
      }
    }
  });

};

// Функция для отрисовки графика по датам
const renderDaysChart = (daysCtx, tasks, dateFrom, dateTo) => {
  const dates = getDatesInRange(dateFrom, dateTo);
  const parcedDates = dates.map(parceChartDate);
  const taskInDateRangeCounts = countTaskinDateRange(dates, tasks);

  return new Chart(daysCtx, {
    plugins: [ChartDataLabels],
    type: `line`,
    data: {
      labels: parcedDates, // Сюда нужно передать названия дней
      datasets: [{
        data: taskInDateRangeCounts, // Сюда нужно передать в том же порядке количество задач по каждому дню
        backgroundColor: `transparent`,
        borderColor: `#000000`,
        borderWidth: 1,
        lineTension: 0,
        pointRadius: 8,
        pointHoverRadius: 8,
        pointBackgroundColor: `#000000`
      }]
    },
    options: {
      plugins: {
        datalabels: {
          font: {
            size: 8
          },
          color: `#ffffff`
        }
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
            display: false
          },
          gridLines: {
            display: false,
            drawBorder: false
          }
        }],
        xAxes: [{
          ticks: {
            fontStyle: `bold`,
            fontColor: `#000000`
          },
          gridLines: {
            display: false,
            drawBorder: false
          }
        }]
      },
      legend: {
        display: false
      },
      layout: {
        padding: {
          top: 10
        }
      },
      tooltips: {
        enabled: false
      }
    }
  });
};

const createStatisticsTemplate = (data) => {
  const {tasks, dateFrom, dateTo} = data;
  const completedTaskCount = countCompletedTaskInDayeRange(tasks, dateFrom, dateTo);

  return `<section class="statistic container">
    <div class="statistic__line">
      <div class="statistic__period">
        <h2 class="statistic__period-title">Task Activity DIAGRAM</h2>
        <div class="statistic-input-wrap">
          <input class="statistic__period-input" type="text" placeholder="">
        </div>
        <p class="statistic__period-result">
          In total for the specified period
          <span class="statistic__task-found">${completedTaskCount}</span>
          tasks were fulfilled.
        </p>
      </div>
      <div class="statistic__line-graphic">
        <canvas class="statistic__days" width="550" height="150"></canvas>
      </div>
    </div>
    <div class="statistic__circle">
      <div class="statistic__colors-wrap">
        <canvas class="statistic__colors" width="400" height="300"></canvas>
      </div>
    </div>
  </section>`;
};

export default class Statistics extends SmartView {
  constructor(tasks) {
    super();

    // записываем 2 доп. ключа dateFrom и dateTo
    // по ТЗ статистика показывается за период предшествующей недели
    this._data = {
      tasks,
      dateFrom: (() => {
        const daysToFullWeek = 6;
        const date = getCurrentDate();

        date.setDate(date.getDate() - daysToFullWeek);
        return date;
      })(),
      dateTo: getCurrentDate()
    };

    this._colorsChart = null;
    this._daysChart = null;

    this._dateChangeHandler = this._dateChangeHandler.bind(this);

    this._setCharts(); // рисуем графики
    this._setDatepicker();
  }

  removeElement() {
    super.removeElement();

    if (this._colorsChart !== null || this._daysChart !== null) {
      this._colorsChart = null;
      this._daysChart = null;
    }

    if (this._datepicker) {
      this._datepicker.destroy();
      this._datepicker = null;
    }
  }

  restoreHandlers() {
    this._setCharts(); // рисуем графики
    this._setDatepicker();
  }

  _getTemplate() {
    return createStatisticsTemplate(this._data);
  }

  // изменение статистики от какой-то до какой-то даты
  _dateChangeHandler([dateFrom, dateTo]) {
    if (!dateFrom || !dateTo) {
      return;
    }

    this.updateData({dateFrom, dateTo});

  }

  _setDatepicker() {
    if (this._datepicker) {
      this._datepicker.destroy();
      this._datepicker = null;
    }

    this._datepicker = flatpickr(
        this.getElement().querySelector(`.statistic__period-input`),
        {
          mode: `range`,
          dateFormat: `j F`,
          defaultDate: [this._data.dateFrom, this._data.dateTo],
          onChange: this._dateChangeHandler
        }
    );
  }

  _setCharts() {
    // Нужно отрисовать два графика
    if (this._colorsCart !== null || this._daysChart !== null) {
      this._colorsCart = null;
      this._daysChart = null;
    }

    const {tasks, dateFrom, dateTo} = this._data;
    const colorsCtx = this.getElement().querySelector(`.statistic__colors`);
    const daysCtx = this.getElement().querySelector(`.statistic__days`);

    this._colorsCart = renderColorsChart(colorsCtx, tasks);
    this._daysChart = renderDaysChart(daysCtx, tasks, dateFrom, dateTo);
  }
}
