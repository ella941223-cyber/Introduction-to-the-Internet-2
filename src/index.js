import React from 'react';
import { createRoot } from 'react-dom/client';import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import AItest from './AItest';
import ItunesSearch from './ItunesSearch';

const el = document.getElementById('react-root');

if (el) {
    // 2. 創建根並渲染多個組件
    createRoot(el).render(
        <React.StrictMode>
            {/* 使用 React Fragment (<>...</>) 來包含所有您想顯示的組件 */}
            <>

                {/* 3. AI 聊天功能區塊 */}
                <hr style={{ margin: '20px 0', borderTop: '2px solid #ccc' }} />
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px 0' }}>
                    <h2 style={{ textAlign: 'center' }}>🤖 歡迎問問！</h2>
                    <AItest />
                </div>

                {/* 2. iTunes 搜尋功能區塊 */}
                {/* 使用 div 確保內容居中和樣式邊距 */}
                <hr style={{ margin: '20px 0', borderTop: '2px solid #ccc' }} />
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '10px 0' }}>
                    <h2 style={{ textAlign: 'center' }}>🎵 速速搜尋音樂！</h2>
                    <ItunesSearch />
                </div>
                
                {/* 確保網頁底部有足夠空間 */}
                <div style={{ height: '50px' }}></div>
            </>
        </React.StrictMode>
    );
}

// 報告效能指標
reportWebVitals();
