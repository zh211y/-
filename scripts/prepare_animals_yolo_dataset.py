from __future__ import annotations

import argparse
import random
import shutil
from pathlib import Path

from ultralytics import YOLO


IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
ANIMAL_COCO_IDS = {14, 15, 16, 17, 18, 19, 20, 21, 22, 23}


def yolo_line(box, width: int, height: int) -> str:
    x1, y1, x2, y2 = [float(v) for v in box]
    cx = ((x1 + x2) / 2) / width
    cy = ((y1 + y2) / 2) / height
    bw = (x2 - x1) / width
    bh = (y2 - y1) / height
    return f"0 {cx:.6f} {cy:.6f} {bw:.6f} {bh:.6f}"


def copy_split(images: list[Path], output: Path, train_ratio: float) -> dict[Path, str]:
    random.seed(42)
    shuffled = images[:]
    random.shuffle(shuffled)
    split_at = max(1, int(len(shuffled) * train_ratio))
    split_map: dict[Path, str] = {}

    for index, image in enumerate(shuffled):
        split = "train" if index < split_at else "val"
        split_map[image] = split
        target = output / "images" / split / image.name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(image, target)
        (output / "labels" / split).mkdir(parents=True, exist_ok=True)
    return split_map


def auto_label(images: list[Path], split_map: dict[Path, str], output: Path, weights: str, conf: float) -> None:
    model = YOLO(weights)
    for image in images:
        result = model.predict(str(image), conf=conf, verbose=False)[0]
        lines: list[str] = []
        height, width = result.orig_shape
        for box in result.boxes:
            class_id = int(box.cls[0].item())
            if class_id in ANIMAL_COCO_IDS:
                lines.append(yolo_line(box.xyxy[0].tolist(), width, height))

        label_path = output / "labels" / split_map[image] / f"{image.stem}.txt"
        label_path.write_text("\n".join(lines), encoding="utf-8")


def write_yaml(output: Path) -> None:
    data_yaml = output / "data.yaml"
    data_yaml.write_text(
        "\n".join(
            [
                f"path: {output.as_posix()}",
                "train: images/train",
                "val: images/val",
                "names:",
                "  0: animal",
                "",
            ]
        ),
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare a one-class animal YOLO dataset from uploads/animals.")
    parser.add_argument("--source", default="uploads/animals")
    parser.add_argument("--output", default="datasets/animals")
    parser.add_argument("--weights", default="yolov8n.pt")
    parser.add_argument("--conf", type=float, default=0.25)
    parser.add_argument("--train-ratio", type=float, default=0.8)
    args = parser.parse_args()

    source = Path(args.source)
    output = Path(args.output)
    images = sorted([p for p in source.iterdir() if p.suffix.lower() in IMAGE_EXTS])
    if not images:
        raise SystemExit(f"No images found in {source}")

    if output.exists():
        shutil.rmtree(output)
    split_map = copy_split(images, output, args.train_ratio)
    auto_label(images, split_map, output, args.weights, args.conf)
    write_yaml(output)

    print(f"Prepared {len(images)} images at {output}")
    print("Labels are bootstrapped by pretrained YOLOv8. Review them before serious training.")


if __name__ == "__main__":
    main()
