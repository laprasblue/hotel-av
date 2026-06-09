import { Card, Col, Row, Statistic, Typography, DatePicker, Space, Select, Alert } from 'antd'
import {
  DollarOutlined,
  CalendarOutlined,
  HomeOutlined,
  RiseOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import dayjs from 'dayjs'
import { useProperties } from '@/hooks/useProperties'
import { useReservations } from '@/hooks/useReservations'
import { useAppStore } from '@/store/appStore'

const { Title } = Typography
const { RangePicker } = DatePicker

const MOCK_CHART_DATA = [
  { day: 'T2', revenue: 4200000 },
  { day: 'T3', revenue: 3800000 },
  { day: 'T4', revenue: 6100000 },
  { day: 'T5', revenue: 5500000 },
  { day: 'T6', revenue: 7200000 },
  { day: 'T7', revenue: 9400000 },
  { day: 'CN', revenue: 8600000 },
]

const formatVND = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v.toLocaleString('vi-VN')

export default function DashboardPage() {
  const { data: properties = [] } = useProperties()
  const { data: allReservations = [] } = useReservations()
  const { selectedProperty, setSelectedProperty } = useAppStore()

  const propRes = allReservations.filter(
    (r) => !selectedProperty || r.propertyId === selectedProperty.id,
  )

  const now = dayjs()
  const startOfMonth = now.startOf('month')

  const checkedIn     = propRes.filter((r) => r.status === 'CHECKED_IN').length
  const confirmed     = propRes.filter((r) => r.status === 'CONFIRMED').length
  const pending       = propRes.filter((r) => r.status === 'PENDING').length
  const checkedOut    = propRes.filter((r) => r.status === 'CHECKED_OUT' && dayjs(r.updatedAt).isAfter(startOfMonth)).length
  const cancelled     = propRes.filter((r) => r.status === 'CANCELLED' && dayjs(r.updatedAt).isAfter(startOfMonth)).length
  const totalThisMonth = propRes.filter((r) => r.status !== 'CANCELLED' && dayjs(r.createdAt).isAfter(startOfMonth)).length

  const revenueMonth = propRes
    .filter((r) => r.status !== 'CANCELLED' && dayjs(r.createdAt).isAfter(startOfMonth))
    .reduce((s, r) => s + r.finalPrice, 0)

  const revenueWeek = propRes
    .filter((r) => r.status !== 'CANCELLED' && dayjs(r.createdAt).isAfter(now.startOf('week')))
    .reduce((s, r) => s + r.finalPrice, 0)

  const revenueToday = propRes
    .filter((r) => r.status !== 'CANCELLED' && dayjs(r.createdAt).isSame(now, 'day'))
    .reduce((s, r) => s + r.finalPrice, 0)

  return (
    <div>
      <div className="page-header">
        <Title level={4}>Dashboard</Title>
        <Space>
          <Select
            placeholder="Chọn Property"
            value={selectedProperty?.id}
            onChange={(val) => {
              const prop = properties.find((p) => p.id === val) ?? null
              setSelectedProperty(prop)
            }}
            options={properties.map((p) => ({ value: p.id, label: p.name }))}
            style={{ width: 220 }}
            allowClear
            onClear={() => setSelectedProperty(null)}
          />
          <RangePicker />
        </Space>
      </div>

      {!selectedProperty && (
        <Alert
          type="info"
          showIcon
          description="Chọn Property để xem thống kê theo từng cơ sở, hoặc đang hiển thị tổng hợp tất cả."
          style={{ marginBottom: 20 }}
        />
      )}

      {/* ── Revenue stats ─────────────────────────────── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Doanh thu hôm nay"
              value={revenueToday}
              prefix={<DollarOutlined />}
              formatter={(v) => formatVND(Number(v))}
              styles={{ value: { color: '#1d4ed8' } }}
              suffix="đ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Doanh thu tuần này"
              value={revenueWeek}
              prefix={<RiseOutlined />}
              formatter={(v) => formatVND(Number(v))}
              styles={{ value: { color: '#10b981' } }}
              suffix="đ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Doanh thu tháng này"
              value={revenueMonth}
              prefix={<CalendarOutlined />}
              formatter={(v) => formatVND(Number(v))}
              styles={{ value: { color: '#7c3aed' } }}
              suffix="đ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng booking tháng này"
              value={totalThisMonth}
              prefix={<BookOutlined />}
              styles={{ value: { color: '#f59e0b' } }}
              suffix="đơn"
            />
          </Card>
        </Col>
      </Row>

      {/* ── Booking count stats ───────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={8} lg={6}>
          <Card className="stat-card" styles={{ body: { padding: '16px 20px' } }}>
            <Statistic
              title="Đang lưu trú"
              value={checkedIn}
              prefix={<HomeOutlined />}
              styles={{ value: { color: '#10b981', fontSize: 28 } }}
              suffix="phòng"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card className="stat-card" styles={{ body: { padding: '16px 20px' } }}>
            <Statistic
              title="Chờ nhận phòng"
              value={confirmed + pending}
              prefix={<ClockCircleOutlined />}
              styles={{ value: { color: '#3b82f6', fontSize: 28 } }}
              suffix="đơn"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card className="stat-card" styles={{ body: { padding: '16px 20px' } }}>
            <Statistic
              title="Đã trả phòng (tháng)"
              value={checkedOut}
              prefix={<CheckCircleOutlined />}
              styles={{ value: { color: '#9ca3af', fontSize: 28 } }}
              suffix="đơn"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card className="stat-card" styles={{ body: { padding: '16px 20px' } }}>
            <Statistic
              title="Đã huỷ (tháng)"
              value={cancelled}
              prefix={<CloseCircleOutlined />}
              styles={{ value: { color: '#ef4444', fontSize: 28 } }}
              suffix="đơn"
            />
          </Card>
        </Col>
      </Row>

      {/* ── Chart + Occupancy breakdown ───────────────── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Doanh thu 7 ngày qua" className="stat-card">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={MOCK_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(v) => `${v / 1_000_000}M`} />
                <Tooltip
                  formatter={(v) => [`${Number(v ?? 0).toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                />
                <Bar dataKey="revenue" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Tình trạng booking" className="stat-card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Đang lưu trú', value: checkedIn, color: '#10b981', bg: '#f0fdf4' },
                { label: 'Chờ nhận phòng (confirmed)', value: confirmed, color: '#3b82f6', bg: '#eff6ff' },
                { label: 'Chờ xác nhận (pending)', value: pending, color: '#f59e0b', bg: '#fffbeb' },
                { label: 'Đã trả phòng (tháng)', value: checkedOut, color: '#9ca3af', bg: '#f9fafb' },
                { label: 'Đã huỷ (tháng)', value: cancelled, color: '#ef4444', bg: '#fff7f7' },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: item.bg,
                  }}
                >
                  <span style={{ fontSize: 13, color: '#374151' }}>{item.label}</span>
                  <span style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: item.color,
                    minWidth: 28,
                    textAlign: 'right',
                  }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
