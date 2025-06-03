import os
import json

def replace_word_in_json(folder_path, old_word, new_word):
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.endswith('.json'):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = f.read()
                    if old_word in data:
                        data = data.replace(old_word, new_word)
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(data)
                        print(f"已替换: {file_path}")
                except Exception as e:
                    pass

replace_word_in_json("zh-CN","宝可梦","干员")

