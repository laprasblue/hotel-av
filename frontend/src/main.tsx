import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

async function prepare() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    return worker.start({ onUnhandledRequest: 'bypass' })
  }
}

prepare().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          locale={viVN}
          theme={{
            token: {
              colorPrimary: '#1d4ed8',
              borderRadius: 8,
              borderRadiusLG: 12,
              colorBgContainer: '#ffffff',
              colorBorder: '#e5e7eb',
              colorTextBase: '#111827',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
              boxShadowSecondary: '0 4px 12px rgba(0,0,0,0.1)',
            },
            components: {
              Menu: { itemSelectedBg: '#eff6ff', itemSelectedColor: '#1d4ed8', itemBorderRadius: 8 },
              Card: { borderRadiusLG: 12 },
              Button: { borderRadius: 8, fontWeight: 500 },
              Input: { borderRadius: 8 },
              Select: { borderRadius: 8 },
              Tag: { borderRadius: 6 },
              Table: { borderRadius: 12 },
            },
          }}
        >
          <App />
        </ConfigProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
})
