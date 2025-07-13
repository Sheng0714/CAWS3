// import React, { useEffect, useRef } from "react";
// import { Typography, Paper, Box } from "@mui/material";
// import { styled } from "@mui/system";
// import Navbar from "../components/Navbar_Teacher";

// // 定義樣式容器
// const EditorContainer = styled(Box)({
//   margin: "20px",
//   padding: "20px",
//   display: "flex",
//   flexDirection: "column",
//   gap: "40px",
// });

// const Editortest = () => {
//   const trixRef = useRef(null);

//   useEffect(() => {
//     let isMounted = true;

//     const loadScript = (src, id) => {
//       return new Promise((resolve, reject) => {
//         if (document.getElementById(id)) {
//           resolve();
//           return;
//         }
//         const script = document.createElement("script");
//         script.src = src;
//         script.id = id;
//         script.async = true;
//         script.onload = resolve;
//         script.onerror = () => reject(new Error(`Failed to load ${src}`));
//         document.body.appendChild(script);
//       });
//     };

//     const loadStyle = (href, id) => {
//       if (document.getElementById(id)) return Promise.resolve();
//       return new Promise((resolve) => {
//         const link = document.createElement("link");
//         link.href = href;
//         link.rel = "stylesheet";
//         link.id = id;
//         link.onload = resolve;
//         document.head.appendChild(link);
//       });
//     };

//     // 加載 Trix 資源
//     Promise.all([
//       loadStyle("https://unpkg.com/trix@2.0.8/dist/trix.css", "trix-style"),
//       loadScript("https://unpkg.com/trix@2.0.8/dist/trix.umd.min.js", "trix-script"),
//     ])
//       .then(() => {
//         if (!isMounted || !trixRef.current || !window.Trix) return;

//         // 監聽 trix-initialize 事件
//         trixRef.current.addEventListener("trix-initialize", () => {
//           console.log("Trix initialized successfully");
//         }, { once: true });

//         // 若未自動初始化，強制觸發
//         const observer = new MutationObserver(() => {
//           if (trixRef.current.editor) {
//             console.log("Trix editor detected");
//             observer.disconnect();
//           } else {
//             console.warn("Trix not initialized, forcing refresh");
//             trixRef.current.innerHTML = ""; // 清空並觸發重新初始化
//           }
//         });
//         observer.observe(trixRef.current, { childList: true, subtree: true });
//       })
//       .catch((error) => console.error("Trix resource loading error:", error));

//     // 清理函數
//     return () => {
//       isMounted = false;
//       const scripts = ["trix-script"];
//       const styles = ["trix-style"];
//       scripts.forEach((id) => {
//         const script = document.getElementById(id);
//         if (script) document.body.removeChild(script);
//       });
//       styles.forEach((id) => {
//         const style = document.getElementById(id);
//         if (style) document.head.removeChild(style);
//       });
//     };
//   }, []);

//   return (
//     <div>
//       <Navbar />
//       <EditorContainer>
//         <Paper elevation={3} style={{ padding: "20px" }}>
//           <Typography variant="h5" gutterBottom>
//             Trix Editor
//           </Typography>
//           <trix-editor ref={trixRef} autofocus placeholder="Start writing here..." />
//         </Paper>
//       </EditorContainer>
//     </div>
//   );
// };

// export default Editortest;


import React, { useEffect, useRef } from "react";
import { Typography, Paper, Box } from "@mui/material";
import { styled } from "@mui/system";
import Navbar from "../components/Navbar_Teacher";

// 定義樣式容器
const EditorContainer = styled(Box)({
  margin: "20px",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "40px",
});

const Editortest = () => {
  const trixRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadScript = (src, id) => {
      return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.id = id;
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
      });
    };

    const loadStyle = (href, id) => {
      if (document.getElementById(id)) return Promise.resolve();
      return new Promise((resolve) => {
        const link = document.createElement("link");
        link.href = href;
        link.rel = "stylesheet";
        link.id = id;
        link.onload = resolve;
        document.head.appendChild(link);
      });
    };

    // 加載 Trix 和 Quill 資源
    Promise.all([
      loadStyle("https://unpkg.com/trix@2.0.8/dist/trix.css", "trix-style"),
      loadScript("https://unpkg.com/trix@2.0.8/dist/trix.umd.min.js", "trix-script"),
      loadStyle("https://cdn.jsdelivr.net/npm/quill@2/dist/quill.snow.css", "quill-style"),
      loadScript("https://cdn.jsdelivr.net/npm/quill@2/dist/quill.js", "quill-script"),
    ])
      .then(() => {
        if (!isMounted) return;

        // 初始化 Trix
        if (trixRef.current && window.Trix) {
          trixRef.current.addEventListener("trix-initialize", () => {
            console.log("Trix initialized successfully");
          }, { once: true });

          const observer = new MutationObserver(() => {
            if (trixRef.current.editor) {
              console.log("Trix editor detected");
              observer.disconnect();
            } else {
              console.warn("Trix not initialized, forcing refresh");
              trixRef.current.innerHTML = "";
            }
          });
          observer.observe(trixRef.current, { childList: true, subtree: true });
        }

        // 初始化 Quill
        if (quillRef.current && window.Quill) {
          new window.Quill(quillRef.current, {
            theme: "snow",
            modules: {
              toolbar: [
                [{ header: [1, 2, false] }],
                ["bold", "italic"],
              ],
            },
          });
          console.log("Quill initialized successfully");
        } else {
          console.error("Quill not available");
        }
      })
      .catch((error) => console.error("Resource loading error:", error));

    // 清理函數
    return () => {
      isMounted = false;
      const scripts = ["trix-script", "quill-script"];
      const styles = ["trix-style", "quill-style"];
      scripts.forEach((id) => {
        const script = document.getElementById(id);
        if (script) document.body.removeChild(script);
      });
      styles.forEach((id) => {
        const style = document.getElementById(id);
        if (style) document.head.removeChild(style);
      });
    };
  }, []);

  return (
    <div>
      <Navbar />
      <EditorContainer>
        <Paper elevation={3} style={{ padding: "20px" }}>
          <Typography variant="h5" gutterBottom>
            Trix Editor
          </Typography>
          <trix-editor ref={trixRef} autofocus placeholder="Start writing here..." />
        </Paper>
        <Paper elevation={3} style={{ padding: "20px" }}>
          <Typography variant="h5" gutterBottom>
            Quill.js Editor
          </Typography>
          <div ref={quillRef} style={{ minHeight: "200px" }}>
            <p>Hello World!</p>
            <p>Some initial <strong>bold</strong> text</p>
            <p><br /></p>
          </div>
        </Paper>
      </EditorContainer>
    </div>
  );
};

export default Editortest;