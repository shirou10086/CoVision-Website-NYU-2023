document.addEventListener("DOMContentLoaded", function() {
  var leftPlaceholder = document.getElementById("leftCanvasPlaceholder");
  var rightPlaceholder = document.getElementById("rightCanvasPlaceholder");
  var leftCanvas = document.getElementById("leftCanvas");
  var rightCanvas = document.getElementById("rightCanvas");
  var leftCtx = leftCanvas.getContext("2d");
  var rightCtx = rightCanvas.getContext("2d");

  var subfolderSelect = document.getElementById("subfolderSelect");
  var floorSelect = document.getElementById("floorSelect");
  var sceneName = "";
  var floor = 0;
  var displayedPairs = [];
  var leftImageIndex, rightImageIndex;

  subfolderList.forEach(function(subfolder) {
    var option = document.createElement("option");
    option.value = subfolder;
    option.text = subfolder;
    subfolderSelect.appendChild(option);
  });

  function getRandomIndex(maxIndex) {
    return Math.floor(Math.random() * (maxIndex + 1));
  }

  function isPairDisplayed(leftIndex, rightIndex) {
    for (var i = 0; i < displayedPairs.length; i++) {
      var pair = displayedPairs[i];
      if (
        (pair.left === leftIndex && pair.right === rightIndex) ||
        (pair.left === rightIndex && pair.right === leftIndex)
      ) {
        return true;
      }
    }
    return false;
  }

  function updateCanvas() {
    leftCanvas.style.display = "none";
    rightCanvas.style.display = "none";
    leftPlaceholder.style.display = "block";
    rightPlaceholder.style.display = "block";

    var selectedOption = subfolderSelect.options[subfolderSelect.selectedIndex];
    var folderName = selectedOption.text;
    var floorOptions = floormap[folderName];
    var saved_grid_pose = pointmap[sceneName + ":" + floor.toString()].saved_grid_pose;

    var maxIndex = saved_grid_pose.length - 1;

    do {
      leftImageIndex = getRandomIndex(maxIndex);
      rightImageIndex = getRandomIndex(maxIndex);
    } while (
      leftImageIndex === rightImageIndex ||
      isPairDisplayed(leftImageIndex, rightImageIndex)
    );

    displayedPairs.push({ left: leftImageIndex, right: rightImageIndex });
    displayedPairs.push({ right: rightImageIndex, left: leftImageIndex });

    var leftImage = new Image();
    var rightImage = new Image();

    leftImage.onload = function() {
      leftPlaceholder.style.display = "none";
      leftCanvas.style.display = "block";
      leftCtx.clearRect(0, 0, leftCanvas.width, leftCanvas.height);
      leftCtx.drawImage(leftImage, 0, 0, leftCanvas.width, leftCanvas.height);
    };

    rightImage.onload = function() {
      rightPlaceholder.style.display = "none";
      rightCanvas.style.display = "block";
      rightCtx.clearRect(0, 0, rightCanvas.width, rightCanvas.height);
      rightCtx.drawImage(rightImage, 0, 0, rightCanvas.width, rightCanvas.height);
    };

    leftImage.src = "/static/dataset/" + folderName + "/" + floor.toString() + "/saved_obs/best_color_" + leftImageIndex + ".png";
    rightImage.src = "/static/dataset/" + folderName + "/" + floor.toString() + "/saved_obs/best_color_" + rightImageIndex + ".png";
  }

  function populateFloorOptions(scene) {
    var selectedOption = subfolderSelect.options[subfolderSelect.selectedIndex];
    var folderName = selectedOption.text;
    var floorOptions = floormap[folderName];
    floorSelect.innerHTML = '';

    for (var i = 0; i <= floorOptions; i++) {
      var option = document.createElement("option");
      option.value = i;
      option.text = i;
      floorSelect.appendChild(option);
    }
  }

  subfolderSelect.addEventListener("change", function() {
    floor = 0;
    displayedPairs = [];
    var selectedOption = subfolderSelect.options[subfolderSelect.selectedIndex];
    sceneName = selectedOption.text;
    populateFloorOptions(sceneName);
    updateCanvas();
  });

  floorSelect.addEventListener("change", function() {
    displayedPairs = [];
    floor = parseInt(floorSelect.value);
    updateCanvas();
  });

  updateCanvas();
});
