document.addEventListener("DOMContentLoaded", function() {
  var mode = 'Auto'; // 全局变量，用于切换数据集
  var subfolderList = mode === 'Auto' ? subfolderList_Auto : subfolderList_Manually;
  var floormap = mode === 'Auto' ? floormap_Auto : floormap_Manually;
  var pointmap = mode === 'Auto' ? pointmap_Auto : pointmap_Manually;
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

    function clearAndFillBackground(ctx, canvas) {
      canvas.width = canvas.width; // 根据画布的尺寸调整画布大小
      canvas.height = canvas.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
      ctx.fillStyle = "yellow"; // 设置为黄色
      ctx.fillRect(0, 0, canvas.width, canvas.height); // 填充整个画布
    }

    function loadImageToCanvas(image, ctx, canvas) {
      image.onload = function() {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height); // 绘制图片
      };
    }

    clearAndFillBackground(leftCtx, leftCanvas); // 清空并填充背景
    loadImageToCanvas(leftImage, leftCtx, leftCanvas);

    clearAndFillBackground(rightCtx, rightCanvas); // 清空并填充背景
    loadImageToCanvas(rightImage, rightCtx, rightCanvas);
    leftImage.src = "https://spatialreasoning.s3.amazonaws.com/dataset/"+mode+'/' + folderName + "/" + floor.toString() + "/saved_obs/best_color_" + leftImageIndex + ".png";
    rightImage.src = "https://spatialreasoning.s3.amazonaws.com/dataset/"+mode+'/'  + folderName + "/" + floor.toString() + "/saved_obs/best_color_" + rightImageIndex + ".png";
    document.getElementById('toggleDataset').addEventListener('click', function() {
      // Toggle mode
      mode = mode === 'Auto' ? 'Manually' : 'Auto';

      // Update subfolderList, floormap, and pointmap according to the new mode
      subfolderList = mode === 'Auto' ? subfolderList_Auto : subfolderList_Manually;
      floormap = mode === 'Auto' ? floormap_Auto : floormap_Manually;
      pointmap = mode === 'Auto' ? pointmap_Auto : pointmap_Manually;
      var button = document.getElementById('toggleDataset');
      button.textContent = mode;


      // Update the UI to reflect the change in dataset
      updateUIForModeChange();
    });
    function updateUIForModeChange() {
      // 保存当前选中的子文件夹和楼层
      var currentSubfolder = subfolderSelect.options[subfolderSelect.selectedIndex].value;
      var currentFloor = floorSelect.options[floorSelect.selectedIndex].value;

      // 更新子文件夹列表
      subfolderSelect.innerHTML = ''; // 清空选项
      var newSubfolderList = mode === 'Auto' ? subfolderList_Auto : subfolderList_Manually;
      newSubfolderList.forEach(function(subfolder) {
        var option = document.createElement("option");
        option.value = subfolder;
        option.text = subfolder;
        subfolderSelect.appendChild(option);
        if(subfolder === currentSubfolder) {
          option.selected = true; // 保持原来的子文件夹被选中
        }
      });

      // 更新楼层选项
      populateFloorOptions(scene); // 假设你有一个populateFloorOptions函数

      // 恢复之前选中的楼层
      floorSelect.value = currentFloor;

      // 重置图片显示和画布
      showImage1 = true;
      showImage2 = showImage3 = false;
      updateCanvas(); // 假设你有一个updateCanvas函数

      // 可能还需要根据新模式更新其他UI元素
    }


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
  function randomlySelectSceneAndFloor() {
    displayedPairs = [];
    var sceneIndex = getRandomIndex(subfolderList.length - 1);
    var sceneOption = subfolderSelect.options[sceneIndex];
    sceneName = sceneOption.text;
    subfolderSelect.selectedIndex = sceneIndex;
    populateFloorOptions(sceneName);

    var floorOption = floormap[sceneName];
    var floorIndex = getRandomIndex(floorOption);
    floorSelect.selectedIndex = floorIndex;
    floor = floorIndex;
  }
  function toggleFullScreen(element) {
    if (!document.fullscreenElement &&    // 检查当前是否有元素处于全屏状态
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // 这些是为了兼容各种浏览器
      if (element.requestFullscreen) {
        element.requestFullscreen(); // W3C API
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen(); // IE11
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen(); // Firefox
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT); // Chrome, Safari 和 Opera
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen(); // W3C API
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen(); // IE11
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen(); // Firefox
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen(); // Chrome, Safari 和 Opera
      }
    }
  }
  document.getElementById("leftCanvas").addEventListener("click", function() {
    toggleFullScreen(this); // 传递当前元素到toggleFullScreen函数
  });

  document.getElementById("rightCanvas").addEventListener("click", function() {
    toggleFullScreen(this); // 传递当前元素到toggleFullScreen函数
  });
  document.getElementById("leftCanvas").addEventListener("click", function() {
    window.open(leftImage.src, '_blank');
  });

  document.getElementById("rightCanvas").addEventListener("click", function() {
    window.open(rightImage.src, '_blank');
  });

  randomlySelectSceneAndFloor();
  updateCanvas();
});
