function handleClickEvent(event) {
    event.preventDefault(); // デフォルトのクリック動作を無効化

    const element = event.target;

    // 要素の背景色とテキスト色を取得
    const computedStyle = window.getComputedStyle(element);
    const backgroundColor = computedStyle.backgroundColor;
    const color = computedStyle.color;

    // 背景色とテキスト色をコンソールに出力
    console.log(`Background color: ${backgroundColor}`);
    console.log(`Text color: ${color}`);

    // ポップアップや他の方法で表示したい場合
    alert(`Background color: ${backgroundColor}\nText color: ${color}`);
}

chrome.storage.sync.get(['colorPickerEnabled'], function (result) {
    if (result.colorPickerEnabled) {
        document.addEventListener('click', handleClickEvent, true);
    }
});
