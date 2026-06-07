import { useState, useEffect } from "react";
import ReceiptUploader from "./components/ReceiptUploader";
import ExpenseList from "./components/ExpenseList";
import Charts from "./components/Charts";
import CategorySummary from "./components/CategorySummary";

// localStorageのキー
const STORAGE_KEY = "receipt-kakeibo-data";

function App() {
  // 登録済みレシートの一覧（localStorageから初期値を読み込む）
  const [receipts, setReceipts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 表示する月のフィルター（YYYY-MM形式、空文字で全期間表示）
  const [selectedMonth, setSelectedMonth] = useState("");

  // receiptsが変わるたびにlocalStorageへ保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
  }, [receipts]);

  // バックエンドから解析結果を受け取ってレシートを追加
  const handleReceiptAnalyzed = (receiptData) => {
    const newReceipt = {
      id: Date.now(), // 一意のIDとしてタイムスタンプを使用
      ...receiptData,
    };
    setReceipts((prev) => [newReceipt, ...prev]);
  };

  // レシートを削除
  const handleDeleteReceipt = (id) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
  };

  // 月フィルターに基づいてレシートを絞り込む
  const filteredReceipts = selectedMonth
    ? receipts.filter((r) => r.date && r.date.startsWith(selectedMonth))
    : receipts;

  // 利用可能な月の一覧を生成（レシートデータから抽出）
  const availableMonths = [
    ...new Set(
      receipts
        .filter((r) => r.date)
        .map((r) => r.date.substring(0, 7))
        .sort()
        .reverse()
    ),
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>レシート家計簿</h1>
        <p className="app-subtitle">レシートをアップロードして自動で家計を管理</p>
      </header>

      <main className="app-main">
        {/* レシートアップロードセクション */}
        <section className="section">
          <h2>レシートを追加</h2>
          <ReceiptUploader onReceiptAnalyzed={handleReceiptAnalyzed} />
        </section>

        {/* 月フィルター */}
        {receipts.length > 0 && (
          <section className="section filter-section">
            <label htmlFor="month-filter">表示月：</label>
            <select
              id="month-filter"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="month-select"
            >
              <option value="">全期間</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {month.replace("-", "年")}月
                </option>
              ))}
            </select>
          </section>
        )}

        {/* グラフとカテゴリ集計（データがある場合のみ表示） */}
        {filteredReceipts.length > 0 && (
          <>
            <section className="section">
              <h2>カテゴリ別集計</h2>
              <CategorySummary receipts={filteredReceipts} />
            </section>

            <section className="section">
              <h2>グラフ</h2>
              <Charts receipts={filteredReceipts} allReceipts={receipts} />
            </section>
          </>
        )}

        {/* レシート一覧 */}
        <section className="section">
          <h2>レシート一覧</h2>
          {filteredReceipts.length === 0 ? (
            <p className="empty-message">
              {receipts.length === 0
                ? "レシートがまだ登録されていません。上からアップロードしてください。"
                : "選択した月のレシートはありません。"}
            </p>
          ) : (
            <ExpenseList
              receipts={filteredReceipts}
              onDeleteReceipt={handleDeleteReceipt}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
