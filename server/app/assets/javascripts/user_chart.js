var color = Chart.helpers.color;

var barUserChartData = {
  labels: gon.labels,
  datasets: [
    {
      label: "New Users",
      backgroundColor: color(window.chartColors.red)
        .alpha(0.5)
        .rgbString(),
      borderColor: window.chartColors.red,
      borderWidth: 1,
      data: gon.new_users_data
    },
    {
      label: "Active Users",
      backgroundColor: color(window.chartColors.blue)
        .alpha(0.5)
        .rgbString(),
      borderColor: window.chartColors.blue,
      borderWidth: 1,
      data: gon.active_users_data
    },
    {
      label: "Inactive Users",
      backgroundColor: color(window.chartColors.green)
        .alpha(0.5)
        .rgbString(),
      borderColor: window.chartColors.green,
      borderWidth: 1,
      data: gon.inactive_users_data
    },
    {
      label: "Not finished signed-up Users",
      backgroundColor: color(window.chartColors.grey)
        .alpha(0.5)
        .rgbString(),
      borderColor: window.chartColors.grey,
      borderWidth: 1,
      data: gon.not_finished_users_data
    }
  ]
};

// CreateUserChart
function createUserChart() {
  var ctx = document.getElementById("UserChart").getContext("2d");
  window.myBar = new Chart(ctx, {
    type: "bar",
    data: barUserChartData,
    options: {
      responsive: true,
      legend: {
        position: "top"
      },
      title: {
        display: true,
        text: "User Overview"
      },
      scales: {
        xAxes: [
          {
            stacked: true
          }
        ],
        yAxes: [
          {
            stacked: true
          }
        ]
      }
    }
  });
}

// use datepicker for date fields
$(document).on("focus", "[data-behaviour~='datepicker']", function(e) {
  $(this).datepicker({ format: "yyyy-mm-dd", autoclose: true });
});

// Replace in Change Dates button start_time and end_time
$("#start_time").change(function(o) {
  $("#send_data").attr("href", function(i, a) {
    return a.replace(/(start_time=)[^\&]+/, "$1" + o.target.value);
  });
});

$("#end_time").change(function(o) {
  $("#send_data").attr("href", function(i, a) {
    return a.replace(/(end_time=)[^\&]+/, "$1" + o.target.value);
  });
});

// load chart on startup
$(document).ready(function() {
  createUserChart();
});
