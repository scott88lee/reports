$("table").tablesort();

$("#rangestart").calendar({
  type: "date",
  endCalendar: $("#rangeend")
});
$("#rangeend").calendar({
  type: "date",
  startCalendar: $("#rangestart")
});

// Toggle the sidebar by clicking the menu button.
$("#menu").on("click", function() {
  $(".ui.sidebar").sidebar("toggle");
});
