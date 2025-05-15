// import React from 'react';
// import AboutBackgroundImage from "../assets/undraw_moonlight_-5-ksn.svg";

// export default function About() {
//   return (
//     <div className="about-section-container">
//             <div className="about-section-image-container">
//               <img src={AboutBackgroundImage} alt="" style={{ marginTop: '-300px' }} />
//             </div>
//             <div className="about-section-text-container" style={{ marginTop: '-270px',marginLeft: '70px' }}>
//                 <p className="primary-subheading">about us</p>
//                 {/* <h1 className="primary-heading">
//                 CAWS—Collaborative Argument Writing System
//                 </h1> */}
//                 <p className="primary-text" style={{ fontSize: '24px' }}>
//                 CAWS is a groundbreaking collaborative writing platform designed to spark students' creativity and critical thinking. By seamlessly integrating AI technology with interactive learning modules, CAWS empowers students to effortlessly express their ideas, engage in discussions, and build compelling arguments. Whether in the classroom or through remote learning, CAWS helps students rapidly improve their writing skills, enhance their persuasive abilities, and boost their confidence. It’s not just a writing tool—it’s a platform that helps students become better communicators.
//                 </p>
//                 <div className="about-buttons-container">
//                   {/* <button className="secondary-button">Learn More</button>
//                   <button className="watch-video-button">
//                     <BsFillPlayCircleFill /> Watch Video
//                   </button> */}
//                 </div>
//             </div>
//         </div>
//   )
// }
import React from 'react';
import AboutBackgroundImage from "../assets/undraw_moonlight_-5-ksn.svg";

export default function About() {
  return (
    <div className="about-section-container">
        <div className="about-section-image-container">
          <img src={AboutBackgroundImage} alt="" />
        </div>
        <div className="about-section-text-container">
            <p className="primary-subheading">關於我們</p>
            <h1 className="primary-heading">
                「探究學習」一直是現代科學教育的重點
            </h1>
            <p className="primary-text">
                如何設計幫助學生形成想法、聚焦想法的合作科學探究教學活動，以及如何在教學中引導學生像科學家一樣思考與動手做，都將會是108課綱的實施成功與否的重要關鍵！
            </p>
            <div className="about-buttons-container">
              {/* <button className="secondary-button">Learn More</button>
              <button className="watch-video-button">
                <BsFillPlayCircleFill /> Watch Video
              </button> */}
            </div>
        </div>
    </div>
  )
}
