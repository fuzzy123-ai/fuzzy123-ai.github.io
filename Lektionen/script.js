function zeigeLoesung() {
  var password = prompt("Bitte geben Sie das Passwort ein:");
  
  // Hier können Sie das Passwort anpassen
  var correctPassword = "0210";
  
  if (password === correctPassword) {
    var solution = document.querySelector(".loesung");
    var button = document.querySelector("#toggle-button");

    if (solution.style.display === "block") {
      solution.style.display = "none";
      button.innerHTML = "Lösung anzeigen";
    } else {
      solution.style.display = "block";
      button.innerHTML = "Lösung verbergen";
    }
  } else {
    alert("Falsches Passwort. Bitte versuchen Sie es erneut.");
  }
}
