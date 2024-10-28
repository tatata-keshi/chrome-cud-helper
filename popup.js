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
      width: 250px;
      height: 200px;
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
    .filters {
      margin-top: 30px;
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

    // Exitボタンでオーバーレイを消去
    document.getElementById("exitOverlay").addEventListener("click", (e) => {
        e.stopPropagation(); // イベントが伝播して消えないようにする
        overlay.remove();
        style.remove();  // スタイルも削除
        svgFilters.remove();  // SVGフィルターも削除
        document.body.style.filter = "none"; // フィルター解除
    });
}
