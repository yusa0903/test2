import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

// Chart.jsに必要なコンポーネントを登録
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// カテゴリ別の色定義（円グラフ用）
const CATEGORY_COLORS = {
  食費: "rgba(76, 175, 80, 0.8)",
  外食: "rgba(255, 152, 0, 0.8)",
  日用品: "rgba(33, 150, 243, 0.8)",
  交通費: "rgba(156, 39, 176, 0.8)",
  衣類: "rgba(233, 30, 99, 0.8)",
  娯楽: "rgba(0, 188, 212, 0.8)",
  医療費: "rgba(244, 67, 54, 0.8)",
  その他: "rgba(96, 125, 139, 0.8)",
};

// 月別の棒グラフ用カラーパレット
const BAR_COLOR = "rgba(63, 120, 224, 0.75)";
const BAR_BORDER_COLOR = "rgba(63, 120, 224, 1)";

function Charts({ receipts, allReceipts }) {
  // ===== 円グラフ用データ（カテゴリ別集計）=====
  const categoryTotals = receipts.reduce((acc, receipt) => {
    (receipt.items || []).forEach((item) => {
      const cat = item.category || "その他";
      acc[cat] = (acc[cat] || 0) + (item.amount || 0);
    });
    return acc;
  }, {});

  const pieLabels = Object.keys(categoryTotals);
  const pieData = {
    labels: pieLabels,
    datasets: [
      {
        data: pieLabels.map((cat) => categoryTotals[cat]),
        backgroundColor: pieLabels.map((cat) => CATEGORY_COLORS[cat] || "rgba(158,158,158,0.8)"),
        borderColor: pieLabels.map((cat) =>
          (CATEGORY_COLORS[cat] || "rgba(158,158,158,0.8)").replace("0.8", "1")
        ),
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
        labels: { font: { size: 13 } },
      },
      title: {
        display: true,
        text: "カテゴリ別支出",
        font: { size: 16, weight: "bold" },
      },
      tooltip: {
        callbacks: {
          // ツールチップに金額と割合を表示
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const value = context.parsed;
            const pct = ((value / total) * 100).toFixed(1);
            return ` ${context.label}: ¥${value.toLocaleString("ja-JP")} (${pct}%)`;
          },
        },
      },
    },
  };

  // ===== 棒グラフ用データ（月別合計）=====
  // 全レシートから月別の合計を計算（フィルターなしの全データを使用）
  const monthlyTotals = allReceipts.reduce((acc, receipt) => {
    if (!receipt.date) return acc;
    const month = receipt.date.substring(0, 7); // YYYY-MM
    acc[month] = (acc[month] || 0) + (receipt.total || 0);
    return acc;
  }, {});

  // 月を昇順に並べ替え
  const monthLabels = Object.keys(monthlyTotals).sort();
  const barData = {
    labels: monthLabels.map((m) => m.replace("-", "年") + "月"),
    datasets: [
      {
        label: "月別支出合計",
        data: monthLabels.map((m) => monthlyTotals[m]),
        backgroundColor: BAR_COLOR,
        borderColor: BAR_BORDER_COLOR,
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "月別支出合計",
        font: { size: 16, weight: "bold" },
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ¥${context.parsed.y.toLocaleString("ja-JP")}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // Y軸を日本円形式で表示
          callback: (value) => "¥" + value.toLocaleString("ja-JP"),
        },
      },
    },
  };

  const hasPieData = pieLabels.length > 0;
  const hasBarData = monthLabels.length > 0;

  return (
    <div className="charts-container">
      {/* カテゴリ別円グラフ */}
      {hasPieData && (
        <div className="chart-wrapper">
          <Pie data={pieData} options={pieOptions} />
        </div>
      )}

      {/* 月別棒グラフ（複数月のデータがある場合のみ表示） */}
      {hasBarData && (
        <div className="chart-wrapper">
          <Bar data={barData} options={barOptions} />
        </div>
      )}

      {!hasPieData && !hasBarData && (
        <p className="empty-message">グラフを表示するデータがありません。</p>
      )}
    </div>
  );
}

export default Charts;
