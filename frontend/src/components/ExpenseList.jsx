import { useState } from "react";

// カテゴリ別の色設定
const CATEGORY_COLORS = {
  食費: "#4CAF50",
  外食: "#FF9800",
  日用品: "#2196F3",
  交通費: "#9C27B0",
  衣類: "#E91E63",
  娯楽: "#00BCD4",
  医療費: "#F44336",
  その他: "#607D8B",
};

// 金額を日本円形式にフォーマット
const formatAmount = (amount) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(amount);

function ExpenseList({ receipts, onDeleteReceipt }) {
  // 展開中のレシートIDを管理
  const [expandedIds, setExpandedIds] = useState(new Set());

  // レシートの展開・折りたたみを切り替え
  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 削除確認ダイアログを表示してから削除
  const handleDelete = (id, storeName) => {
    if (window.confirm(`「${storeName || "このレシート"}」を削除しますか？`)) {
      onDeleteReceipt(id);
    }
  };

  return (
    <div className="expense-list">
      {receipts.map((receipt) => {
        const isExpanded = expandedIds.has(receipt.id);

        return (
          <div key={receipt.id} className="receipt-card">
            {/* レシートヘッダー（クリックで展開） */}
            <div className="receipt-header" onClick={() => toggleExpand(receipt.id)}>
              <div className="receipt-header-left">
                <span className="expand-icon">{isExpanded ? "▼" : "▶"}</span>
                <div className="receipt-info">
                  <span className="store-name">{receipt.storeName || "店舗不明"}</span>
                  <span className="receipt-date">
                    {receipt.date ? receipt.date.replace(/-/g, "/") : "日付不明"}
                  </span>
                </div>
              </div>
              <div className="receipt-header-right">
                <span className="receipt-total">{formatAmount(receipt.total || 0)}</span>
                {/* 削除ボタン（イベント伝播を止めてヘッダーのクリックと干渉しない） */}
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(receipt.id, receipt.storeName);
                  }}
                  aria-label="削除"
                  title="このレシートを削除"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* レシート詳細（展開時のみ表示） */}
            {isExpanded && receipt.items && receipt.items.length > 0 && (
              <div className="receipt-detail">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>商品名</th>
                      <th>カテゴリ</th>
                      <th className="amount-col">金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipt.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>
                          <span
                            className="category-badge"
                            style={{
                              backgroundColor:
                                CATEGORY_COLORS[item.category] || CATEGORY_COLORS["その他"],
                            }}
                          >
                            {item.category}
                          </span>
                        </td>
                        <td className="amount-col">{formatAmount(item.amount || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2} className="total-label">
                        合計
                      </td>
                      <td className="amount-col total-amount">
                        {formatAmount(receipt.total || 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ExpenseList;
