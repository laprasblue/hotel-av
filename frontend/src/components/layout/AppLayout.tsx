import { useState } from 'react'
import { Layout, Menu, Select, Avatar, Dropdown, Typography, Space } from 'antd'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
  HomeOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  BookOutlined,
  UserOutlined,
  BarChartOutlined,
  WalletOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BankOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { useProperties } from '@/hooks/useProperties'

const { Sider, Header, Content } = Layout
const { Text } = Typography

const menuItems = [
  { key: '/properties', icon: <HomeOutlined />, label: 'Properties' },
  { key: '/rooms', icon: <AppstoreOutlined />, label: 'Rooms' },
  { key: '/availability', icon: <CalendarOutlined />, label: 'Availability' },
  { key: '/reservations', icon: <BookOutlined />, label: 'Reservations' },
  { key: '/guests', icon: <UserOutlined />, label: 'Guests' },
  { type: 'divider' as const },
  { key: '/dashboard', icon: <BarChartOutlined />, label: 'Dashboard' },
  { key: '/wallet', icon: <WalletOutlined />, label: 'Wallet' },
]

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { selectedProperty, setSelectedProperty } = useAppStore()
  const { data: properties = [] } = useProperties()

  const selectedKey = '/' + location.pathname.split('/')[1]

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: () => {
        logout()
        navigate('/login')
      },
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={220}
        className="app-sider"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            padding: collapsed ? '0 24px' : '0 20px',
            borderBottom: '1px solid #e5e7eb',
            gap: 10,
            overflow: 'hidden',
          }}
        >
          <BankOutlined style={{ fontSize: 20, color: '#1d4ed8', flexShrink: 0 }} />
          {!collapsed && (
            <Text strong style={{ fontSize: 15, whiteSpace: 'nowrap', color: '#111827' }}>
              Hotel Manager
            </Text>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems.map((item) =>
            item.type === 'divider'
              ? { type: 'divider', key: 'divider' }
              : {
                  key: item.key,
                  icon: item.icon,
                  label: item.label,
                  onClick: () => navigate(item.key),
                }
          )}
          style={{ borderRight: 0, marginTop: 4 }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin 0.2s' }}>
        <Header
          style={{
            background: '#fff',
            borderBottom: '1px solid #e5e7eb',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            height: 56,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <Space size={16}>
            <span
              onClick={() => setCollapsed(!collapsed)}
              style={{
                cursor: 'pointer',
                fontSize: 16,
                color: '#6b7280',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>

            <Select
              placeholder="Chọn Property"
              value={selectedProperty?.id}
              onChange={(val) => {
                const prop = properties.find((p) => p.id === val) ?? null
                setSelectedProperty(prop)
              }}
              options={properties.map((p) => ({ value: p.id, label: p.name }))}
              style={{ width: 230 }}
              allowClear
              onClear={() => setSelectedProperty(null)}
            />
          </Space>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}>
              <Avatar
                size={30}
                icon={<UserOutlined />}
                style={{ background: '#1d4ed8', fontSize: 13 }}
              />
              <Text style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
                {user?.name ?? 'User'}
              </Text>
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 56px)', background: '#f0f2f5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
