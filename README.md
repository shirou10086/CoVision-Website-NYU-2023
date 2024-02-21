Steps to update the dataset:
1. update dataset on aws E3
2. run helper.py
3. copy files into ./auto,./manual
4. copy groundtruth in ./
5.add image_1,image_2,label in header in groundtruth
6. run auto_manualhelper.py
7. add scene,floor,image1,image2,label in header in output file
8. Then run csv2json.py change the file name for auto/manual
