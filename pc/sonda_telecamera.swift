// Sonda delle telecamere del Mac (sottofase 2.1): per ogni telecamera elenca i formati disponibili
// e dice se si possono bloccare esposizione, messa a fuoco e bilanciamento del bianco.
//
// Uso (da Terminal.app, l'app a cui macOS ha concesso la telecamera nella 1.1):
//   swift pc/sonda_telecamera.swift
// Il 24 ottobre, lanciata da un processo senza il permesso della telecamera, ha risposto "no" a
// tutti i blocchi anche per l'iPhone: va ripetuta con il permesso concesso per esserne sicuri.
import AVFoundation

let stati = [0: "mai chiesto", 1: "limitato", 2: "negato", 3: "concesso"]
let autorizzazione = AVCaptureDevice.authorizationStatus(for: .video).rawValue
print("Permesso della telecamera per questo programma:", stati[autorizzazione] ?? "\(autorizzazione)")
print("Inquadratura automatica (Center Stage) attiva:", AVCaptureDevice.isCenterStageEnabled)

let ricerca = AVCaptureDevice.DiscoverySession(
  deviceTypes: [.builtInWideAngleCamera, .external, .continuityCamera, .deskViewCamera],
  mediaType: .video, position: .unspecified)

func siNo(_ valore: Bool) -> String { valore ? "sì" : "no" }

for d in ricerca.devices {
  print("\n==", d.localizedName)
  print("  blocco dell'esposizione:", siNo(d.isExposureModeSupported(.locked)),
        "· fuoco bloccabile:", siNo(d.isFocusModeSupported(.locked)),
        "· bilanciamento bloccabile:", siNo(d.isWhiteBalanceModeSupported(.locked)))
  for f in d.formats {
    let dim = CMVideoFormatDescriptionGetDimensions(f.formatDescription)
    let fps = f.videoSupportedFrameRateRanges.map { "\(Int($0.maxFrameRate))" }.joined(separator: "/")
    print("  formato \(dim.width) × \(dim.height), fino a \(fps) fps")
  }
}
