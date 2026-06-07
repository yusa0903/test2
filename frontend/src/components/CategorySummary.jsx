// カテゴリ別の色とアイコンの定義
const CATEGORY_CONFIG = {
  食費: { color: "#4CAF50", icon: "🛒" },
  外食: { color: "#FF9800", icon: "🍽️" },
  日用品: { color: "#2196F3", icon: "🧴" },
  交通費: { color: "#9C27B0", icon: "🚃" },
  衣類: { color: "#E91E63", icon: "👕" },
  娯楽: { color: "#00BCD4", icon: "🎮" },
  医療費: { color: "#F44336", icon: "💊" },
  その他: { color: "#607D8B", icon: "📦" },
};

// 金額を日本円形式にフォーマット
const formatAmount = (amount) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(amount);

function CategorySummary({ receipts }) {
  // レシート内の全商品からカテゴリ別合計を計算
  const categoryTotals = receipts.reduce((acc, receipt) => {
    (receipt.items || []).forEach((item) => {
      const category = item.category || "その他";
      acc[category] = (acc[category] || 0) + (item.amount || 0);
    });
    return acc;
  }, {});

  // 合計金額（全カテゴリの合計）
  const grandTotal = Object.values(categoryTotals).reduce((sum, v) => sum + v, 0);

  // 金額の多い順にカテゴリを並べ替え
  const sortedCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);

  if (sortedCategories.length === 0) {
    return <p className="empty-message">集計データがありません。</p>;
  }

  return (
    <div className="category-summary">
      {/* カテゴリ別カード */}
      <div className="category-cards">
        {sortedCategories.map(([category, total]) => {
          const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG["その他"];
          // 全体に占める割合を計算
          const percentage = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(1) : 0;

          return (
            <div
              key={category}
              className="category-card"
              style={{ borderLeftColor: config.color }}
            >
              <div className="category-card-header">
                <span className="category-icon">{config.icon}</span>
                <span className="category-name">{category}</span>
                <span className="category-percentage">{percentage}%</span>
              </div>
              <div className="category-amount">{formatAmount(total)}</div>
              {/* 割合を視覚的に示すプログレスバー */}
              <div className="category-bar-bg">
                <div
                  className="category-bar"
                  style={{ width: `${percentage}%`, backgroundColor: config.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 合計表示 */}
      <div className="grand-total">
        <span>合計支出：</span>
        <span className="grand-total-amount">{formatAmount(grandTotal)}</span>
      </div>
    </div>
  );
}

export default CategorySummary;
