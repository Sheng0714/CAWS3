import React, { useMemo, useState } from "react";
import Navbar from "../components/Navbar_Student";

const assetsContext = require.context(
  "../assets",
  false,
  /\.(png|jpe?g|gif|svg|webp)$/i
);

const assetMap = assetsContext.keys().reduce((acc, key) => {
  const fileName = key.replace("./", "");
  const baseName = fileName.replace(/\.[^.]+$/, "").toLowerCase();
  if (!acc[baseName]) {
    acc[baseName] = assetsContext(key);
  }
  return acc;
}, {});

const pickImage = (candidateNames) => {
  for (const name of candidateNames) {
    const src = assetMap[name.toLowerCase()];
    if (src) return src;
  }
  return null;
};

const buildSeries = (prefix, start, end) => {
  const result = [];
  for (let i = start; i <= end; i += 1) {
    const id = `${prefix}${i}`;
    const src = pickImage([id]);
    if (src) {
      result.push({ id, src });
    }
  }
  return result;
};

const selectByIdRange = (images, prefix, start, end) =>
  images.filter(({ id }) => {
    const matched = id.match(new RegExp(`^${prefix}(\\d+)$`, "i"));
    if (!matched) return false;
    const idx = Number(matched[1]);
    return idx >= start && idx <= end;
  });

export default function Manual() {
  const [activeMenu, setActiveMenu] = useState("overview");
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [openDropdown, setOpenDropdown] = useState("overview");

  const overviewImages = useMemo(() => buildSeries("Overview", 1, 8), []);

  const kfImages = useMemo(() => buildSeries("KF", 1, 8), []);

  const chatbotImages = useMemo(() => buildSeries("Chatbots", 1, 13), []);

  const writingImages = useMemo(() => buildSeries("Writing", 1, 5), []);

  const menuConfig = useMemo(
    () => ({
      overview: {
        label: "Overview",
        images: overviewImages,
        dropdownItems: [
          {
            id: "overview-login",
            label: "login",
            images: selectByIdRange(overviewImages, "Overview", 2, 2),
          },
          {
            id: "overview-main",
            label: "主功能介紹",
            images: selectByIdRange(overviewImages, "Overview", 3, 8),
          },
        ],
      },
      kf: {
        label: "KF",
        images: kfImages,
      },
      chatbots: {
        label: "AI Chatbots",
        images: chatbotImages,
        dropdownItems: [
          {
            id: "chatbots-kf-analysis",
            label: "KF Analysis",
            images: selectByIdRange(chatbotImages, "Chatbots", 3, 5),
          },
          {
            id: "chatbots-writing-assistant",
            label: "Writing Assistant",
            images: selectByIdRange(chatbotImages, "Chatbots", 6, 10),
          },
          {
            id: "chatbots-writing-analysis",
            label: "Writing Analysis",
            images: selectByIdRange(chatbotImages, "Chatbots", 11, 13),
          },
        ],
      },
      writing: {
        label: "Writing",
        images: writingImages,
      },
    }),
    [chatbotImages, kfImages, overviewImages, writingImages]
  );

  const menuItems = useMemo(
    () => [
      { id: "overview", label: menuConfig.overview.label, hasDropdown: true },
      { id: "kf", label: menuConfig.kf.label, hasDropdown: false },
      { id: "chatbots", label: menuConfig.chatbots.label, hasDropdown: true },
      { id: "writing", label: menuConfig.writing.label, hasDropdown: false },
    ],
    [menuConfig]
  );

  const currentMenu = menuConfig[activeMenu];
  const currentDropdown = openDropdown ? menuConfig[openDropdown]?.dropdownItems || [] : [];
  const activeImages = activeSubmenu
    ? currentMenu.dropdownItems?.find((item) => item.id === activeSubmenu)?.images || []
    : currentMenu.images;

  const getButtonStyle = (isActive) => ({
    padding: "0.5rem 1.25rem",
    borderRadius: "0.5rem",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backgroundColor: isActive ? "#2563eb" : "#e5e7eb",
    color: isActive ? "#ffffff" : "#374151",
    boxShadow: isActive ? "0 6px 12px rgba(37, 99, 235, 0.25)" : "none",
  });

  const getSubmenuButtonStyle = (isActive) => ({
    padding: "0.4rem 1rem",
    borderRadius: "0.45rem",
    fontWeight: "600",
    border: "1px solid #d1d5db",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backgroundColor: isActive ? "#eff6ff" : "#ffffff",
    color: isActive ? "#1d4ed8" : "#374151",
    boxShadow: isActive ? "0 4px 10px rgba(59, 130, 246, 0.2)" : "none",
  });

  const handleMenuClick = (menuId, hasDropdown) => {
    setActiveMenu(menuId);
    setActiveSubmenu(null);
    setOpenDropdown(hasDropdown ? menuId : null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "1024px",
            width: "100%",
          }}
        >
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#374151",
              marginBottom: "1.25rem",
              textAlign: "center",
            }}
          >
            Manual Categories
          </h1>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.8rem",
              marginBottom: "0.8rem",
              width: "100%",
            }}
          >
            {menuItems.map((item) => {
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id, item.hasDropdown)}
                  style={getButtonStyle(isActive)}
                >
                  {item.label}
                  {item.hasDropdown ? " ▼" : ""}
                </button>
              );
            })}
          </div>

          {currentDropdown.length > 0 && openDropdown === activeMenu && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "0.6rem",
                marginBottom: "1.8rem",
                width: "100%",
              }}
            >
              {currentDropdown.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSubmenu(item.id)}
                  style={getSubmenuButtonStyle(activeSubmenu === item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {!(currentDropdown.length > 0 && openDropdown === activeMenu) && (
            <div style={{ marginBottom: "1.8rem" }} />
          )}

          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "1.5rem",
              borderRadius: "1rem",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.2rem",
              width: "100%",
              maxWidth: "700px",
            }}
          >
            {activeImages.length === 0 && (
              <div
                style={{
                  color: "#6b7280",
                  fontSize: "0.95rem",
                }}
              >
                No images found for this section.
              </div>
            )}

            {activeImages.map((img, idx) => (
              <div
                key={`${img.id}-${idx}`}
                style={{
                  width: "100%",
                  maxWidth: "700px",
                  overflow: "hidden",
                  borderRadius: "0.75rem",
                  backgroundColor: "#ffffff",
                }}
              >
                <img
                  src={img.src}
                  alt={img.id}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
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
