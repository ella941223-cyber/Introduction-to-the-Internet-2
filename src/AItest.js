import { GoogleGenAI } from '@google/genai';
import React, { useEffect, useMemo, useRef, useState } from 'react';

// ⚠️ 移除：TypeScript 型別定義 (type Part, type ChatMsg)
// JavaScript 運行時會自動推斷型別

// ⚠️ 移除：Props 型別定義 (type Props)

export default function AItest({
  // ⚠️ 移除：Props 的型別註解
  defaultModel = 'gemini-2.5-flash',
  starter = '嗨！幫我測試一下台北旅遊的一日行程～',
}) {
  // ⚠️ 移除：useState 的型別註解 (<string>, <ChatMsg[]>)
  const [model, setModel] = useState(defaultModel);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [rememberKey, setRememberKey] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // ⚠️ 移除：useRef 的型別註解
  const listRef = useRef(null);

  // Load key from localStorage (for demo only — never ship an exposed key in production)
  useEffect(() => {
    const saved = localStorage.getItem('AIzaSyAomqgeLZHcRnHe4MEdB3c66-4tcXT3dL4');
    if (saved) setApiKey(saved);
  }, []);

  // Warm welcome + starter
  useEffect(() => {
    // 這裡我們假設 ChatMsg 是一個簡單的 JavaScript Object
    setHistory([{ role: 'model', parts: [{ text: '👋 這裡是 Gemini 小幫手，有什麼想聊的？' }] }]);
    if (starter) setInput(starter);
  }, [starter]);

  // auto-scroll to bottom
  useEffect(() => {
    const el = listRef.current; 
    if (!el) return; 
    // TypeScript/JSX 中，current 是一個 HTMLDivElement | null。在 JS 中，我們直接假設它是一個 Element。
    el.scrollTop = el.scrollHeight; 
  }, [history, loading]);

  const ai = useMemo(() => {
    try {
      // GoogleGenAI 仍然需要 apiKey
      return apiKey ? new GoogleGenAI({ apiKey }) : null;
    } catch {
      return null;
    }
  }, [apiKey]);

  // 新增 clearHistory 函數 
  function clearHistory() {
    // 避免在 AI 正在思考時清除歷史
    if (loading) return; 
    // 彈出確認視窗
    if (window.confirm('確定要清除所有聊天紀錄並重新開始嗎？')) {
      // 重設 history，留下一個新的歡迎訊息
      setHistory([{ role: 'model', parts: [{ text: '👋 紀錄都清除囉！可以開始新的對話了，需要什麼幫忙呢？' }] }]);
      setError('');
      setInput(''); // 清空輸入框內容
    }
  }

  async function sendMessage(message) {
    const content = (message ?? input).trim();
    if (!content || loading) return;
    if (!ai) { setError('請先輸入有效的 Gemini API Key'); return; }

    setError('');
    setLoading(true);

    // 這裡我們使用普通的 JavaScript Object
    const newHistory = [...history, { role: 'user', parts: [{ text: content }] }];
    setHistory(newHistory);
    setInput('');

    try {
      // Use the official SDK directly in the browser
      const resp = await ai.models.generateContent({
        model,
        contents: newHistory, // send the chat history to keep context
      });

      const reply = resp.text || '[No content]';
      setHistory(h => [...h, { role: 'model', parts: [{ text: reply }] }]);
    } catch (err) {
      // ⚠️ 移除：型別註解 (any)
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  function renderMarkdownLike(text) {
    const lines = text.split(/\n/);
    return (
      <>
        {lines.map((ln, i) => (
          <div key={i} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{ln}</div>
        ))}
      </>
    );
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        {/* 修改 Header 內容 */}
        <div style={styles.header}>
            <span>Gemini Chat（直連 SDK，不經 proxy）</span>
            <button 
                type="button" 
                onClick={clearHistory} 
                style={styles.clearBtn}
                disabled={loading} // 載入中時禁用
            >
                🗑️ 清除對話
            </button>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          <label style={styles.label}>
            <span>Model</span>
            <input
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="例如 gemini-2.5-flash、gemini-2.5-pro"
              style={styles.input}
            />
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              模型名稱會隨時間更新，若錯誤請改成官方清單中的有效 ID。
            </div>
          </label>

          <label style={styles.label}>
            <span>Gemini API Key</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                const v = e.target.value; setApiKey(v);
                if (rememberKey) localStorage.setItem('gemini_api_key', v);
              }}
              placeholder="貼上你的 API Key（只在本機瀏覽器儲存）"
              style={styles.input}
            />
            <label style={{ display:'flex', alignItems:'center', gap:8, marginTop:6, fontSize:12 }}>
              <input type="checkbox" checked={rememberKey} onChange={(e)=>{
                setRememberKey(e.target.checked);
                if (!e.target.checked) localStorage.removeItem('gemini_api_key');
                else if (apiKey) localStorage.setItem('gemini_api_key', apiKey);
              }} />
              <span>記住在本機（localStorage）</span>
            </label>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              Demo 用法：在瀏覽器內保存 Key 僅供教學。正式環境請改走後端或使用安全限制的 Key。
            </div>
          </label>
        </div>

        {/* Messages */}
        <div ref={listRef} style={styles.messages}>
          {history.map((m, idx) => (
            <div key={idx} style={{ ...styles.msg, ...(m.role === 'user' ? styles.user : styles.assistant) }}>
              <div style={styles.msgRole}>{m.role === 'user' ? 'You' : 'Gemini'}</div>
              <div style={styles.msgBody}>{renderMarkdownLike(m.parts.map(p => p.text).join('\n'))}</div>
            </div>
          ))}
          {loading && (
            <div style={{ ...styles.msg, ...styles.assistant }}>
              <div style={styles.msgRole}>Gemini</div>
              <div style={styles.msgBody}>思考中…</div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={styles.error}>⚠ {error}</div>
        )}

        {/* Composer */}
        <form
          onSubmit={e => { e.preventDefault(); sendMessage(); }}
          style={styles.composer}
        >
          <input
            placeholder="輸入訊息，按 Enter 送出"
            value={input}
            onChange={e => setInput(e.target.value)}
            style={styles.textInput}
          />
          <button type="submit" disabled={loading || !input.trim() || !apiKey} style={styles.sendBtn}>
            送出
          </button>
        </form>

        {/* Quick examples */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {['今天台北有什麼免費展覽？', '幫我把這段英文翻成中文：Hello from Taipei!', '寫一首關於捷運的短詩'].map((q) => (
            <button key={q} type="button" style={styles.suggestion} onClick={() => sendMessage(q)}>{q}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 新增新的主題色 (薄荷綠)
const PRIMARY_COLOR = '#00bfa5'; // 薄荷綠
const LIGHT_BG = '#e0f2f1'; // 淺薄荷綠背景

// ⚠️ 移除：styles 宣告中的 Record<string, React.CSSProperties> 型別註解
const styles = {
  wrap: { display: 'grid', placeItems: 'start', padding: 16 },
  card: {
    width: 'min(900px, 100%)',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    padding: '10px 12px',
    fontWeight: 700,
    borderBottom: '1px solid #e5e7eb',
    background: LIGHT_BG, // 標頭變色
    display: 'flex', // 為了放按鈕
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // 新增 clearBtn 樣式 
  clearBtn: {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid #e0e0e0',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 12,
    color: '#ef4444', // 使用紅色警示色
    transition: 'background-color 0.2s',
  },
  controls: {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: '1fr 1fr',
    padding: 12,
  },
  label: { display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 },
  input: { padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14 },
  messages: { padding: 12, display: 'grid', gap: 10, maxHeight: 420, overflow: 'auto' },
  msg: { borderRadius: 12, padding: 10, border: '1px solid #e5e7eb' },
  user: {
    background: '#e8f5e9', // 淺綠色用戶訊息
    borderColor: '#a5d6a7',
  },
  assistant: {
    background: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  msgRole: { fontSize: 12, fontWeight: 700, opacity: 0.7, marginBottom: 6 },
  msgBody: { fontSize: 14, lineHeight: 1.5 },
  error: { color: '#b91c1c', padding: '4px 12px' },
  composer: { padding: 12, display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, borderTop: '1px solid #e5e7eb' },
  textInput: { padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14 },
  sendBtn: {
    padding: '10px 14px',
    borderRadius: 999,
    border: `1px solid ${PRIMARY_COLOR}`,
    background: PRIMARY_COLOR, // 按鈕變色
    color: '#fff',
    fontSize: 14,
    cursor: 'pointer'
  },
  suggestion: { padding: '6px 10px', borderRadius: 999, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontSize: 12 },
};