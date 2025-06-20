
import { createRoot } from 'react-dom/client'
import './i18n'  // Import i18n configuration first
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
