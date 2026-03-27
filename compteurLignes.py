import os

EXCLUDED_DIRS = {"node_modules", ".git", "dist", "build", "tts", "mqtt"}
EXCLUDED_FILES = {"package.json","package-lock.json", ".gitignore", "bdd.sqlite"}
ALLOWED_EXTENSIONS = {".js", ".ts", ".tsx", ".sh", ".html", ".css"}

file_lines = []
total_lines = 0  # Compteur total
for root, dirs, files in os.walk("."):
    # Exclure certains dossiers
    dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
    total_files += len(files)
    for file in files:
        if file in EXCLUDED_FILES:
            continue
        _, ext = os.path.splitext(file)
        if ext in ALLOWED_EXTENSIONS:
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                lines_count = sum(1 for line in f if line.strip())
            total_lines += lines_count
            file_lines.append((lines_count, path))  # Ajouter tous les fichiers

# Trier par nombre de lignes décroissant
file_lines.sort(reverse=True)

print(f"Total fichiers : {total_files}\n")
print("Nombre de lignes par fichier :")
for lines_count, path in file_lines:
    print(f"{lines_count:5} lignes -> {path}")
