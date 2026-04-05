import AppKit
import Foundation

let arguments = CommandLine.arguments

guard arguments.count == 3 else {
  fputs("Usage: swift generate_social_preview.swift <source-image> <output-image>\n", stderr)
  exit(1)
}

let sourceURL = URL(fileURLWithPath: arguments[1])
let outputURL = URL(fileURLWithPath: arguments[2])

guard let sourceImage = NSImage(contentsOf: sourceURL) else {
  fputs("Unable to read source image at \(sourceURL.path)\n", stderr)
  exit(1)
}

let canvasSize = NSSize(width: 1280, height: 640)
let canvasRect = NSRect(origin: .zero, size: canvasSize)

guard
  let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: Int(canvasSize.width),
    pixelsHigh: Int(canvasSize.height),
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
  )
else {
  fputs("Unable to allocate bitmap context.\n", stderr)
  exit(1)
}

bitmap.size = canvasSize

guard let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
  fputs("Unable to create graphics context.\n", stderr)
  exit(1)
}

NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = context

let backgroundGradient = NSGradient(
  colors: [
    NSColor(calibratedRed: 0.03, green: 0.03, blue: 0.03, alpha: 1),
    NSColor(calibratedRed: 0.09, green: 0.08, blue: 0.07, alpha: 1)
  ]
)

backgroundGradient?.draw(in: canvasRect, angle: -15)

let glowColor = NSColor(calibratedRed: 0.52, green: 0.41, blue: 0.26, alpha: 0.18)
glowColor.setFill()
NSBezierPath(ovalIn: NSRect(x: 840, y: 120, width: 340, height: 340)).fill()

let accentColor = NSColor(calibratedRed: 0.94, green: 0.91, blue: 0.86, alpha: 1)
let secondaryColor = NSColor(calibratedRed: 0.75, green: 0.70, blue: 0.65, alpha: 1)

let titleAttributes: [NSAttributedString.Key: Any] = [
  .font: NSFont.systemFont(ofSize: 18, weight: .medium),
  .foregroundColor: accentColor,
  .kern: 4
]

let headlineAttributes: [NSAttributedString.Key: Any] = [
  .font: NSFont.systemFont(ofSize: 62, weight: .regular),
  .foregroundColor: accentColor
]

let bodyStyle = NSMutableParagraphStyle()
bodyStyle.lineSpacing = 6

let bodyAttributes: [NSAttributedString.Key: Any] = [
  .font: NSFont.systemFont(ofSize: 24, weight: .regular),
  .foregroundColor: secondaryColor,
  .paragraphStyle: bodyStyle
]

NSAttributedString(string: "SCENT LAB", attributes: titleAttributes).draw(at: NSPoint(x: 92, y: 502))
NSAttributedString(string: "Well, if you musk?", attributes: headlineAttributes).draw(at: NSPoint(x: 88, y: 390))

let bodyText = """
Luxury in-store fragrance discovery for shoppers who want direction, not overload.
"""

NSAttributedString(string: bodyText, attributes: bodyAttributes).draw(
  in: NSRect(x: 92, y: 260, width: 460, height: 90)
)

secondaryColor.withAlphaComponent(0.3).setFill()
NSBezierPath(rect: NSRect(x: 92, y: 238, width: 120, height: 2)).fill()

let sourceSize = sourceImage.size
let targetHeight: CGFloat = 560
let scaledWidth = targetHeight * (sourceSize.width / sourceSize.height)
let imageRect = NSRect(x: 876, y: 40, width: scaledWidth, height: targetHeight)

let shadow = NSShadow()
shadow.shadowColor = NSColor.black.withAlphaComponent(0.35)
shadow.shadowBlurRadius = 28
shadow.shadowOffset = NSSize(width: 0, height: -8)
shadow.set()

let roundedPath = NSBezierPath(roundedRect: imageRect, xRadius: 28, yRadius: 28)
accentColor.withAlphaComponent(0.04).setFill()
roundedPath.fill()

roundedPath.addClip()
sourceImage.draw(in: imageRect, from: .zero, operation: .sourceOver, fraction: 1)

NSGraphicsContext.restoreGraphicsState()

guard let pngData = bitmap.representation(using: .png, properties: [:]) else {
  fputs("Unable to encode PNG output.\n", stderr)
  exit(1)
}

do {
  try FileManager.default.createDirectory(at: outputURL.deletingLastPathComponent(), withIntermediateDirectories: true)
  try pngData.write(to: outputURL)
  print("Wrote \(outputURL.path)")
} catch {
  fputs("Unable to write output image: \(error.localizedDescription)\n", stderr)
  exit(1)
}
