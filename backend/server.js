// 環境変数の読み込み（APIキー等）
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
const PORT = 3001;

// CORSを許可（localhostからのリクエストをポート番号問わず受け付ける）
app.use(
  cors({
    origin: /^http:\/\/localhost(:\d+)?$/,
  })
);

// multerの設定：アップロードされた画像をメモリに保持する（ディスクへの保存は不要）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 最大10MB
  fileFilter: (req, file, cb) => {
    // 画像ファイルのみ許可
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("画像ファイルのみアップロード可能です"), false);
    }
  },
});

// AnthropicクライアントをAPIキーで初期化
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// レシート解析エンドポイント
// POST /api/analyze-receipt
// フロントエンドから画像を受け取り、Claude APIで解析して構造化データを返す
app.post("/api/analyze-receipt", upload.single("receipt"), async (req, res) => {
  // ファイルが添付されているか確認
  if (!req.file) {
    return res.status(400).json({ error: "レシート画像が必要です" });
  }

  // アップロードされた画像をBase64エンコードしてClaudeに送信できる形式に変換
  const base64Image = req.file.buffer.toString("base64");
  const mimeType = req.file.mimetype;

  // Claudeへのプロンプト：レシートの内容を指定のJSON形式で返すよう指示
  const prompt = `このレシート画像を読み取り、以下のJSON形式で情報を抽出してください。
JSONのみを返し、説明文は不要です。

{
  "date": "YYYY-MM-DD形式の購入日（不明な場合はnull）",
  "storeName": "店舗名",
  "items": [
    {
      "name": "商品名",
      "amount": 金額（数値、税込み）,
      "category": "カテゴリ（下記から最も適切なものを選択）"
    }
  ],
  "total": 合計金額（数値）
}

カテゴリの選択肢：
- 食費（スーパー・コンビニ・食材など）
- 外食（レストラン・カフェ・ファストフードなど）
- 日用品（洗剤・トイレットペーパー・消耗品など）
- 交通費（電車・バス・タクシー・ガソリンなど）
- 衣類（服・靴・アクセサリーなど）
- 娯楽（映画・ゲーム・趣味など）
- 医療費（薬・病院・サプリメントなど）
- その他（上記に当てはまらないもの）

注意事項：
- 金額は税込みの数値のみ（カンマや円記号は除く）
- 日付が不明の場合はnullにする
- 商品名が読み取れない場合は「不明な商品」とする
- 合計金額が明記されていない場合は各商品の合計を計算する`;

  try {
    // Claude Haiku（最新バージョン）でレシート画像を解析
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              // 画像データをBase64エンコードして送信
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    // Claudeのレスポンスからテキスト部分を取得
    const responseText = response.content[0].text;

    // JSONのみを抽出（```json ... ``` のコードブロックが含まれる場合に対応）
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("レシートのJSON解析に失敗しました");
    }

    const receiptData = JSON.parse(jsonMatch[0]);

    // 解析結果をフロントエンドに返す
    res.json({ success: true, data: receiptData });
  } catch (error) {
    console.error("Claude API呼び出しエラー:", error);
    res.status(500).json({
      error: "レシートの解析に失敗しました",
      details: error.message,
    });
  }
});

// サーバーの動作確認用エンドポイント
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "レシート家計簿バックエンドが起動中" });
});

// サーバーを指定ポートで起動
app.listen(PORT, () => {
  console.log(`バックエンドサーバーが起動しました: http://localhost:${PORT}`);
  console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "設定済み" : "未設定"}`);
});
