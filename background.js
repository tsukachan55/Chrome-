// コンテキストメニューの作成
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "exportTable",
        title: "テーブルをエクスポート",
        contexts: ["all"]
    });
});

// コンテキストメニューのクリックイベント
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "exportTable") {
        try {
            // content.jsが読み込まれているか確認
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'ping' }).catch(() => null);
            if (!response) {
                // content.jsが読み込まれていない場合は再注入を試みる
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                });
            }

            // テーブルデータの取得を試みる
            const tableResponse = await chrome.tabs.sendMessage(tab.id, { action: 'getTableData' });
            
            if (tableResponse.error) {
                await chrome.tabs.sendMessage(tab.id, { 
                    action: 'showError', 
                    message: tableResponse.error 
                });
                return;
            }

            if (tableResponse.data) {
                await exportToExcel(tableResponse.data);
                await chrome.tabs.sendMessage(tab.id, { 
                    action: 'showSuccess', 
                    message: 'エクスポートが完了しました' 
                });
            }
        } catch (error) {
            console.error('Error:', error);
            try {
                await chrome.tabs.sendMessage(tab.id, { 
                    action: 'showError', 
                    message: 'エラーが発生しました。ページを更新して再度お試しください。' 
                });
            } catch (e) {
                console.error('Failed to show error message:', e);
            }
        }
    }
});

// メッセージリスナー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'exportToExcel') {
        exportToExcel(request.data)
            .then(() => sendResponse({ success: true }))
            .catch(error => {
                console.error('Export error:', error);
                sendResponse({ success: false });
            });
        return true; // 非同期レスポンスのために必要
    }
});

// ExcelデータをCSV形式に変換
function convertToCSV(data) {
    return data.map(row => {
        return row.map(cell => {
            // カンマやダブルクォートを含むセルの処理
            if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        }).join(',');
    }).join('\n');
}

// Excelファイルとしてエクスポートする
async function exportToExcel(data) {
    try {
        const csv = convertToCSV(data);
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8' });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `table_export_${timestamp}.csv`;

        // Blobをbase64エンコードする
        const reader = new FileReader();
        const base64data = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        // base64データをダウンロード
        await chrome.downloads.download({
            url: `data:text/csv;base64,${base64data}`,
            filename: filename,
            saveAs: true
        });

    } catch (error) {
        console.error('Export error:', error);
        throw error;
    }
} 