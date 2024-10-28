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
    overlay.id = "customOverlay";
    overlay.innerHTML = `
    <div class="overlay-content">
      <button id="exitOverlay">Exit</button>
      <button id="colorPickerMode">Pick Element Color</button>
      <div class="color-display" id="colorDisplay">
        <div class="color-box" id="colorBox1">
          <div class="color-shape" id="shape1"></div>
          <div class="color-controls">
            R: <input type="range" min="0" max="255" id="sliderR1"><br>
            G: <input type="range" min="0" max="255" id="sliderG1"><br>
            B: <input type="range" min="0" max="255" id="sliderB1">
          </div>
        </div>
        <div class="color-box" id="colorBox2">
          <div class="color-shape" id="shape2"></div>
          <div class="color-controls">
            R: <input type="range" min="0" max="255" id="sliderR2"><br>
            G: <input type="range" min="0" max="255" id="sliderG2"><br>
            B: <input type="range" min="0" max="255" id="sliderB2">
          </div>
        </div>
      </div>
      <div class="filters">
        <label><input type="radio" name="filter" value="protanopia"> Protanopia</label><br>
        <label><input type="radio" name="filter" value="deuteranopia"> Deuteranopia</label><br>
        <label><input type="radio" name="filter" value="tritanopia"> Tritanopia</label><br>
      </div>
      <button id="resetFilter">Reset</button>
    </div>
  `;
    document.body.appendChild(overlay);

    // スタイルをインジェクト
    const style = document.createElement("style");
    style.textContent = `
    #customOverlay {
      position: fixed;
      top: 0;
      right: 0;
      width: 350px;
      height: 400px;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px;
      z-index: 10000;
    }
    .overlay-content {
      width: 100%;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    #exitOverlay {
      position: absolute;
      top: 5px;
      right: 5px;
      background-color: #ff4444;
      border: none;
      color: white;
      padding: 3px 6px;
      cursor: pointer;
    }
    #colorPickerMode {
      margin-top: 10px;
      background-color: #4CAF50;
      border: none;
      color: white;
      padding: 5px 10px;
      cursor: pointer;
    }
    .color-display {
      display: flex;
      justify-content: space-around;
      width: 100%;
      margin-top: 10px;
    }
    .color-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 120px;
    }
    .color-shape {
      width: 50px;
      height: 50px;
      margin-bottom: 10px;
      background-color: gray;
    }
    .color-controls input {
      width: 80px;
      margin-bottom: 5px;
    }
    .filters {
      margin-top: 20px;
    }
    #resetFilter {
      margin-top: auto;
      background-color: #4444ff;
      border: none;
      color: white;
      padding: 5px 10px;
      cursor: pointer;
    }
  `;
    document.head.appendChild(style);

    // SVGフィルターをインジェクト
    const svgFilters = document.createElement("div");
    svgFilters.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
      <!-- Protanopia Filter -->
      <filter id="protanopia">
        <feColorMatrix type="matrix" values="0.567,0.433,0,0,0,0.558,0.442,0,0,0,0,0.242,0.758,0,0,0,0,0,1,0"/>
      </filter>
      <!-- Deuteranopia Filter -->
      <filter id="deuteranopia">
        <feColorMatrix type="matrix" values="0.625,0.375,0,0,0,0.7,0.3,0,0,0,0,0.3,0.7,0,0,0,0,0,1,0"/>
      </filter>
      <!-- Tritanopia Filter -->
      <filter id="tritanopia">
        <feColorMatrix type="matrix" values="0.95,0.05,0,0,0,0,0.433,0.567,0,0,0,0.475,0.525,0,0,0,0,0,1,0"/>
      </filter>
    </svg>
  `;
    document.body.appendChild(svgFilters);

    // フィルター適用機能
    document.querySelectorAll("input[name='filter']").forEach((radio) => {
        radio.addEventListener("change", (event) => {
            const selectedFilter = event.target.value;
            document.body.style.filter = `url(#${selectedFilter})`;
        });
    });

    // リセットボタンでフィルター解除＆ラジオボタンの選択をリセット
    document.getElementById("resetFilter").addEventListener("click", () => {
        document.body.style.filter = "none";
        document.querySelectorAll("input[name='filter']").forEach((radio) => {
            radio.checked = false; // ラジオボタンの選択を解除
        });
    });

    // 色の初期値を保持するオブジェクト
    const selectedColors = [
        { r: 128, g: 128, b: 128 },
        { r: 128, g: 128, b: 128 }
    ];

    // RGBスライダーのイベントリスナー
    function updateColorFromSliders(index) {
        const color = selectedColors[index];
        document.getElementById(`shape${index + 1}`).style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
    }

    ["R", "G", "B"].forEach((channel) => {
        for (let i = 1; i <= 2; i++) {
            document.getElementById(`slider${channel}${i}`).addEventListener("input", (e) => {
                const value = parseInt(e.target.value);
                selectedColors[i - 1][channel.toLowerCase()] = value;
                updateColorFromSliders(i - 1);
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
        svgFilters.remove();  // SVGフィルターも削除
        document.body.style.filter = "none"; // フィルター解除
    });
}
