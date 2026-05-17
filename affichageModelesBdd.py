from pathlib import Path

# Dossier contenant les modèles
DOSSIER_MODELES = Path("backend/bdd/modeles")

# Fichier de sortie
FICHIER_SORTIE = Path("listeModeles.txt")

# Vérifie que le dossier existe
if not DOSSIER_MODELES.exists():
    print(f"[ERREUR] Dossier introuvable : {DOSSIER_MODELES}")
    exit()

# Vide complètement le fichier au démarrage
with open(FICHIER_SORTIE, "w", encoding="utf-8") as sortie:
    sortie.write("")

# Parcours récursif des fichiers
for fichier in DOSSIER_MODELES.rglob("*"):

    # Ignore les dossiers
    if not fichier.is_file():
        continue

    try:
        with open(fichier, "r", encoding="utf-8") as f:
            contenu = f.read()

        # Ajout dans le fichier texte
        with open(FICHIER_SORTIE, "a", encoding="utf-8") as sortie:

            sortie.write("=" * 80 + "\n")
            sortie.write(f"FICHIER : {fichier}\n")
            sortie.write("=" * 80 + "\n\n")

            sortie.write(contenu)
            sortie.write("\n\n")

    except Exception as e:

        with open(FICHIER_SORTIE, "a", encoding="utf-8") as sortie:
            sortie.write(f"[ERREUR LECTURE] {fichier} : {e}\n\n")

print(f"[OK] Export terminé dans : {FICHIER_SORTIE}")