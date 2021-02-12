let params = new URL(document.location).searchParams;
var popup_status = false;
window.addEventListener("load", function() {
  /*Start - If website Loaded*/
  if (document.getElementById("popup") === null) {
    /*Start - If variable popup equals null*/
    document.getElementById("assets").innerHTML +=
      '<div id="popup"></div>'; /*Add popup notification box*/
  }
  if (params.get("notification") == null) {
    notification("Page Loaded!");
  } else {
    notification(params.get("notification"));
  }
  document.getElementById("popup").style.backgroundColor = "#333";
});
function notification(text, time) {
  if (time == null) {
    time = 5000;
  }
  if (popup_status !== true) {
    popup_status = true;
    var popup = document.getElementById("popup");
    popup.className = "show";
    popup.innerHTML = text;
    setTimeout(function() {
      popup.className = popup.className.replace("show", "");
      popup_status = false;
    }, time);
  }
}
