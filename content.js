let hoveredTable = null;

// テーブル要素上でのマウスホバーを検出
document.addEventListener('mouseover', (e) => {
    const table = findClosestTable(e.target);
    if (table && table !== hoveredTable) {
        if (hoveredTable) {
            hoveredTable.style.outline = '';
        }
        hoveredTable = table;
        table.style.outline = '2px solid #4CAF50';
        console.log('Table detected:', table); // デバッグ用
    }
});

document.addEventListener('mouseout', (e) => {
    const relatedTable = e.relatedTarget ? findClosestTable(e.relatedTarget) : null;
    if (hoveredTable && !relatedTable) {
        hoveredTable.style.outline = '';
        hoveredTable = null;
    }
});

// 最も近いテーブル要素を探す
function findClosestTable(element) {
    if (!element) return null;
    // 要素自体がテーブルの場合
    if (element.tagName === 'TABLE') {
        return element;
    }
    // 親要素をたどってテーブルを探す
    const table = element.closest('table');
    if (table) {
        return table;
    }
    // テーブルの子要素（td, th, tr）の場合
    if (['TD', 'TH', 'TR'].includes(element.tagName)) {
        return element.closest('table');
    }
    return null;
}

// テーブルデータを取得
function getTableData(table) {
    if (!table) {
        console.log('No table provided'); // デバッグ用
        return null;
    }

    try {
        const rows = Array.from(table.rows);
        console.log('Table rows:', rows.length); // デバッグ用
        const data = rows.map(row => {
            return Array.from(row.cells).map(cell => cell.textContent.trim());
        });
        console.log('Extracted data:', data); // デバッグ用
        return data;
    } catch (error) {
        console.error('Error extracting table data:', error); // デバッグ用
        return null;
    }
}

// メッセージを表示する関数
function showNotification(message, type) {
    // 既存の通知を削除
    const existingNotification = document.getElementById('table-export-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // 新しい通知を作成
    const notification = document.createElement('div');
    notification.id = 'table-export-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 4px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        z-index: 999999;
        transition: opacity 0.3s;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;

    if (type === 'error') {
        notification.style.backgroundColor = '#ffebee';
        notification.style.color = '#c62828';
        notification.style.border = '1px solid #ffcdd2';
    } else {
        notification.style.backgroundColor = '#e8f5e9';
        notification.style.color = '#2e7d32';
        notification.style.border = '1px solid #c8e6c9';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    // 3秒後に通知を消す
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// メッセージリスナー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'ping') {
        sendResponse({ status: 'alive' });
        return true;
    }
    
    if (request.action === 'getTableData') {
        if (!hoveredTable) {
            sendResponse({ error: 'ポイントされている箇所は表形式ではありません' });
            return true;
        }

        const tableData = getTableData(hoveredTable);
        if (!tableData || tableData.length === 0) {
            sendResponse({ error: 'テーブルデータの取得に失敗しました' });
            return true;
        }

        sendResponse({ data: tableData });
        return true;
    } else if (request.action === 'showError') {
        showNotification(request.message, 'error');
        return true;
    } else if (request.action === 'showSuccess') {
        showNotification(request.message, 'success');
        return true;
    }
}); 