# Sorting Algorithms In Action

[![Repo](https://img.shields.io/badge/GitHub-Sorting--Algorithms--In--Action-181717?logo=github)](https://github.com/smangasmashntuli/Sorting-Algorithms-In-Action)

An interactive web app that visualizes how common sorting algorithms work, step by step.

You can enter your own list of numbers, choose an algorithm, and watch the array update through each important operation (comparisons, swaps, pivots, pointers, and sorted regions).

## Demo Video

<video src="assets/Screen%20Recording%202026-04-25%20220604.mp4" controls playsinline width="100%">
  Your browser does not support the video tag.
</video>

[▶ Open Demo Video directly](assets/Screen%20Recording%202026-04-25%20220604.mp4)

## Preview

### App Screenshot
Save your screenshot at `assets/screenshot-main.png` and it will render here:

![Sorting app screenshot](assets/screenshot-main.png)

### Demo GIF
Save your GIF at `assets/demo.gif` and it will render here:

![Sorting demo gif](assets/demo.gif)

---

## Features

- Visualizes **Bubble Sort**, **Selection Sort**, **Insertion Sort**, and **Quick Sort**.
- Shows step-by-step state with highlighted boxes for:
  - Compared elements
  - Swapped elements
  - Pivot (Quick Sort)
  - Current key (Insertion Sort)
  - Sorted indices
  - Pointer positions (`i`, `j`)
- Quick Sort supports multiple pivot strategies:
  - Start
  - Middle
  - Last
  - Random
- Playback controls for non-quick sorts:
  - Play / Pause
  - Prev / Next
  - Restart
  - Speed control (0.5x, 1x, 2x, 3x)
- Displays runtime stats:
  - Algorithm name
  - Number of steps
  - Execution time (ms)
  - Array length
- Input parser accepts numbers separated by commas, spaces, or new lines.

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript (no external dependencies)

## Project Structure

- `UI-for-SortingAlgo.html` — main UI and layout
- `style.css` — styles and visual states for array boxes and controls
- `script.js` — sorting logic, step generation, rendering, and playback controls
- `assets/` — media files for README (screenshots, GIFs, video thumbnails)

## How to Run

Because this is a static frontend app, you can run it in either of these ways:

### 1) Open directly
- Open `UI-for-SortingAlgo.html` in your browser.

### 2) Run with a local server (recommended)
From the project folder:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000/UI-for-SortingAlgo.html`

## How to Use

1. Select a sorting algorithm from the tabs.
2. Enter numbers in the input box (comma/space/newline separated).
3. Click **Sort**.
4. Review:
   - **Final result** section for sorted output
   - **Sorting steps** section for visualization
5. Use playback controls to navigate algorithm progress.
6. For Quick Sort, choose a pivot strategy before sorting.

## Notes

- Quick Sort renders all generated steps as cards (instead of animated playback controls).
- Invalid tokens in input are rejected with an error message.

## License

This project currently has no explicit license. Add one if you plan to distribute or accept contributions.

---

## Author

- GitHub: [@smangasmashntuli](https://github.com/smangasmashntuli)
