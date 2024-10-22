document.addEventListener('DOMContentLoaded', function () {
    const toggleColorPicker = document.getElementById('toggleColorPicker');
    const filter1 = document.getElementById('filter1');
    const filter2 = document.getElementById('filter2');
    const filter3 = document.getElementById('filter3');

    // 現在の状態を取得してUIに反映
    chrome.storage.sync.get(['colorPickerEnabled', 'filter1Enabled', 'filter2Enabled', 'filter3Enabled'], function (result) {
        toggleColorPicker.checked = result.colorPickerEnabled || false;
        filter1.checked = result.filter1Enabled || false;
        filter2.checked = result.filter2Enabled || false;
        filter3.checked = result.filter3Enabled || false;
    });

    // SVGフィルターを画面に適用する関数
    function applySvgFilter(filterId, enabled) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tabId = tabs[0].id;
            if (enabled) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    func: (filterId) => {
                        // フィルターを適用
                        const svg = `
              <svg xmlns="http://www.w3.org/2000/svg" style="position: absolute; width: 0; height: 0;">
                <defs>
                  <filter id="protanopia">
                    <feColorMatrix type="matrix"
                      values="0.567, 0.433, 0, 0, 0
                              0.558, 0.442, 0, 0, 0
                              0, 0.242, 0.758, 0, 0
                              0, 0, 0, 1, 0"/>
                  </filter>
                  <filter id="deuteranopia">
                    <feColorMatrix type="matrix"
                      values="0.625, 0.375, 0, 0, 0
                              0.7, 0.3, 0, 0, 0
                              0, 0.3, 0.7, 0, 0
                              0, 0, 0, 1, 0"/>
                  </filter>
                  <filter id="tritanopia">
                    <feColorMatrix type="matrix"
                      values="0.95, 0.05, 0, 0, 0
                              0, 0.433, 0.567, 0, 0
                              0, 0.475, 0.525, 0, 0
                              0, 0, 0, 1, 0"/>
                  </filter>
                </defs>
              </svg>`;

                        if (!document.getElementById('svg-filters')) {
                            const div = document.createElement('div');
                            div.id = 'svg-filters';
                            div.innerHTML = svg;
                            document.body.appendChild(div);
                        }

                        if (document.body.style.filter !== `url(#${filterId})`) {
                            document.body.style.filter = `url(#${filterId})`;
                        }
                    },
                    args: [filterId]
                });
            } else {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    func: () => {
                        document.body.style.filter = '';
                    }
                });
            }
        });
    }

    // チェックボックスが切り替えられた時の処理
    toggleColorPicker.addEventListener('change', function () {
        const enabled = toggleColorPicker.checked;
        chrome.storage.sync.set({ colorPickerEnabled: enabled }, function () {
            console.log('Color picker is ' + (enabled ? 'enabled' : 'disabled'));
        });
    });

    // フィルター1: Protanopia
    filter1.addEventListener('change', function () {
        const enabled = filter1.checked;
        chrome.storage.sync.set({ filter1Enabled: enabled }, function () {
            applySvgFilter('protanopia', enabled);
        });
    });

    // フィルター2: Deuteranopia
    filter2.addEventListener('change', function () {
        const enabled = filter2.checked;
        chrome.storage.sync.set({ filter2Enabled: enabled }, function () {
            applySvgFilter('deuteranopia', enabled);
        });
    });

    // フィルター3: Tritanopia
    filter3.addEventListener('change', function () {
        const enabled = filter3.checked;
        chrome.storage.sync.set({ filter3Enabled: enabled }, function () {
            applySvgFilter('tritanopia', enabled);
        });
    });
});
