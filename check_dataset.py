from pathlib import Path
from PIL import Image

DATA_ROOT = Path(r"C:\Users\lazym\Downloads\CST463 Final\archive\chest_xray")

extensions = {".jpg", ".jpeg", ".png"}
sample_path = None

for split in ("train", "val", "test"):
    for label in ("NORMAL", "PNEUMONIA"):
        folder = DATA_ROOT / split / label
        if not folder.is_dir():
            raise FileNotFoundError(f"Folder not found: {folder}")
        files = sorted(
            p for p in folder.iterdir()
            if p.is_file() and p.suffix.lower() in extensions
        )
        if not files:
            raise RuntimeError(f"No images found in: {folder}")
        print(f"{split}/{label}: {len(files)} images")
        if sample_path is None:
            sample_path = files[0]

with Image.open(sample_path) as image:
    image.load()
    print(f"\nSample file: {sample_path.name}")
    print(f"Label: {sample_path.parent.name}")
    print(f"Original size (width, height): {image.size}")
    print(f"Original image mode: {image.mode}")

    processed = image.convert("L").resize((224, 224))
    print(f"After preprocessing: {processed.size}, mode={processed.mode}")