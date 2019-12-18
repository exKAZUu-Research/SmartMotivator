// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require bootstrap-sprockets
//= require bootstrap-datepicker
//= require chart_utils
//= require user_chart
//= require quiz_average_chart
//= require filter_utils
//= require_tree .

(function() {
  var options = {
    vAxes: {
      0: {
        title: "解答数",
        gridlines: { color: "transparent" }
      },
      1: {
        title: "正解率",
        gridlines: { color: "transparent" },
        format: "#%"
      }
    },
    series: {
      0: { targetAxisIndex: 0, type: "bars" },
      1: { targetAxisIndex: 1, type: "line" }
    }
  };
  $(document).on("ready turbolinks:load", function() {
    var elem = document.getElementById("chart_div");
    if (elem) {
      google.charts.load("current", { packages: ["corechart", "bar"] });
      google.charts.setOnLoadCallback(drawVisualization);
      function drawVisualization() {
        var histories = JSON.parse(elem.dataset.histories);
        var data = google.visualization.arrayToDataTable(histories);
        var chart = new google.visualization.ComboChart(elem);
        chart.draw(data, options);
      }
    }
  });
})();

$(document).on("click", "[data-generate-password]", function() {
  var query = $(this).attr("data-generate-password");
  var password = ("00000000" + Math.floor(Math.random() * 100000000)).slice(-8);
  $(query).val(password);
});

$(document).on("ready turbolinks:load", function() {
  $(".date.input-group").datepicker({ language: "ja", format: "yyyy-mm-dd" });
});

$(document).on("turbolinks:load", function() {
  if ($("#recommendation_checking_availability").length > 0) {
    $.ajax({
      url: "/admin/prediction_models/check_availability"
    }).done(function(available) {
      $("#recommendation_checking_availability").hide();
      if (available) {
        $("#recommendation_available").show();
        $("#recommendation_unavailable").hide();
      } else {
        $("#recommendation_available").hide();
        $("#recommendation_unavailable").show();
      }
    });
  }
});
