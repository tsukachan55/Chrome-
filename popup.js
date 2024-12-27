document.addEventListener('DOMContentLoaded', () => {
    const exportButton = document.getElementById('exportButton');
    const messageDiv = document.getElementById('message');

    exportButton.addEventListener('click', async () => {
        try {
            // 現在のタブを取得
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // コンテンツスクリプトにメッセージを送信
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'getTableData' });

            if (response.error) {
                showMessage(response.error, 'error');
                return;
            }

            if (!response.data || response.data.length === 0) {
                showMessage('テーブルデータが見つかりませんでした', 'error');
                return;
            }

            // バックグラウンドスクリプトにエクスポート要求を送信
            chrome.runtime.sendMessage({
                action: 'exportToExcel',
                data: response.data
            }, (response) => {
                if (response.success) {
                    showMessage('エクスポートが完了しました', 'success');
                } else {
                    showMessage('エクスポートに失敗しました', 'error');
                }
            });

        } catch (error) {
            showMessage('エラーが発生しました', 'error');
            console.error(error);
        }
    });

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
    }
}); 