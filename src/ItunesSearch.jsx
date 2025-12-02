// 檔案: src/components/ItunesSearch.jsx
import React, { useState } from 'react';
import './ItunesSearch.css'; 

const ItunesSearch = () => {
    // --- 狀態管理 ---
    const [searchTerm, setSearchTerm] = useState('TWICE'); // 預設搜尋詞
    const [results, setResults] = useState(null); // 儲存搜尋結果，null 表示未搜尋
    const [isLoading, setIsLoading] = useState(false); // 載入狀態

    // --- 搜尋函式：直接呼叫 iTunes 官方 API ---
    const handleSearch = async () => {
        if (!searchTerm) {
            alert('請輸入搜尋關鍵字！');
            return;
        }
        
        setIsLoading(true);
        setResults(null); // 清除舊結果

        // 構建 iTunes 官方 API 的 URL
        const itunesOfficialUrl = 'https://itunes.apple.com/search';
        
        // 構建查詢參數，使用瀏覽器內建的 URLSearchParams
        const params = new URLSearchParams({
            term: searchTerm,
            media: 'music',       // 搜尋媒體類型：音樂
            entity: 'song',       // 搜尋實體：歌曲
            country: 'TW',        // 商店地區：台灣
            limit: 8              // 限制 8 筆結果
        }).toString();
        
        const apiUrl = `${itunesOfficialUrl}?${params}`;
        
        try {
            // 🌟 直接呼叫 iTunes 官方伺服器 (無需後端代理)
            const response = await fetch(apiUrl); 
            
            if (!response.ok) {
                throw new Error(`iTunes API 請求失敗，狀態碼: ${response.status}`);
            }
            
            const data = await response.json();
            setResults(data.results);

        } catch (error) {
            console.error('iTunes 搜尋失敗:', error);
            // 顯示友善錯誤訊息
            setResults([]); // 設為空陣列表示搜尋失敗
        } finally {
            setIsLoading(false);
        }
    };

    // --- 渲染組件 ---
    return (
        <div className="itunes-search-container">
            <h2>🔍 直接輸入歌手或歌名就可以嚕~</h2>
            <div className="search-controls">
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="輸入歌手或歌曲名稱"
                    disabled={isLoading}
                    // 優化：點擊 Enter 鍵時觸發搜尋
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                    }}
                />
                <button 
                    onClick={handleSearch} 
                    disabled={isLoading || !searchTerm.trim()} // 沒有關鍵字時禁用
                >
                    {isLoading ? '搜尋中...' : '搜尋 iTunes'}
                </button>
            </div>

            <div className="itunes-results-list">
                {/* 載入狀態 */}
                {isLoading && <p className="loading-message">正在為您搜尋音樂...</p>}
                
                {/* 顯示結果列表 */}
                {results && results.length > 0 && (
                    <ul className="results-ul">
                        {results.map((item) => (
                            <li key={item.trackId} className="result-item">
                                <span className="track-name">{item.trackName}</span>
                                <span className="artist-album"> by {item.artistName} - {item.collectionName}</span>
                                <a 
                                    href={item.trackViewUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="itunes-link"
                                >
                                    在 iTunes 上查看
                                </a>
                            </li>
                        ))}
                    </ul>
                )}

                {/* 顯示無結果訊息 */}
                {results && results.length === 0 && !isLoading && (
                    <p className="no-results">沒有找到相關的音樂結果。</p>
                )}
            </div>
        </div>
    );
};

export default ItunesSearch;