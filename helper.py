import os
import numpy as np
import json


def get_folders_in_path(path):
    folders = []
    for item in os.listdir(path):
        item_path = os.path.join(path, item)
        if os.path.isdir(item_path):
            folders.append(item)
    return folders


def find_max_floor(scene_name):
    scene_folder_path = os.path.join('static', 'dataset','Auto', scene_name)#这里需要按照dataset格式改
    if os.path.exists(scene_folder_path):
        subfolders = [
            name for name in os.listdir(scene_folder_path)
            if os.path.isdir(os.path.join(scene_folder_path, name)) and name.isdigit()
        ]
        max_floor = max([int(subfolder) for subfolder in subfolders], default=0)
        return max_floor
    return 0


def process_scenes(scenes,version):
    #version represent Auto or manually
    floormap = {}
    pointmap = {}
    for scene in scenes:
        max_floor = find_max_floor(scene)
        floormap[scene] = max_floor
        for floor in range(max_floor + 1):
            pathName = os.path.join('static', 'dataset', version,scene, str(floor), 'saved_obs')
            saved_grid_pose = np.load(os.path.join(pathName, 'saved_grid_pose.npy'))
            rel_mat = np.load(os.path.join(pathName, 'rel_mat.npy'))
            filtered_rel_mat = {}

            for i in range(rel_mat.shape[0]):
                for j in range(i + 1, rel_mat.shape[0]):
                    if rel_mat[i][j] != 0.0:
                        filtered_rel_mat[f"{i}:{j}"] = rel_mat[i][j]
                        filtered_rel_mat[f"{j}:{i}"] = rel_mat[j][i]

            pointmap[f"{scene}:{floor}"] = {
                "saved_grid_pose": saved_grid_pose.tolist(),
                "rel_mat": filtered_rel_mat
            }
    return floormap, pointmap

def main():
    scenes_Auto = get_folders_in_path(os.path.join('.', 'static', 'dataset', 'Auto'))
    scenes_manually = get_folders_in_path(os.path.join('.', 'static', 'dataset', 'Manually'))

    floormap_Auto, pointmap_Auto = process_scenes(scenes_Auto,'Auto')
    floormap_manually, pointmap_manually = process_scenes(scenes_manually,'Manually')

    with open('static/pointmap.js', 'w') as f:
        f.write('var subfolderList_Auto = ' + json.dumps(scenes_Auto) + ';\n')
        f.write('var floormap_Auto = ' + json.dumps(floormap_Auto) + ';\n')
        f.write('var pointmap_Auto = ' + json.dumps(pointmap_Auto) + ';\n')

        f.write('var subfolderList_Manually = ' + json.dumps(scenes_manually) + ';\n')
        f.write('var floormap_Manually = ' + json.dumps(floormap_manually) + ';\n')
        f.write('var pointmap_Manually = ' + json.dumps(pointmap_manually) + ';\n')

if __name__ == '__main__':
    main()
