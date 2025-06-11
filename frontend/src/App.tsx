import React from 'react';
import { ImageConverter } from './components/ImageConverter';
import { ThemeToggle } from './components/ThemeToggle';
import { useThemeStore } from './stores/themeStore';
import './App.css';

function App() {
  const { theme } = useThemeStore();

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <h1 className="app-title">Image Converter</h1>
            <p className="app-subtitle">
              이미지 형식 변환 및 최적화 도구
            </p>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <ImageConverter />
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>&copy; 2025 Image Converter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
