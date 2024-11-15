document.addEventListener("DOMContentLoaded", () => {
    const radioButtons = document.querySelectorAll("input[name='filter']");

    // 前回の選択を復元
    chrome.storage.sync.get("selectedFilter", (data) => {
        if (data.selectedFilter) {
            const selectedRadio = document.querySelector(`input[name="filter"][value="${data.selectedFilter}"]`);
            if (selectedRadio) {
                selectedRadio.checked = true;
            }
        }
    });

    radioButtons.forEach((radio) => {
        radio.addEventListener("change", async (event) => {
            let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            const selectedFilter = event.target.value;

            chrome.storage.sync.set({ selectedFilter: selectedFilter });

            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: applyFilter,
                args: [selectedFilter]
            });
        });
    });
});

/**
 * SVGフィルターを適用する
 *
 * @param filterId
 */
function applyFilter(filterId = "none") {
    const overlay = document.getElementById("cvdCustomOverlay");
    if (filterId === "none") {
        document.body.style.filter = "none";
        if (overlay) {
            document.querySelectorAll(".cvd-color-box-filtered").forEach((box) => {
                box.style.filter = "none";
            });
        }
    } else {
        document.body.style.filter = `url(#${filterId})`;
        if (overlay) {
            document.querySelectorAll(".cvd-color-box-filtered").forEach((box) => {
                box.style.filter = `url(#${filterId})`;
            });
        }
    }
}

document.getElementById("showOverlay").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: showOverlayInContentScript
        });

        window.close();
    });
});

function showOverlayInContentScript() {
    if (document.getElementById("customOverlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "cvdCustomOverlay";
    overlay.innerHTML = `
    <div class="cvd-set-overlay-position-container">
        <button type="button" class="cvd-set-overlay-position" id="setTopLeft">&nwarr;</button>
        <button type="button" class="cvd-set-overlay-position" id="setTopRight">&nearr;</button>
    </div>
    <div class="cvd-exit-overlay-button-container">
        <button id="exitOverlayButton" class="cvd-exit-overlay-button">Exit</button>        
    </div>
    <div class="cvd-color-display-container">
        <h2>Color1</h2>
        <div class="cvd-color-display">
            <div class="cvd-color-box-container">
                <div id="boxColor1" class="cvd-color-box"></div>
                <div id="boxColorFiltered1" class="cvd-color-box cvd-color-box-filtered"></div>
            </div>
            <div class="cvd-color-controls">
                <div class="cvd-color-slider">
                    <p>R: </p>
                    <input type="range" min="0" max="255" id="sliderColorR1">
                </div>
                <div class="cvd-color-slider">
                    <p>G: </p>
                    <input type="range" min="0" max="255" id="sliderColorG1">
                </div>
                <div class="cvd-color-slider">
                    <p>B: </p>
                    <input type="range" min="0" max="255" id="sliderColorB1">
                </div>
            </div>
            <div class="cvd-color-css-container">
                <div class="cvd-color-css">
                    <code id="hexColor1"></code>
                </div>
                <div class="cvd-color-css">
                    <code id="rgbColor1"></code>
                </div>
            </div>
        </div>
        <div class="cvd-color-display">
            <div class="cvd-color-box-container">
                <div id="boxBackground1" class="cvd-color-box"></div>
                <div id="boxBackgroundFiltered1" class="cvd-color-box cvd-color-box-filtered"></div>
            </div>
            <div class="cvd-color-controls">
                <div class="cvd-color-slider">
                    <p>R: </p>
                    <input type="range" min="0" max="255" id="sliderBackgroundR1">
                </div>
                <div class="cvd-color-slider">
                    <p>G: </p>
                    <input type="range" min="0" max="255" id="sliderBackgroundG1">
                </div>
                <div class="cvd-color-slider">
                    <p>B: </p>
                    <input type="range" min="0" max="255" id="sliderBackgroundB1">
                </div>
            </div>
            <div class="cvd-color-css-container">
                <div class="cvd-color-css">
                    <code id="hexBackground1"></code>
                </div>
                <div class="cvd-color-css">
                    <code id="rgbBackground1"></code>
                </div>
            </div>
        </div>
        <h2>Color2</h2>
        <div class="cvd-color-display">
            <div class="cvd-color-box-container">
                <div id="boxColor2" class="cvd-color-box"></div>
                <div id="boxColorFiltered2" class="cvd-color-box cvd-color-box-filtered"></div>
            </div>
            <div class="cvd-color-controls">
                <div class="cvd-color-slider">
                    <p>R: </p>
                    <input type="range" min="0" max="255" id="sliderColorR2">
                </div>
                <div class="cvd-color-slider">
                    <p>G: </p>
                    <input type="range" min="0" max="255" id="sliderColorG2">
                </div>
                <div class="cvd-color-slider">
                    <p>B: </p>
                    <input type="range" min="0" max="255" id="sliderColorB2">
                </div>
            </div>
            <div class="cvd-color-css-container">
                <div class="cvd-color-css">
                    <code id="hexColor2"></code>
                </div>
                <div class="cvd-color-css">
                    <code id="rgbColor2"></code>
                </div>
            </div>
        </div>
        <div class="cvd-color-display">
            <div class="cvd-color-box-container">
                <div id="boxBackground2" class="cvd-color-box"></div>
                <div id="boxBackgroundFiltered2" class="cvd-color-box cvd-color-box-filtered"></div>
            </div>
            <div class="cvd-color-controls">
                <div class="cvd-color-slider">
                    <p>R: </p>
                    <input type="range" min="0" max="255" id="sliderBackgroundR2">
                </div>
                <div class="cvd-color-slider">
                    <p>G: </p>
                    <input type="range" min="0" max="255" id="sliderBackgroundG2">
                </div>
                <div class="cvd-color-slider">
                    <p>B: </p>
                    <input type="range" min="0" max="255" id="sliderBackgroundB2">
                </div>
            </div>
            <div class="cvd-color-css-container">
                <div class="cvd-color-css">
                    <code id="hexBackground2"></code>
                </div>
                <div class="cvd-color-css">
                    <code id="rgbBackground2"></code>
                </div>
            </div>
        </div>
    </div>
    <div class="cvd-toggle-color-pick-mode-button-container">
        <button class="cvd-toggle-color-pick-mode-button" id="toggleColorPickMode">選択モード</button>
    </div>
        <div class="cvd-set-overlay-position-container">
        <button type="button" class="cvd-set-overlay-position" id="setBottomLeft">&swarr;</button>
        <button type="button" class="cvd-set-overlay-position" id="setBottomRight">&searr;</button>
    </div>
  `;

    function setOverlayPosition(position) {
        overlay.style.top = position.includes("Top") ? "0" : "";
        overlay.style.bottom = position.includes("Bottom") ? "0" : "";
        overlay.style.left = position.includes("Left") ? "0" : "";
        overlay.style.right = position.includes("Right") ? "0" : "";
    }

    setOverlayPosition("TopRight");

    document.documentElement.appendChild(overlay);

    const style = document.createElement("style");
    style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap');
    
    #cvdCustomOverlay {
        font-family: "Noto Sans JP", serif !important;
        position: fixed;
        width: 400px;
        background-color: white;
        color: black;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px;
        z-index: 10000;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0px 0px 12px -4px #777777;
    }
    .cvd-set-overlay-position-container {
        width: 100%;
        display: flex;
        justify-content: space-between;
    }
    .cvd-set-overlay-position {
        background-color: #ccc;
        border: none;
        border-radius: 4px;
        color: white;
        padding: 4px 8px;
        cursor: pointer;   
    }
    #cvdCustomOverlay h2 {
        font-size: 16px;
        font-weight: bold;
        margin: 0;
        padding: 0;
    }
    .cvd-exit-overlay-button-container {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        margin-top: 8px;
    }
    .cvd-exit-overlay-button {
        background-color: #ef4444;
        border: none;
        border-radius: 4px;
        color: white;
        padding: 4px 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: normal;
    }
    .cvd-color-display-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
    }
    .cvd-color-display {
        display: flex;
        gap: 12px;
        width: 100%;
        align-items: center;
        margin-bottom: 8px;
    }
    .cvd-color-box-container {
        display: flex;
        gap: 8px;
        align-items: center;
    }
    .cvd-color-box {
        width: 36px;
        height: 36px;
        background-color: gray;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    .cvd-color-controls {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .cvd-color-slider {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .cvd-color-slider input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      outline: none;
      background: transparent;
      cursor: pointer;
      width: 100px;
    }
    .cvd-color-slider input[type="range"]::-webkit-slider-runnable-track {
      background: #ccc;
      height: 6px;
      border-radius: 8px;
    }
    .cvd-color-slider input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      height: 16px;
      width: 16px;
      margin-top: -5px;
      background-color: #0ea5e9;
      border-radius: 50%;
    }
    .cvd-color-slider p {
        font-size: 14px;
        margin: 0;
    }
    .cvd-color-css-container {
        display: flex;
        flex-direction: column;
        align-items: start;
        justify-content: center;
        gap: 4px;
    }
    .cvd-color-css {
        display: flex;
    }
    .cvd-color-css code {
        font-family: monospace !important;
        font-size: 14px !important;
        color: #b91c1c !important;
        background-color: #fef2f2 !important;
        padding: 2px 4px !important;
        margin: 0 !important;
    }
    .cvd-toggle-color-pick-mode-button-container {
        margin-top: 8px;
        margin-bottom: 8px;
        width: 100%;
        display: flex;
        justify-content: center;
    }
    .cvd-toggle-color-pick-mode-button {
        background-color: #0ea5e9;
        border: none;
        border-radius: 4px;
        color: white;
        padding: 4px 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: normal;
    }
    .cvd-toggle-color-pick-mode-button:hover {
        background-color: #0284c7;
    }
    .cvd-toggle-color-pick-mode-button:focus {
        background-color: #0284c7;
    }
    .cvd-toggle-color-pick-mode-button:active {
        background-color: #0369a1;
    }
  `;
    document.head.appendChild(style);

    document.getElementById("setTopLeft").addEventListener("click", () => {
        setOverlayPosition("TopLeft");
    });
    document.getElementById("setTopRight").addEventListener("click", () => {
        setOverlayPosition("TopRight");
    });
    document.getElementById("setBottomLeft").addEventListener("click", () => {
        setOverlayPosition("BottomLeft");
    });
    document.getElementById("setBottomRight").addEventListener("click", () => {
        setOverlayPosition("BottomRight");
    });

    let selectedColors = [
        { r: 128, g: 128, b: 128 },
        { r: 128, g: 128, b: 128 }
    ];

    let selectedBackgrounds = [
        { r: 128, g: 128, b: 128 },
        { r: 128, g: 128, b: 128 }
    ]

    let boxIndex = 0;

    setSliderValue(0);
    setSliderValue(1);

    function setSliderValue(index) {
        const color = getRGBColor(selectedColors[index]);
        const background = getRGBColor(selectedBackgrounds[index]);
        document.getElementById(`hexColor${index + 1}`).textContent = rgbToHex(selectedColors[index]);
        document.getElementById(`rgbColor${index + 1}`).textContent = color;
        document.getElementById(`hexBackground${index + 1}`).textContent = rgbToHex(selectedBackgrounds[index]);
        document.getElementById(`rgbBackground${index + 1}`).textContent = background;
    }

    function rgbToHex(color) {
        const r = `00${color.r.toString(16)}`.slice(-2);
        const g = `00${color.g.toString(16)}`.slice(-2);
        const b = `00${color.b.toString(16)}`.slice(-2);

        return `#${r}${g}${b}`;
    }

    function getRGBColor(color) {
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }

    function updateColorFromSliders(index) {
        const color = getRGBColor(selectedColors[index]);
        document.getElementById(`boxColor${index + 1}`).style.backgroundColor = color;
        document.getElementById(`boxColorFiltered${index + 1}`).style.backgroundColor = color;
        setSliderValue(index);
    }

    function updateBackgroundFromSliders(index) {
        const background = getRGBColor(selectedBackgrounds[index]);
        document.getElementById(`boxBackground${index + 1}`).style.backgroundColor = background;
        document.getElementById(`boxBackgroundFiltered${index + 1}`).style.backgroundColor = background;
        setSliderValue(index);
    }

    ["R", "G", "B"].forEach((channel) => {
        for (let i = 1; i <= 2; i++) {
            document.getElementById(`sliderColor${channel}${i}`).addEventListener("input", (e) => {
                selectedColors[i - 1][channel.toLowerCase()] = parseInt(e.target.value);
                updateColorFromSliders(i - 1);
            });
            document.getElementById(`sliderBackground${channel}${i}`).addEventListener("input", (e) => {
                selectedBackgrounds[i - 1][channel.toLowerCase()] = parseInt(e.target.value);
                updateBackgroundFromSliders(i - 1);
            });
        }
    });

    document.getElementById("toggleColorPickMode").addEventListener("click", () => {
        document.body.style.cursor = "crosshair";

        function colorPickerHandler(event) {
            event.preventDefault();

            const targetElement = event.target;
            const computedStyle = window.getComputedStyle(targetElement);

            const bgColor = computedStyle.backgroundColor;
            const color = computedStyle.color;
            const [_, backgroundR, backgroundG, backgroundB] = bgColor.match(/rgba?\((\d+), (\d+), (\d+)/).map(Number);
            const [__, colorR, colorG, colorB] = color.match(/rgba?\((\d+), (\d+), (\d+)/).map(Number);

            selectedBackgrounds[boxIndex] = { r: backgroundR, g: backgroundG, b: backgroundB };
            selectedColors[boxIndex] = { r: colorR, g: colorG, b: colorB };

            document.getElementById(`sliderBackgroundR${boxIndex + 1}`).value = backgroundR;
            document.getElementById(`sliderBackgroundG${boxIndex + 1}`).value = backgroundG;
            document.getElementById(`sliderBackgroundB${boxIndex + 1}`).value = backgroundB;
            document.getElementById(`sliderColorR${boxIndex + 1}`).value = colorR;
            document.getElementById(`sliderColorG${boxIndex + 1}`).value = colorG;
            document.getElementById(`sliderColorB${boxIndex + 1}`).value = colorB;

            updateBackgroundFromSliders(boxIndex);
            updateColorFromSliders(boxIndex);

            boxIndex = (boxIndex + 1) % 2;

            document.body.style.cursor = "default";
            document.removeEventListener("click", colorPickerHandler, true);
        }

        document.addEventListener("click", colorPickerHandler, true);
    });

    document.getElementById("exitOverlayButton").addEventListener("click", (e) => {
        e.stopPropagation();
        overlay.remove();
        style.remove();
    });
}
