function zeigeLoesung() {
    var solution = document.querySelector(".loesung");
    var button = document.querySelector("#toggle-button");
    
    if (solution.style.display === "block") {
      solution.style.display = "none";
      button.innerHTML = "Lösung anzeigen";
    } else {
      solution.style.display = "block";
      button.innerHTML = "Lösung verbergen";
    }
  }
  