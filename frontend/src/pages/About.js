// import React from 'react';
// import AboutBackgroundImage from "../assets/undraw_moonlight_-5-ksn.svg";
// import Navbar from "../components/HomePage_Navbar";

// export default function About() {
//   return (
//      <div>
//       <Navbar />
     
//     <div className="about-section-container">
//         <div className="about-section-image-container">
//           <img src={AboutBackgroundImage} alt="" style={{ marginTop: '-300px' }} />
//         </div>
//         <div className="about-section-text-container" style={{ marginTop: '-270px',marginLeft: '70px' }}>
//             <p className="primary-subheading">about us</p>
//             {/* <h1 className="primary-heading">
//             CAWS—Collaborative Argument Writing System
//             </h1> */}
//             <p className="primary-text" style={{ fontSize: '24px' }}>
//             CAWS is a groundbreaking collaborative writing platform designed to spark students' creativity and critical thinking. By seamlessly integrating AI technology with interactive learning modules, CAWS empowers students to effortlessly express their ideas, engage in discussions, and build compelling arguments. Whether in the classroom or through remote learning, CAWS helps students rapidly improve their writing skills, enhance their persuasive abilities, and boost their confidence. It’s not just a writing tool—it’s a platform that helps students become better communicators.
//             </p>
//             <div className="about-buttons-container">
//               {/* <button className="secondary-button">Learn More</button>
//               <button className="watch-video-button">
//                 <BsFillPlayCircleFill /> Watch Video
//               </button> */}
//             </div>
//         </div>
//     </div>
//     </div>
//   )
// }



import React from 'react';
import Navbar from "../components/HomePage_Navbar";
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
                CAWS是一個突破性的協作寫作平台，專為激發學生的創意思維和批判性思考而設計。透過 AI 技術與互動學習模組的完美結合，CAWS 讓學生能夠輕鬆發揮他們的想法，進行討論並打造強而有力的論點。不論是在課堂中還是遠端學習，CAWS 都能讓學生快速提升寫作技巧，增強說服力，並建立自信。這不僅僅是一個寫作工具，而是一個幫助學生成為更出色溝通者的平台。 CAWS is a groundbreaking collaborative writing platform designed to spark students' creativity and critical thinking. By seamlessly integrating AI technology with interactive learning modules, CAWS empowers students to effortlessly express their ideas, engage in discussions, and build compelling arguments. Whether in the classroom or through remote learning, CAWS helps students rapidly improve their writing skills, enhance their persuasive abilities, and boost their confidence. It’s not just a writing tool—it’s a platform that helps students become better communicators.
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
