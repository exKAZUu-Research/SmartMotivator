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

// Open last used tab on page refresh
$(function() {
  $('a[data-toggle="tab"]').on("shown.bs.tab", function(e) {
    // save the latest tab; use cookies if you like 'em better:
    localStorage.setItem("lastTab", $(this).attr("href"));
  });
});

$(document).ready(function() {
  // go to the latest tab, if it exists:
  var lastTab = localStorage.getItem("lastTab");
  if (lastTab) {
    $(".tab").removeClass("active");
    $('[href="' + lastTab + '"]').tab("show");
  } else {
    $('[href="UserChartTab"]').tab("show");
  }
});
