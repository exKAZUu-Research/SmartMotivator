var color = Chart.helpers.color;

var barQuizAverageData = {
  labels: gon.labels_chart_quizzes_average,
  datasets: [
    {
      label: "Correct solved quizzes / active & new users",
      backgroundColor: color(window.chartColors.green)
        .alpha(0.5)
        .rgbString(),
      borderColor: window.chartColors.green,
      borderWidth: 1,
      data: gon.chart_quizzes_average_active_new
    },
    {
      label: "Correct solved quizzes / all users",
      backgroundColor: color(window.chartColors.purple)
        .alpha(0.5)
        .rgbString(),
      borderColor: window.chartColors.purple,
      borderWidth: 1,
      data: gon.chart_quizzes_average_all
    }
  ]
};

// CreateUserChart
function createChartQuizzesAverage() {
  var ctx = document.getElementById("ChartQuizzesAverage").getContext("2d");
  window.myBar = new Chart(ctx, {
    type: "bar",
    data: barQuizAverageData,
    options: {
      responsive: true,
      legend: {
        position: "top"
      },
      title: {
        display: true,
        text: "Correct Quizzes in average"
      },
      scales: {
        xAxes: [
          {
            stacked: false
          }
        ],
        yAxes: [
          {
            stacked: false
          }
        ]
      }
    }
  });
}

// load chart on startup
$(document).ready(function() {
  createChartQuizzesAverage();
});
