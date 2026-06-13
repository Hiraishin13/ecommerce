import { Toaster } from 'react-hot-toast'
import AppRouter from './router'

function App() {
  return (
    <>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#000',
            color: '#fff',
            borderRadius: '0',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            letterSpacing: '0.02em',
          },
          success: {
            iconTheme: { primary: '#388E3C', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#D32F2F', secondary: '#fff' },
          },
        }}
      />
    </>
  )
}

export default App
