import React from 'react';
import Navbar from "../components/Navbar_Student";
// import AboutBackgroundImage from "../assets/undraw_moonlight_-5-ksn.svg";
import AboutBackgroundImage from "../assets/貓頭鷹about.png";

export default function About() {
  return (
     <div>
      <Navbar />
      
    <div className="about-section-container" style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
        <div className="about-section-image-container">
          <img src={AboutBackgroundImage} alt="" className="about-img"/>
        </div>
        <div className="about-section-text-container" style={{ flex: 1.3, maxWidth: "1200px", width: "100%" }}>
            {/* <p className="primary-subheading">about us</p> */}
            <h1 className="primary-heading" style={{ maxWidth: "780px" }}>
                CAWS—Collaborative Argument Writing System (AI 合作論證寫作系統)
            </h1>
            <p className="primary-text" style={{ maxWidth: "780px", width: "100%" }}>
                CAWS 是一個 AI 支援的協作寫作平台，幫助學生從協作論證逐步發展到個人英文議論文寫作。透過互動討論、結構化寫作支持與 AI 引導，CAWS 協助學生整理想法、發展論點，並將小組討論成果轉化為個人文章。同時，教師也可以透過平台指派寫作任務、掌握學生學習歷程，並參考 AI 協助批改與評分回饋，提升教學與評量效率。CAWS 不只是寫作工具，更是促進批判思考、協作學習與有效教學的整合平台。<br/>CAWS is an AI-supported collaborative writing platform that helps students move from collaborative argumentation to individual English argumentative essay writing. Through interactive discussion, structured writing support, and AI-guided scaffolding, CAWS helps students organize ideas, develop arguments, and transform group discussion outcomes into individual essays. At the same time, teachers can use the platform to assign writing tasks, monitor students’ learning progress, and refer to AI-assisted feedback and scoring for evaluation and revision. More than a writing tool, CAWS is an integrated platform that supports critical thinking, collaborative learning, and effective teaching.


            </p>
            <div className="about-buttons-container">
              {/* <button className="secondary-button">Learn More</button>
              <button className="watch-video-button">
                <BsFillPlayCircleFill /> Watch Video
              </button> */}
            </div>
        </div>
    </div>
    </div>
  )
}
