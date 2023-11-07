document.addEventListener("DOMContentLoaded", function() {
  var mode = 'Auto'; // 全局变量，用于切换数据集
  var subfolderList = mode === 'Auto' ? subfolderList_Auto : subfolderList_Manually;
  var floormap = mode === 'Auto' ? floormap_Auto : floormap_Manually;
  var pointmap = mode === 'Auto' ? pointmap_Auto : pointmap_Manually;
  var groundtruth = mode === 'Auto' ? groundtruth_Auto : groundtruth_Manually;
  var saved_grid_pose = [];
  var subfolderSelect = document.getElementById("subfolderSelect");
  var floorSelect = document.getElementById("floorSelect");
  var selectedText = '';
  var sceneName = '';
  var showImage1 = false;
  var showImage2 = false;
  var showImage3 = false;
  var scene = '';
  var nodeIndexOfImage2 = null;
  var nodeIndexOfImage3 = null;
  var floor = 0;
  var scrolledPixels=0;
  var statusIndicator = document.createElement('div');
  statusIndicator.id = 'statusIndicator';
  document.body.appendChild(statusIndicator); // 或者附加到更具体的位置

  subfolderList.forEach(function(subfolder) {//add more scenes
    var option = document.createElement("option");
    option.value = subfolder;
    option.text = subfolder;
    subfolderSelect.appendChild(option);
  });
  var nextCanvasToUpdate = 2;
  window.addEventListener("scroll", function() {// resize and scroll doesnt change the image
    scrolledPixels = window.pageYOffset || document.documentElement.scrollTop;
  });
  window.addEventListener("resize", function() {
    scrolledPixels = window.pageYOffset || document.documentElement.scrollTop;
    requestAnimationFrame(updateCanvas);
  });
  // Add a listener for the toggleDataset button to switch between 'Auto' and 'Manually'
  document.getElementById('toggleDataset').addEventListener('click', function() {
    // Toggle mode
    mode = mode === 'Auto' ? 'Manually' : 'Auto';

    // Update subfolderList, floormap, and pointmap according to the new mode
    subfolderList = mode === 'Auto' ? subfolderList_Auto : subfolderList_Manually;
    floormap = mode === 'Auto' ? floormap_Auto : floormap_Manually;
    pointmap = mode === 'Auto' ? pointmap_Auto : pointmap_Manually;
    groundtruth = mode === 'Auto' ? groundtruth_Auto : groundtruth_Manually;
    var button = document.getElementById('toggleDataset');
    button.textContent = mode;


    // Update the UI to reflect the change in dataset
    updateUIForModeChange();
  });

  function createConnectionMapFromJson(groundtruth, scene, floor) {
    var connectionMap = {};
    groundtruth.forEach(entry => {
      if (entry.scene === scene && entry.floor === floor && entry.label === 1) {
        var key = `${entry.image1}:${entry.image2}`;
        connectionMap[key] = true;
      }
    });
    return connectionMap;
  }

  function populateFloorOptions(scene) {//populate the floor
    var selectedOption = subfolderSelect.options[subfolderSelect.selectedIndex];
    var folderName = selectedOption.text;
    var floorOptions = mode === 'Auto' ? floormap_Auto[folderName] : floormap_Manually[folderName];
    floorSelect.innerHTML = ''; // 清空楼层选项

    for (var i = 0; i <= floorOptions; i++) {
      var option = document.createElement("option");
      option.value = i;
      option.text = i;
      floorSelect.appendChild(option);
    }
  }
  floorSelect.addEventListener("change", function() {//when floor selected
    var chosenFloor = floorSelect.options[floorSelect.selectedIndex].value;
    if (pointmap[scene + ":" + chosenFloor.toString()] && pointmap[scene + ":" + chosenFloor.toString()].saved_grid_pose) {
      saved_grid_pose = pointmap[scene + ":" + chosenFloor.toString()].saved_grid_pose;
      console.log("Updated saved_grid_pose:", chosenFloor);
    }
    floor = parseInt(floorSelect.value); // 更新选择的楼层
    updateCanvas();
  });
  function handleButtonClick(index) {
    var selectedOption = subfolderSelect.options[subfolderSelect.selectedIndex];
    var folderName = selectedOption.text;

    var imageSrc = "https://spatialreasoning.s3.amazonaws.com/dataset/" + mode+'/'+folderName + "/" + floor.toString() + "/saved_obs/best_color_" + index + ".png";

    // 判断是更新image2还是image3
    if (nextCanvasToUpdate === 2) {
      nodeIndexOfImage2 = index; // 存储图像2的节点索引
      var image2 = new Image();
      image2.src = imageSrc;

      // 当图像加载完成后，在画布上绘制它
      image2.onload = function() {
        rightCtx.clearRect(0, 0, rightCanvas.width, rightCanvas.height);
        rightCtx.drawImage(image2, 0, 0, rightCanvas.width, rightCanvas.height);
      };
    } else {
      nodeIndexOfImage3 = index; // 存储图像3的节点索引
      var image3 = new Image();
      image3.src = imageSrc;

      // 当图像加载完成后，在画布上绘制它
      image3.onload = function() {
        rightCtx2.clearRect(0, 0, rightCanvas2.width, rightCanvas2.height);
        rightCtx2.drawImage(image3, 0, 0, rightCanvas2.width, rightCanvas2.height);
      };
    }

    // 检查图像2和图像3的节点之间是否存在连接
    groundtruth = mode === 'Auto' ? groundtruth_Auto : groundtruth_Manually;

    var isConnected = groundtruth.some(entry => {
      return entry.scene === folderName &&
             entry.floor === floor &&
             ((entry.image1 === nodeIndexOfImage2 && entry.image2 === nodeIndexOfImage3) ||
              (entry.image1 === nodeIndexOfImage3 && entry.image2 === nodeIndexOfImage2)) &&
             entry.label === 1; // Assuming label 1 means there is a connection, as per your system
    });

    if (isConnected) {
      alert(`Node ${nodeIndexOfImage2} and Node ${nodeIndexOfImage3} are connected!`);
    }

    // 切换下一个要更新的画布
    nextCanvasToUpdate = (nextCanvasToUpdate === 2) ? 3 : 2;
  }

  subfolderSelect.addEventListener("change", function() {
    floor =0;
    var selectedOption = subfolderSelect.options[subfolderSelect.selectedIndex];
    scene = selectedOption.text;
    sceneName = "https://spatialreasoning.s3.amazonaws.com/dataset/" +mode+'/'+ selectedOption.text + "/";
    console.log("Selected Text:", sceneName);
    if (pointmap[scene + ":" + floor.toString()] && pointmap[scene + ":" + floor.toString()].saved_grid_pose) {
      saved_grid_pose = pointmap[scene + ":" + floor.toString()].saved_grid_pose;
      console.log("Updated saved_grid_pose:", saved_grid_pose);
    }
    showImage1 = false;
    showImage2 = false;
    showImage3 = false;
    updateCanvas();
    populateFloorOptions(scene);
  });

  // 获取画布对象和上下文
  var leftCanvas = document.getElementById('leftCanvas');
  var leftCtx = leftCanvas.getContext('2d');

  //绘制点和点的连接
  function drawPointsOnCanvas(canvas, points, groundtruth, changerate, drawX, drawY) {
    var context = canvas.getContext("2d");
    var radius = 5; // 假设这个是点的半径，尽管在代码中没有用到
    var rel_mat = createConnectionMapFromJson(groundtruth, scene, floor);
    var container = canvas.parentNode; // 获取画布的容器元素

    // 现在rel_mat包含了具有label为1的连接
    for (var connection in rel_mat) {
      var [startNode, endNode] = connection.split(":").map(Number);
      var startX = points[startNode][0] * changerate + drawX;
      var startY = points[startNode][1] * changerate + drawY;
      var endX = points[endNode][0] * changerate + drawX;
      var endY = points[endNode][1] * changerate + drawY;

      // 画线
      context.beginPath();
      context.moveTo(startX, startY);
      context.strokeStyle = "blue";
      context.lineTo(endX, endY);
      context.stroke();
    }

    for (var i = 0; i < points.length; i++) {
      var x = points[i][0] * changerate + drawX;
      var y = points[i][1] * changerate + drawY;
      // Create a button element
      var button = document.createElement("button");
      button.classList.add("button-overlay");
      var canvasRect = canvas.getBoundingClientRect();
      var canvasLeft = canvasRect.left;
      var canvasTop = canvasRect.top;
      button.textContent = i;
      button.style.position = "relevant";
      button.style.left = (canvasLeft + x * 1.495) + "px";
      button.style.top = (canvasTop + +scrolledPixels+y * 1.495) + "px";
      button.style.zIndex = "1";
      button.addEventListener("click", function(event) {
        var buttonIndex = parseInt(event.target.textContent);
        // Handle button click for the corresponding point
        handleButtonClick(buttonIndex);
      });
      container.appendChild(button);
    }

    // 绘制humanmap中的关联线
    fetch('/draw_from_mongodb?scene=' + scene + '&floor=' + floor)
      .then(response => response.json())
      .then(data => {
        for (var i = 0; i < data.length; i++) {
          var [startNode, endNode, similar, notsimilar] = data[i];
          console.log('chenggong'+startNode)
          var startX = points[startNode][0] * changerate + drawX;
          var startY = points[startNode][1] * changerate + drawY;
          var endX = points[endNode][0] * changerate + drawX;
          var endY = points[endNode][1] * changerate + drawY;

          context.beginPath();
          context.moveTo(startX, startY);
          context.strokeStyle = "red";
          context.lineTo(endX, endY);
          context.stroke();
        }
      });
    return positions;
  }


  var rightCanvas = document.getElementById('rightCanvas');
  var rightCtx = rightCanvas.getContext('2d');

  var rightCanvas2 = document.getElementById('rightCanvas2');
  var rightCtx2 = rightCanvas2.getContext('2d');

  // 定义更新画布内容的函数
  function updateCanvas() {
    var container = leftCanvas.parentNode;
    var oldButtons = container.getElementsByClassName("button-overlay");
    while (oldButtons.length > 0) {
      oldButtons[0].parentNode.removeChild(oldButtons[0]);
    }
    // 清空画布
    nodeIndexOfImage2 = null;
    nodeIndexOfImage3 = null;
    nextCanvasToUpdate = 2;
    leftCtx.clearRect(0, 0, leftCanvas.width, leftCanvas.height);
    rightCtx.clearRect(0, 0, rightCanvas.width, rightCanvas.height);
    rightCtx2.clearRect(0, 0, rightCanvas2.width, rightCanvas2.height);

    // 绘制页面内容到画布
    // 绘制方框或图片到画布
    var boxWidth = leftCanvas.width;
    if (showImage1) {
      // 绘制图片1
      var image1 = new Image();
      image1.src = sceneName + "visualization/topdown_" + floor.toString() + ".png";
      image1.onload = function() {
        var imageAspectRatio = image1.width / image1.height;
        var drawWidth, drawHeight, changerate;

        if (imageAspectRatio >= 1) {
          drawWidth = boxWidth;
          drawHeight = boxWidth / imageAspectRatio;
          changerate = boxWidth / image1.width;
        } else {
          drawHeight = boxWidth;
          drawWidth = boxWidth * imageAspectRatio;
          changerate = boxWidth / image1.height;
        }

        var drawX = (boxWidth - drawWidth) / 2;
        var drawY = (boxWidth - drawHeight) / 2;

        // 清空画布
        leftCtx.clearRect(0, 0, leftCanvas.width, leftCanvas.height);

        // 调整画布尺寸为方框尺寸
        leftCanvas.width = boxWidth;
        leftCanvas.height = boxWidth;

        leftCtx.drawImage(image1, drawX, drawY, drawWidth, drawHeight);
        var positions = drawPointsOnCanvas(leftCanvas, saved_grid_pose, groundtruth, changerate, drawX, drawY);

        console.log("Image 1 loaded successfully!");

        console.log("DrawWidth:", drawWidth);
        console.log("DrawHeight:", drawHeight);
      };
    }

    if (!showImage2) {
      // 绘制方框2
      rightCtx.strokeStyle = 'green';
      rightCtx.lineWidth = 2;
      rightCtx.strokeRect(0, 0, rightCanvas.width, rightCanvas.height);
    }

    if (!showImage3) {
      // 绘制方框3
      rightCtx2.strokeStyle = 'blue';
      rightCtx2.lineWidth = 2;
      rightCtx2.strokeRect(0, 0, rightCanvas2.width, rightCanvas2.height);
    }
  }

  subfolderSelect.addEventListener("change", function() {
    var selectedOption = subfolderSelect.options[subfolderSelect.selectedIndex];
    sceneName = "https://spatialreasoning.s3.amazonaws.com/dataset/" +mode+'/'+ selectedOption.text + "/";
    console.log("Selected Text:", sceneName);
    showImage1 = true;
    showImage2 = false;
    showImage3 = false;
    updateCanvas();
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

  // 调用更新画布内容的函数
  updateCanvas();
});
