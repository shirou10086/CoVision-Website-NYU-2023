import os
subfolderList = ['Adrian', 'Andover', 'Angiola', 'Avonia', 'Beach', 'Brevort', 'Colebrook', 'Cooperstown', 'Denmark', 'Edgemere', 'Greigsville', 'Hillsdale', 'Maryhill', 'Mifflintown', 'Quantico', 'Rosser', 'Seward', 'Sisters', 'Stanleyville', 'Woonsocket'];
# This file cleans up the entire database
root_dir = '.\\static\\dataset'

# loop through all files under root
for subdir, dirs, files in os.walk(root_dir, topdown=False):
    if os.path.dirname(subdir) == root_dir:
        # save is digit() and 'visualization' folder
        if not os.path.basename(subdir).isdigit() and os.path.basename(subdir) != 'visualization':
            for file in files:
                os.remove(os.path.join(subdir, file))
            dirs.clear()
            continue

    # save 'saved_obs'
    if os.path.basename(subdir).isdigit():
        for dir_name in dirs[:]:
            if dir_name != 'saved_obs':
                for file in os.listdir(os.path.join(subdir, dir_name)):
                    os.remove(os.path.join(subdir, dir_name, file))
                dirs.remove(dir_name)  # 从dirs列表中移除已删除的目录
        for file in files:
            os.remove(os.path.join(subdir, file))

    # under saved_obs delete till 'saved_grid_pose.npy', 'rel_mat.npy' and 'best_color_'
    if 'saved_obs' in subdir:
        for file in files:
            if file not in ['saved_grid_pose.npy', 'rel_mat.npy'] and not file.startswith('best_color_'):
                os.remove(os.path.join(subdir, file))

print("cleaned up")
import shutil
# 列出父目录中的所有子目录
all_subdirectories = [
    d for d in os.listdir(root_dir)
    if os.path.isdir(os.path.join(root_dir, d))
]

# 遍历每个子目录，如果不在 subfolderList 中，则删除
for directory in all_subdirectories:
    if directory not in subfolderList:
        dir_path = os.path.join(root_dir, directory)
        try:
            shutil.rmtree(dir_path)
            print(f"Deleted {dir_path}")
        except OSError as e:
            print(f"Error: {dir_path} : {e.strerror}")
