import { useState, useRef } from "react";
import axios from "axios";

// バックエンドAPIのURL
const API_URL = "http://localhost:3001/api/analyze-receipt";

function ReceiptUploader({ onReceiptAnalyzed }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // ファイルを選択したときの処理
  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください（JPEG、PNG、GIFなど）");
      return;
    }

    // プレビュー画像を生成
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // バックエンドにアップロードして解析
    uploadAndAnalyze(file);
  };

  // バックエンドへ画像をアップロードしてClaudeで解析する
  const uploadAndAnalyze = async (file) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("receipt", file);

    try {
      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        onReceiptAnalyzed(response.data.data);
        // アップロード成功後にプレビューをリセット
        setPreview(null);
      } else {
        setError("レシートの解析に失敗しました。もう一度お試しください。");
      }
    } catch (err) {
      const message =
        err.response?.data?.error || "サーバーとの通信に失敗しました。バックエンドが起動しているか確認してください。";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ドラッグ&ドロップのハンドラ
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  // ファイル選択ダイアログを開く
  const handleClick = () => {
    if (!isLoading) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="uploader">
      {/* ドラッグ&ドロップエリア */}
      <div
        className={`drop-zone ${isDragging ? "drag-over" : ""} ${isLoading ? "loading" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
        aria-label="レシート画像をアップロード"
      >
        {/* 非表示のファイル入力 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleFileSelect(e.target.files[0])}
        />

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Claude AIがレシートを解析中...</p>
          </div>
        ) : preview ? (
          <div className="preview-state">
            <img src={preview} alt="レシートプレビュー" className="receipt-preview" />
          </div>
        ) : (
          <div className="idle-state">
            <div className="upload-icon">📷</div>
            <p className="upload-text">レシートをここにドラッグ&ドロップ</p>
            <p className="upload-subtext">またはクリックして画像を選択</p>
            <p className="upload-note">JPEG・PNG・GIF対応 / 最大10MB</p>
          </div>
        )}
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="error-message">
          <span>⚠️</span> {error}
        </div>
      )}
    </div>
  );
}

export default ReceiptUploader;
