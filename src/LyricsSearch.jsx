// 檔案: src/components/LyricsSearch.jsx
import React, { useState } from 'react';
import './LyricsSearch.css'; // 假設您會建立一個搭配的 CSS 檔案

const LyricsSearch = () => {
    // --- 狀態管理 ---
    const [artist, setArtist] = useState('');
    const [title, setTitle] = useState('');
    const [lyrics, setLyrics] = useState(null); // 儲存歌詞文本
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- 搜尋歌詞函式 ---
    const handleSearchLyrics = async () => {
        if (!artist.trim() || !title.trim()) {
            setError('請同時輸入歌手和歌名！');
            return;
        }

        setIsLoading(true);
        setError(null);
        setLyrics(null);

        // 對輸入進行 URL 編碼，以處理空格和特殊字符
        const encodedArtist = encodeURIComponent(artist.trim());
        const encodedTitle = encodeURIComponent(title.trim());

        // 構建 Lyrics.ovh API 的 URL
        const apiUrl = `https://api.lyrics.ovh/v1/${encodedArtist}/${encodedTitle}`;
        
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!response.ok || data.error) {
                // API 找不到歌詞時，會返回 JSON 錯誤訊息
                throw new Error(data.error || '找不到該歌曲的歌詞。');
            }

            // 成功獲取歌詞 (API 返回的 key 是 'lyrics')
            setLyrics(data.lyrics);

        } catch (err) {
            console.error("Lyrics API 呼叫失敗:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- 渲染組件 ---
    return (
        <div className="lyrics-search-container">
            <h2>🎤 找歌詞一起邊跳邊唱吧</h2>
            <div className="search-controls">
                <input 
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="歌手名稱 (e.g., Taylor Swift)"
                    disabled={isLoading}
                />
                <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="歌曲名稱 (e.g., Lover)"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearchLyrics();
                    }}
                />
                <button 
                    onClick={handleSearchLyrics} 
                    disabled={isLoading}
                >
                    {isLoading ? '搜尋中...' : '找歌詞'}
                </button>
            </div>

            {error && (
                <div className="lyrics-error-box">
                    {error}
                </div>
            )}
            
            <div className="lyrics-output">
                {isLoading && <p>正在尋找歌詞...</p>}
                
                {lyrics && (
                    <div className="lyrics-content">
                        <h3>{artist} - {title}</h3>
                        {/* 使用 whiteSpace: 'pre-wrap' 來保留換行符號 */}
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                            {lyrics}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LyricsSearch;