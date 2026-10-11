import Foundation
import Vision
import AppKit

let root = CommandLine.arguments[1]
let files = try FileManager.default.contentsOfDirectory(atPath: root).filter { $0.hasSuffix(".webp") }.sorted()
var output: [[String: Any]] = []
for name in files {
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.recognitionLanguages = ["zh-Hans", "en-US"]
    request.usesLanguageCorrection = false
    let handler = VNImageRequestHandler(url: URL(fileURLWithPath: root).appendingPathComponent(name))
    try handler.perform([request])
    let lines = (request.results ?? []).compactMap { o -> [String: Any]? in
        guard let t = o.topCandidates(1).first else { return nil }
        return ["text": t.string, "x": o.boundingBox.minX, "y": o.boundingBox.minY, "confidence": t.confidence]
    }
    output.append(["file": name, "lines": lines])
}
let data = try JSONSerialization.data(withJSONObject: output, options: [.prettyPrinted, .sortedKeys, .withoutEscapingSlashes])
FileHandle.standardOutput.write(data)
