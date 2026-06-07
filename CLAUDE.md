# CLAUDE.md

このファイルはClaude Codeがプロジェクトを操作する際のルールと指針を定めています。

---

## プロジェクト概要

- **作業ディレクトリ**: `C:\temp\claude code1`
- **アプリケーション**: レシート家計簿アプリ（レシート画像をアップロードしてAIが内容を解析・集計）
- **構成**: フロントエンド / バックエンド 分離構成

---

## リポジトリ

- **GitHubリポジトリ**: https://github.com/yusa0903/test2
- **プッシュ先**: `git push origin main`

---

## 技術スタック

| 役割 | 技術 |
|---|---|
| フロントエンドフレームワーク | React 18 |
| フロントエンドビルドツール | Vite 6 |
| フロントエンド言語 | JavaScript (JSX) |
| HTTPクライアント | axios |
| グラフ描画 | chart.js / react-chartjs-2 |
| バックエンドフレームワーク | Express 4 |
| バックエンドランタイム | Node.js |
| AI推論 | Anthropic Claude API (`@anthropic-ai/sdk`) |
| ファイルアップロード | multer（メモリストレージ） |
| 環境変数 | dotenv |

---

## ディレクトリ構成

```
claude code1/
├── backend/
│   ├── server.js        # Expressサーバー（ポート3001）
│   ├── package.json
│   └── .env             # ANTHROPIC_API_KEY 等（コミット禁止）
└── frontend/
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── App.css
    │   └── components/
    │       ├── ReceiptUploader.jsx
    │       ├── ExpenseList.jsx
    │       ├── CategorySummary.jsx
    │       └── Charts.jsx
    ├── vite.config.js
    └── package.json
```

---

## 開発サーバーの起動

```bash
# バックエンド（backend/ ディレクトリで実行）
npm run dev   # node --watch server.js でポート3001起動

# フロントエンド（frontend/ ディレクトリで実行）
npm run dev   # Vite開発サーバー http://localhost:5173 起動
```

CORSはバックエンドで `localhost` の全ポートを許可済み（正規表現で制御）。

---

## コンポーネント命名規則

- **ファイル名**: PascalCase（例: `ReceiptUploader.jsx`, `ExpenseList.jsx`）
- **コンポーネント名**: ファイル名と一致させる（例: `function ReceiptUploader()`）
- **CSSクラス名**: kebab-case（例: `expense-list`, `upload-btn`）
- **状態変数**: camelCase（例: `expenses`, `isLoading`, `chartData`）
- **イベントハンドラ**: `handle` プレフィックス（例: `handleUpload`, `handleDelete`）

---

## Git運用ルール

> **必須**: コードを1ファイルでも変更したら、作業完了後に必ずコミット＆プッシュすること。
> プッシュを省略・後回しにしてはならない。

### コミット＆プッシュ手順（毎回必ず実行）

```bash
git status                        # 変更ファイルを確認
git add <変更したファイル>          # 関連ファイルのみをステージング
git commit -m "<プレフィックス>: <内容>"
git push origin main              # 必ずプッシュまで完了させる
```

### コミットメッセージ規約

| プレフィックス | 用途 |
|---|---|
| `feat:` | 新機能の追加 |
| `fix:` | バグ修正 |
| `refactor:` | リファクタリング |
| `docs:` | ドキュメント変更 |
| `chore:` | ビルド・設定変更 |
| `test:` | テスト追加・修正 |

例: `feat: レシート画像のカテゴリ分類機能を追加`

### ブランチ運用
- `main`: 本番ブランチ。このブランチに直接プッシュする
- 機能追加・バグ修正ともに `main` ブランチで作業する（小規模プロジェクトのため）

### 禁止事項
- `--force` プッシュは原則禁止（ユーザーの明示的な指示がある場合のみ可）
- `--no-verify` によるフック無効化は禁止
- `.env` や認証情報（`ANTHROPIC_API_KEY` 等）を含むファイルのコミットは禁止
- `git add .` や `git add -A` の使用禁止（意図しないファイルの混入を防ぐため）

---

## コーディング規約

- 過度なエンジニアリングを避け、シンプルな実装を優先する
- 不要なコメント・ドキュメントは追加しない
- エラーハンドリングは実際に発生しうる箇所のみに限定する
- 使われていないコードは削除する

---

## 注意事項

- ファイルを編集する前に必ず読み込んでから変更する
- 破壊的な操作（ファイル削除、ブランチ削除など）は実行前にユーザーへ確認する
- `.env` ファイルは絶対にコミットしない（`.gitignore` に含まれているか常に確認する）
- 新規ファイルの作成は本当に必要な場合のみ行う
