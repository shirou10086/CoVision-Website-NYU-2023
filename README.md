Steps to update the dataset:
1. update dataset on aws E3 and local file aka "./static/dataset"
2. run helper.py
3. copy and paste MasterGroundTruth.csv under "./static/dataset/Auto" and "./static/dataset/Manually"
4.add "image_1,image_2,label" in header in "MasterGroundTruth.csv"
5. run auto_manualhelper.py
6. add "scene,floor,image1,image2,label" in header in "Auto_output.csv"
7. Then run csv2json.py change the file name for auto/manual
