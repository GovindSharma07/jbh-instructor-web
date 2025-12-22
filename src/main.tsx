import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// --- DEBUG LOGS (Delete later) ---
console.log("--------------------------------------");
console.log("Current API URL:", import.meta.env.VITE_API_URL);
console.log("--------------------------------------");
// ---------------------------------

createRoot(document.getElementById('root')!).render(
    <App />
)