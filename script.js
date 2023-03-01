
  //Code für den Toggle-Switch

  const toggleSwitch = document.querySelector('#switch');
  var view01 = document.querySelector('#view01');
  var view02 = document.querySelector('#view02');
  
  toggleSwitch.addEventListener('change', () => {
    if (toggleSwitch.checked) {
      view01.style.display = 'none';
      view02.style.display = 'block';
    } else {
      view01.style.display = 'block';
      view02.style.display = 'none';
    }
  });
  
  
  
  //OVERLAY
  function openOverlay(index) {
              document.getElementById(index).style.display = "block";
          }
  
  function closeOverlay(index) {
              document.getElementById(index).style.display = "none";
          }
  
  // OVERLAYS SCHLIEßEN
  const overlay = document.querySelector('.overlay');
  const overlayContent = document.querySelector('.overlay-content');
  const overlayBackground = overlay.querySelector(':scope > div:first-child');
  function showOverlay() {
    // Set the display attribute of the overlay to block
    overlay.style.display = 'block';
    // Show the overlay content
  }
  // Add an event listener for clicks on the background element
  overlay.addEventListener('click', (event) => {
    // Check if the clicked element is the background element itself
    if (event.target == overlay) {
      overlay.style.display = 'none';
    }
  });
  