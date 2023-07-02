document.addEventListener("DOMContentLoaded", function() {
  var leftCanvas = document.getElementById("leftCanvas");
  var rightCanvas = document.getElementById("rightCanvas");
  var leftCtx = leftCanvas.getContext("2d");
  var rightCtx = rightCanvas.getContext("2d");

  var subfolderSelect = document.getElementById("subfolderSelect");
  var floorSelect = document.getElementById("floorSelect");
  var sceneName = "";
  var floor = 0;
  var displayedPairs = []; // 存储已经显示过的图像对
  var leftImageIndex, rightImageIndex; // 修正点

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
    var similarButton = document.getElementById("similarButton");
    var similarButtonClone = similarButton.cloneNode(true);
    similarButton.parentNode.replaceChild(similarButtonClone, similarButton);

    var notSimilarButton = document.getElementById("notSimilarButton");
    var notSimilarButtonClone = notSimilarButton.cloneNode(true);
    notSimilarButton.parentNode.replaceChild(notSimilarButtonClone, notSimilarButton);

    var selectedOption = subfolderSelect.options[subfolderSelect.selectedIndex];
    var folderName = selectedOption.text;
    var floorOptions = floormap[folderName];
    var saved_grid_pose = pointmap[sceneName + ":" + floor.toString()].saved_grid_pose;

    var maxIndex = saved_grid_pose.length - 1; // 最大节点索引为节点位置列表的长度减1

    do {
      leftImageIndex = getRandomIndex(maxIndex);
      rightImageIndex = getRandomIndex(maxIndex);
    } while (
      leftImageIndex === rightImageIndex || // 左右图像索引相同
      isPairDisplayed(leftImageIndex, rightImageIndex) // 图像对已经显示过
    );

    displayedPairs.push({ left: leftImageIndex, right: rightImageIndex }); // 存储已显示的图像对
    displayedPairs.push({ right: rightImageIndex, left: leftImageIndex });

    var leftImage = new Image();
    var rightImage = new Image();

    // 显示白色背景
    leftCtx.clearRect(0, 0, leftCanvas.width, leftCanvas.height); // 清除画布内容
    leftCtx.fillStyle = "#ffffff"; // 设置填充色为白色
    leftCtx.fillRect(0, 0, leftCanvas.width, leftCanvas.height); // 填充整个画布

    rightCtx.clearRect(0, 0, rightCanvas.width, rightCanvas.height); // 清除画布内容
    rightCtx.fillStyle = "#ffffff"; // 设置填充色为白色
    rightCtx.fillRect(0, 0, rightCanvas.width, rightCanvas.height); // 填充整个画布

    // 加载新图片
    leftImage.onload = function() {
      leftCtx.clearRect(0, 0, leftCanvas.width, leftCanvas.height); // 清除画布内容
      leftCtx.drawImage(leftImage, 0, 0, leftCanvas.width, leftCanvas.height);
    };

    rightImage.onload = function() {
      rightCtx.clearRect(0, 0, rightCanvas.width, rightCanvas.height); // 清除画布内容
      rightCtx.drawImage(rightImage, 0, 0, rightCanvas.width, rightCanvas.height);
    };

    setTimeout(function() {
      leftImage.src = "/static/dataset/" + folderName + "/" + floor.toString() + "/saved_obs/best_color_" + leftImageIndex + ".png";
      rightImage.src = "/static/dataset/" + folderName + "/" + floor.toString() + "/saved_obs/best_color_" + rightImageIndex + ".png";
    }, 10); // 延迟 0.3 秒加载新图片

    // 获取对应节点的位置信息
    var leftImagePosition = saved_grid_pose[leftImageIndex];
    var rightImagePosition = saved_grid_pose[rightImageIndex];

    console.log("Left Image Position:", leftImagePosition);
    console.log("Right Image Position:", rightImagePosition);

    function updateHumanmap(humanmap) {
      fetch('/update_humanmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(humanmap)
      })
      .then(response => {
        if (response.ok) {
          console.log('Humanmap updated successfully');
        } else {
          console.log('Failed to update humanmap');
        }
      })
      .catch(error => {
        console.error('Error updating humanmap:', error);
      });
    }

    // Similar button click event listener
    var similarButton = document.getElementById("similarButton");
    similarButton.addEventListener("click", function() {
      // Check if the pair already exists in humanmap
      var existingPairIndex = humanmap.findIndex(function(pair) {
        return (
          pair[0] === sceneName &&
          pair[1] === floor &&
          pair[2] === leftImageIndex &&
          pair[3] === rightImageIndex
        );
      });

      if (existingPairIndex !== -1) {
        // Update the similarity value at the existing pair's position
        humanmap[existingPairIndex][4] += 1;
        updateHumanmap(humanmap);
      } else {
        // Add values to the humanmap array
        humanmap.push([sceneName, floor, leftImageIndex, rightImageIndex, 1, 0]);
        updateHumanmap(humanmap);
      }

      // Output the updated humanmap
      console.log("Updated humanmap:", humanmap);

      updateCanvas(); // Load the next pair
    });

    // Not similar button click event listener
    var notSimilarButton = document.getElementById("notSimilarButton");
    notSimilarButton.addEventListener("click", function() {
      // Check if the pair already exists in humanmap
      var existingPairIndex = humanmap.findIndex(function(pair) {
        return (
          pair[0] === sceneName &&
          pair[1] === floor &&
          pair[2] === leftImageIndex &&
          pair[3] === rightImageIndex
        );
      });

      if (existingPairIndex !== -1) {
        // Update the not similarity value at the existing pair's position
        humanmap[existingPairIndex][5] += 1;
        updateHumanmap(humanmap);
      } else {
        // Add values to the humanmap array
        humanmap.push([sceneName, floor, leftImageIndex, rightImageIndex, 0, 1]);
        updateHumanmap(humanmap);
      }

      // Output the updated humanmap
      console.log("Updated humanmap:", humanmap);

      updateCanvas(); // Load the next pair
    });
  }
  function randomlySelectSceneAndFloor() {
    var sceneIndex = getRandomIndex(subfolderList.length - 1);
    var floorOptions = floormap[subfolderList[sceneIndex]];
    var floorIndex = getRandomIndex(floorOptions);
    subfolderSelect.selectedIndex = sceneIndex;
    floorSelect.selectedIndex = floorIndex;
  }
  function populateFloorOptions(scene) {
    var selectedOption = subfolderSelect.options[subfolderSelect.selectedIndex];
    var folderName = selectedOption.text;
    var floorOptions = floormap[folderName];
    floorSelect.innerHTML = ''; // 清空楼层选项

    for (var i = 0; i <= floorOptions; i++) {
      var option = document.createElement("option");
      option.value = i;
      option.text = i;
      floorSelect.appendChild(option);
    }
  }

  subfolderSelect.addEventListener("change", function() {
    floor = 0;
    displayedPairs = []; // 清空已显示的图像对
    var selectedOption = subfolderSelect.options[subfolderSelect.selectedIndex];
    sceneName = selectedOption.text;
    populateFloorOptions(sceneName);
    console.log("Selected Text:", sceneName);
    updateCanvas();
  });

  floorSelect.addEventListener("change", function() {
    displayedPairs=[]
    floor = parseInt(floorSelect.value);
    updateCanvas();
  });

  var randomButton = document.getElementById("randomButton");
  randomButton.addEventListener("click", function() {
    var saved_grid_pose = pointmap[sceneName + ":" + floor.toString()].saved_grid_pose;
    var maxIndex = saved_grid_pose.length - 1; // 最大节点索引为节点位置列表的长度减1
    if (displayedPairs.length === maxIndex * maxIndex) {
      alert("All pairs have been compared.");
    }
    else{
      console.log("current displayedPairs:", displayedPairs.length);
      updateCanvas();
    }
  });

  randomlySelectSceneAndFloor();
  updateCanvas(); // 调用函数以加载随机的图像对
});
