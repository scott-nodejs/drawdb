/**
 * @description 应用程序主组件 - 处理路由和主题设置
 * @component
 */
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useLayoutEffect } from "react";
import Editor from "./pages/Editor";
import Survey from "./pages/Survey";
import BugReport from "./pages/BugReport";
import Shortcuts from "./pages/Shortcuts";
import Templates from "./pages/Templates";
import LandingPage from "./pages/LandingPage";
import SettingsContextProvider from "./context/SettingsContext";
import { useSettings } from "./hooks";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
      <SettingsContextProvider>
        <BrowserRouter>
          <RestoreScroll />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/editor"
              element={
                <ThemedPage>
                  <Editor />
                </ThemedPage>
              }
            />
            <Route
              path="/survey"
              element={
                <ThemedPage>
                  <Survey />
                </ThemedPage>
              }
            />
            <Route
              path="/shortcuts"
              element={
                <ThemedPage>
                  <Shortcuts />
                </ThemedPage>
              }
            />
            <Route
              path="/bug-report"
              element={
                <ThemedPage>
                  <BugReport />
                </ThemedPage>
              }
            />
            <Route path="/templates" element={<Templates />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SettingsContextProvider>
  );
}

/**
 * @description 主题包装组件 - 处理深色/浅色主题切换
 * @param {Object} props
 * @param {React.ReactNode} props.children - 子组件
 */
function ThemedPage({ children }) {
  const { setSettings } = useSettings();

  useLayoutEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setSettings((prev) => ({ ...prev, mode: "dark" }));
      const body = document.body;
      if (body.hasAttribute("theme-mode")) {
        body.setAttribute("theme-mode", "dark");
      }
    } else {
      setSettings((prev) => ({ ...prev, mode: "light" }));
      const body = document.body;
      if (body.hasAttribute("theme-mode")) {
        body.setAttribute("theme-mode", "light");
      }
    }
  }, [setSettings]);

  return children;
}

/**
 * @description 滚动恢复组件 - 在路由变化时将页面滚动到顶部
 */
function RestoreScroll() {
  const location = useLocation();
  useLayoutEffect(() => {
    window.scroll(0, 0);
  }, [location.pathname]);
  return null;
}
