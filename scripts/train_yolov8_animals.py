from __future__ import annotations

import argparse
from pathlib import Path

from ultralytics import YOLO


def main() -> None:
    parser = argparse.ArgumentParser(description="Train YOLOv8 on the prepared animal dataset.")
    parser.add_argument("--data", default="datasets/animals/data.yaml")
    parser.add_argument("--weights", default="yolov8n.pt")
    parser.add_argument("--epochs", type=int, default=80)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=8)
    parser.add_argument("--device", default=None)
    args = parser.parse_args()

    data_yaml = Path(args.data)
    if not data_yaml.exists():
        raise SystemExit(
            "Dataset yaml not found. Run: python scripts/prepare_animals_yolo_dataset.py"
        )

    model = YOLO(args.weights)
    model.train(
        data=str(data_yaml),
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        device=args.device,
        project="runs/animal-detection",
        name="yolov8-animals",
    )

    print("Training finished. Copy the best weights to models/best.pt:")
    print("runs/animal-detection/yolov8-animals/weights/best.pt")


if __name__ == "__main__":
    main()
