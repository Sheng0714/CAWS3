// import React from 'react';
// import AboutBackgroundImage from "../assets/undraw_moonlight_-5-ksn.svg";
// import Navbar from "../components/Navbar_Student";


// export default function Manual() {
//   return (
//     <div>
//       <Navbar/>
    
    
//     </div>
//   )
// }

import React, { useState } from "react";
import Navbar from "../components/Navbar_Student";

// 匯入圖片
import login1 from "../assets/圖片1.png";
import login2 from "../assets/圖片2.png";
import writing1 from "../assets/圖片3.png";
import writing2 from "../assets/圖片4.png";
import writing3 from "../assets/圖片5.png";
import writing4 from "../assets/圖片6.png";
import writing5 from "../assets/圖片7.png";
import writing6 from "../assets/圖片8.png";
import kf1 from "../assets/圖片9.png";
import kf2 from "../assets/圖片10.png";
import kf3 from "../assets/圖片11.png";
import kf4 from "../assets/圖片12.png";
import AI1 from "../assets/圖片13.png";
import AI2 from "../assets/圖片14.png";
import AI3 from "../assets/圖片15.png";
import AI4 from "../assets/圖片16.png";
import AI5 from "../assets/圖片17.png";
import AI6 from "../assets/圖片18.png";
import AI7 from "../assets/圖片19.png";
import AI8 from "../assets/圖片20.png";
import AI9 from "../assets/圖片21.png";
import AI10 from "../assets/圖片22.png";
import AI11 from "../assets/圖片23.png";
import AI12 from "../assets/圖片24.png";
import AI13 from "../assets/圖片25.png";
import AI14 from "../assets/圖片26.png";

export default function Manual() {
  const [activeCategory, setActiveCategory] = useState("frontend");

  // 每個分類對應多張圖片（陣列）
  const images = {
    frontend: [login1, login2],
    kf: [kf1, kf2, kf3, kf4],
    backend: [writing1, writing2, writing3, writing4, writing5, writing6],
    deploy: [AI1, AI2, AI3, AI4, AI5, AI6, AI7, AI8, AI9, AI10, AI11, AI12, AI13, AI14],
  };

  const categories = [
    { id: "frontend", name: "Login" },
    { id: "kf", name: "KF" },
    { id: "backend", name: "Writing" },
    { id: "deploy", name: "AI model" },
  ];

  // 輔助函數：獲取按鈕樣式
  const getButtonStyle = (isActive) => ({
    padding: '0.5rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: isActive ? '#2563eb' : '#e5e7eb',
    color: isActive ? '#ffffff' : '#374151',
    ...(isActive ? { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' } : {}),
  });

  return (
    <div style={{
      minHeight: '100vh',
      // backgroundColor: '#f9fafb',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Navbar />
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '1024px',
          width: '100%'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#374151',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            Manual Categories
          </h1>

          {/* 分類按鈕 */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            width: '100%'
          }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={getButtonStyle(activeCategory === cat.id)}
                onMouseEnter={(e) => {
                  if (activeCategory !== cat.id) {
                    e.target.style.backgroundColor = '#d1d5db';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCategory !== cat.id) {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 圖片顯示區：垂直排列，圖片自適應寬度，高度自動；背景改為淺灰 */}
          <div style={{
            backgroundColor: '#f9fafb',  // 改為原灰色調，而不是白色
            padding: '1.5rem',
            borderRadius: '1rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            width: '100%',
            maxWidth: '700px'
          }}>
            {images[activeCategory].map((imgSrc, idx) => (
              <div
                key={idx}
                style={{
                  width: '100%',
                  maxWidth: '700px',
                  overflow: 'hidden',
                  borderRadius: '0.75rem'
                }}
              >
                <img
                  src={imgSrc}
                  alt={`${activeCategory}-${idx}`}
                  style={{
                    width: '100%',
                    height: 'auto',  // 自動高度，保持比例
                    display: 'block'  // 避免圖片底部有空白
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}