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

        // ポップアップを閉じる
        window.close();
    });
});

function showOverlayInContentScript() {
    if (document.getElementById("customOverlay")) return; // 重複表示防止

    const overlay = document.createElement("div");
    overlay.id = "cvdCustomOverlay";
    overlay.innerHTML = `
    <div class="cvd-exit-overlay-button-container">
        <button class="cvd-exit-overlay-button">Exit</button>        
    </div>
    <div class="cvd-color-display-container">
        <h2>Color1</h2>
        <div class="cvd-color-display">
            <div id="boxColor1" class="cvd-color-box"></div>
            <div id="boxColorFiltered1" class="cvd-color-box cvd-color-box-filtered"></div>
            <div class="cvd-color-controls">
                <div class="cvd-color-slider">
                    <p>R: </p>
                    <input type="range" min="0" max="255" id="sliderColorR1">
                    <p id="sliderColorR1Value"></p>
                </div>
                <div class="cvd-color-slider">
                    <p>G: </p>
                    <input type="range" min="0" max="255" id="sliderColorG1">
                    <p id="sliderColorG1Value"></p>
                </div>
                <div class="cvd-color-slider">
                    <p>B: </p>
                    <input type="range" min="0" max="255" id="sliderColorB1">
                    <p id="sliderColorB1Value"></p>
                </div>
            </div>
        </div>
        <div class="cvd-color-display">
            <div id="boxBackground1" class="cvd-color-box"></div>
            <div id="boxBackgroundFiltered1" class="cvd-color-box cvd-color-box-filtered"></div>
            <div class="cvd-color-controls">
                <div class="cvd-color-slider">
                    <p>R: </p>
                    <input type="range" min="0" max="255" id="sliderBackgroundR1">
                    <p id="sliderBackgroundR1Value"></p>
                </div>
                <div class="cvd-color-slider">
                    <p>G: </p>
                    <input type="range" min="0" max="255" id="sliderBackgroundG1">
                    <p id="sliderBackgroundG1Value"></p>
                </div>
                <div class="cvd-color-slider">
                    <p>B: </p>
                    <input type="range" min="0" max="255" id="sliderBackgroundB1">
                    <p id="sliderBackgroundB1Value"></p>
                </div>
            </div>
        </div>
        <h2>Color2</h2>
        <div class="cvd-color-display">
            <div id="boxColor2" class="cvd-color-box"></div>
            <div id="boxColorFiltered2" class="cvd-color-box cvd-color-box-filtered"></div>
            <div class="cvd-color-controls">
                <div class="cvd-color-slider">
                    <p>R: </p>
                    <input type="range" min="0" max="255" id="sliderColorR2">
                    <p id="sliderColorR2Value"></p>
                </div>
                <div class="cvd-color-slider">
                    <p>G: </p>
                    <input type="range" min="0" max="255" id="sliderColorG2">
                    <p id="sliderColorG2Value"></p>
                </div>
                <div class="cvd-color-slider">
                    <p>B: </p>
                    <input type="range" min="0" max="255" id="sliderColorB2">
                    <p id="sliderColorB2Value"></p>
                </div>
            </div>
        </div>
        <div class="cvd-color-display">
            <div id="boxBackground2" class="cvd-color-box"></div>
            <div id="boxBackgroundFiltered2" class="cvd-color-box cvd-color-box-filtered"></div>
            <div class="cvd-color-controls">
                <div class="cvd-color-slider">
                    <p>R: </p>
                    <input type="range" min="0" max="255" id="sliderBackgroundR2">
                    <p id="sliderBackgroundR2Value"></p>
                </div>
                <div class="cvd-color-slider">
                    <p>G: </p>
                    <input type="range" min="0" max="255" id="sliderBackgroundG2">
                    <p id="sliderBackgroundG2Value"></p>
                </div>
                <div class="cvd-color-slider">
                    <p>B: </p>
                    <input type="range" min="0" max="255" id="sliderBackgroundB2">
                    <p id="sliderBackgroundB2Value"></p>
                </div>
            </div>
        </div>
    </div>
    <div class="cvd-toggle-color-pick-mode-button-container">
        <button class="cvd-toggle-color-pick-mode-button" id="colorPickerMode">Pick Element Color</button>
    </div>
  `;
    document.documentElement.appendChild(overlay);

    // スタイルをインジェクト
    const style = document.createElement("style");
    style.textContent = `
    #cvdCustomOverlay {
        position: fixed;
        top: 0;
        right: 0;
        width: 320px;
        height: 440px;
        background-color: white;
        color: black;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 8px 12px;
        z-index: 10000;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    #cvdCustomOverlay h2 {
        font-size: 16px;
        font-weight: bold;
    }
    .cvd-exit-overlay-button-container {
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }
    .cvd-exit-overlay-button {
        background-color: red;
        border: none;
        border-radius: 4px;
        color: white;
        padding: 4px 8px;
        cursor: pointer;
    }
    .cvd-color-display-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
    }
    .cvd-color-display {
        display: flex;
        gap: 8px;
        width: 100%;
        align-items: center;
        margin-bottom: 8px;
    }
    .cvd-color-box {
        width: 48px;
        height: 48px;
        background-color: gray;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    .cvd-color-controls {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .cvd-color-controls input {
      width: 80px;
    }
    .cvd-color-slider {
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .cvd-toggle-color-pick-mode-button-container {
        margin-top: 16px;
        width: 100%;
        display: flex;
        justify-content: center;
    }
    .cvd-toggle-color-pick-mode-button {
        background-color: blue;
        border: none;
        border-radius: 4px;
        color: white;
        padding: 4px 8px;
        cursor: pointer;
    }
  `;
    document.head.appendChild(style);

    // 色の初期値を保持するオブジェクト
    const selectedColors = [
        { r: 128, g: 128, b: 128 },
        { r: 128, g: 128, b: 128 }
    ];

    const selectedBackgrounds = [
        { r: 128, g: 128, b: 128 },
        { r: 128, g: 128, b: 128 }
    ]

    function updateColorFromSliders(index) {
        const color = selectedColors[index];
        document.getElementById(`boxColor${index + 1}`).style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
        document.getElementById(`boxColorFiltered${index + 1}`).style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
    }

    function updateBackgroundFromSliders(index) {
        const background = selectedBackgrounds[index];
        document.getElementById(`boxBackground${index + 1}`).style.backgroundColor = `rgb(${background.r}, ${background.g}, ${background.b})`;
        document.getElementById(`boxBackgroundFiltered${index + 1}`).style.backgroundColor = `rgb(${background.r}, ${background.g}, ${background.b})`;
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

    // 要素の色を取得するモード
    document.getElementById("colorPickerMode").addEventListener("click", () => {
        document.body.style.cursor = "crosshair";

        function colorPickerHandler(event) {
            event.preventDefault();
            const targetElement = event.target;
            const computedStyle = window.getComputedStyle(targetElement);

            const bgColor = computedStyle.backgroundColor;
            const [_, r, g, b] = bgColor.match(/rgba?\((\d+), (\d+), (\d+)/).map(Number);

            // 2つ目まで保存し、順に更新
            const index = selectedColors[0].r === 128 ? 0 : selectedColors[1].r === 128 ? 1 : 0;
            selectedColors[index] = { r, g, b };
            document.getElementById(`sliderR${index + 1}`).value = r;
            document.getElementById(`sliderG${index + 1}`).value = g;
            document.getElementById(`sliderB${index + 1}`).value = b;

            updateColorFromSliders(index);
            document.body.style.cursor = "default";
            document.removeEventListener("click", colorPickerHandler, true);
        }

        document.addEventListener("click", colorPickerHandler, true);
    });

    // Exitボタンでオーバーレイを消去
    document.getElementById("exitOverlay").addEventListener("click", (e) => {
        e.stopPropagation(); // イベントが伝播して消えないようにする
        overlay.remove();
        style.remove();  // スタイルも削除
    });
}
