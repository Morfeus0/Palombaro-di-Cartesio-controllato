"""Prova della telecamera (sottofase 1.1): mostra il video e gli fps misurati.

Uso:  python pc/test_camera.py [indice]      (premi q per uscire)
Se vedi la webcam del Mac e non l'iPhone, riprova con indice 1 e poi 2.
Va lanciato da Terminal.app, che è l'app a cui macOS concede la telecamera.
"""
import sys
import time

import cv2

indice = int(sys.argv[1]) if len(sys.argv) > 1 else 0
cap = cv2.VideoCapture(indice)
if not cap.isOpened():
    sys.exit(f"Telecamera {indice} non apribile")

n, t0 = 0, time.time()
while True:
    ok, frame = cap.read()
    if not ok:
        break
    n += 1
    fps = n / (time.time() - t0)
    cv2.putText(frame, f"{fps:.1f} fps", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    cv2.imshow("Telecamera", frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
