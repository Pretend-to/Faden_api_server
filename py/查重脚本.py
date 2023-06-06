with open("file.txt", "r", encoding="utf-8") as f:
    lines = set(f.readlines())

with open("new_file.txt", "w", encoding="utf-8") as f:
    for line in lines:
        f.write(line)
