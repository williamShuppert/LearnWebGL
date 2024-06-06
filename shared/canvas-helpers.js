export function fullScreenCanvas(canvas, aspectRatio) {
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    if (windowWidth / windowHeight > aspectRatio) {
        // Window is wider than the aspect ratio
        canvas.height = windowHeight
        canvas.width = windowHeight * aspectRatio
    } else {
        // Window is taller than the aspect ratio
        canvas.width = windowWidth
        canvas.height = windowWidth / aspectRatio
    }
}