Node.js + JSON storage is used now.

Data file:
data\detections.json

Snapshot folder:
uploads\detections

How to run:
1. Double click start_node_server.bat
2. Open http://127.0.0.1:5500/index.html
3. Double click G:\yolo\ultralytics-8.3.163\start_mycam_node.bat
4. Open realtime monitor in the web page

When YOLO detects mao niu:
- The record is saved to data\detections.json
- A snapshot with detection boxes is saved to uploads\detections
- The record image field points to that snapshot
- The dashboard refreshes every 3 seconds
