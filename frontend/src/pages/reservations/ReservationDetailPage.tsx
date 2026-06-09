import { Card, Descriptions, Tag, Typography, Space, Button, Skeleton, Divider, Popconfirm, message, Timeline, Row, Col } from 'antd'
import {
  ArrowLeftOutlined, UserOutlined,
  CheckCircleOutlined, LoginOutlined, LogoutOutlined, CloseCircleOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { useReservation, useUpdateReservation } from '@/hooks/useReservations'
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_COLORS } from '@/types'
import type { ReservationStatus } from '@/types'

const { Title, Text } = Typography

const STATUS_FLOW: Record<ReservationStatus, { next: ReservationStatus | null; label: string; icon: React.ReactNode; color: string }> = {
  PENDING:     { next: 'CONFIRMED',    label: 'Xác nhận',      icon: <CheckCircleOutlined />, color: '#1677ff' },
  CONFIRMED:   { next: 'CHECKED_IN',  label: 'Nhận phòng',    icon: <LoginOutlined />,       color: '#52c41a' },
  CHECKED_IN:  { next: 'CHECKED_OUT', label: 'Trả phòng',     icon: <LogoutOutlined />,      color: '#722ed1' },
  CHECKED_OUT: { next: null,          label: '',               icon: null,                    color: '' },
  CANCELLED:   { next: null,          label: '',               icon: null,                    color: '' },
}

function formatVND(v: number) {
  return v.toLocaleString('vi-VN') + 'đ'
}

export default function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: res, isLoading } = useReservation(Number(id))
  const updateReservation = useUpdateReservation()

  if (isLoading) return <Skeleton active />
  if (!res) return <div>Không tìm thấy reservation.</div>

  const statusInfo = STATUS_FLOW[res.status]
  const nights = Math.max(1, dayjs(res.checkOutTime).diff(dayjs(res.checkInTime), 'hour') / 24)

  const handleStatusChange = async (newStatus: ReservationStatus) => {
    try {
      await updateReservation.mutateAsync({ id: res.id, data: { status: newStatus } })
      message.success(`Đã cập nhật: ${RESERVATION_STATUS_LABELS[newStatus]}`)
    } catch {
      message.error('Cập nhật thất bại')
    }
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="page-header">
        <Space>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/reservations')} />
          <Title level={4}>{res.reservationNumber}</Title>
          <Tag color={RESERVATION_STATUS_COLORS[res.status]} style={{ fontSize: 13, padding: '2px 10px' }}>
            {RESERVATION_STATUS_LABELS[res.status]}
          </Tag>
        </Space>
        <Space>
          {statusInfo.next && (
            <Popconfirm
              title={`${statusInfo.label} reservation này?`}
              onConfirm={() => handleStatusChange(statusInfo.next!)}
              okText="Xác nhận"
              cancelText="Huỷ"
            >
              <Button
                type="primary"
                icon={statusInfo.icon}
                style={{ background: statusInfo.color, borderColor: statusInfo.color }}
                loading={updateReservation.isPending}
              >
                {statusInfo.label}
              </Button>
            </Popconfirm>
          )}
          {res.status !== 'CHECKED_OUT' && res.status !== 'CANCELLED' && (
            <Popconfirm
              title="Huỷ reservation này?"
              description="Thao tác không thể hoàn tác."
              onConfirm={() => handleStatusChange('CANCELLED')}
              okText="Huỷ đặt phòng"
              cancelText="Giữ lại"
              okButtonProps={{ danger: true }}
            >
              <Button icon={<CloseCircleOutlined />} danger>
                Huỷ
              </Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* Left column */}
        <Col xs={24} lg={16}>
          <Card title="Thông tin đặt phòng" style={{ marginBottom: 16 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Mã đặt phòng" span={2}>
                <Text strong>{res.reservationNumber}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Property">
                {res.property?.name ?? `Property #${res.propertyId}`}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng">
                <Text strong>{res.room?.name ?? `Room #${res.roomId}`}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Check-in">
                <Text strong style={{ color: '#52c41a' }}>
                  {dayjs(res.checkInTime).format('HH:mm, DD/MM/YYYY')}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Check-out">
                <Text strong style={{ color: '#ff4d4f' }}>
                  {dayjs(res.checkOutTime).format('HH:mm, DD/MM/YYYY')}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thời lưu trú">
                {nights % 1 === 0 ? nights : nights.toFixed(1)} đêm
              </Descriptions.Item>
              <Descriptions.Item label="Tạo lúc">
                {dayjs(res.createdAt).format('HH:mm, DD/MM/YYYY')}
              </Descriptions.Item>
            </Descriptions>

            {res.notes && (
              <>
                <Divider style={{ margin: '12px 0' }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Ghi chú</Text>
                  <div style={{ marginTop: 4 }}>{res.notes}</div>
                </div>
              </>
            )}
          </Card>

          <Card title="Thông tin khách" extra={
            res.guest && (
              <Button type="link" size="small" icon={<UserOutlined />}
                onClick={() => navigate(`/guests/${res.guest!.id}`)}>
                Xem hồ sơ
              </Button>
            )
          }>
            {res.guest ? (
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Họ tên" span={2}>
                  <Text strong>{res.guest.fullName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {res.guest.phone ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {res.guest.email ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="CCCD / Passport">
                  {res.guest.documentNumber ?? <em style={{ color: '#bfbfbf' }}>Chưa nhập</em>}
                </Descriptions.Item>
                <Descriptions.Item label="Quốc tịch">
                  {res.guest.nationality ?? '-'}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <div style={{ color: '#8c8c8c', fontStyle: 'italic' }}>
                Chưa có thông tin khách —{' '}
                <Button type="link" size="small" style={{ padding: 0 }}
                  onClick={() => navigate(`/reservations/${id}/edit`)}>
                  Cập nhật
                </Button>
              </div>
            )}
          </Card>
        </Col>

        {/* Right column */}
        <Col xs={24} lg={8}>
          <Card title="Giá" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Giá gốc</Text>
                <Text>{formatVND(res.price)}</Text>
              </div>
              {(res.discount ?? 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Giảm giá</Text>
                  <Text style={{ color: '#ff4d4f' }}>-{formatVND(res.discount ?? 0)}</Text>
                </div>
              )}
              <Divider style={{ margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: 15 }}>Thành tiền</Text>
                <Text strong style={{ fontSize: 18, color: '#1677ff' }}>
                  {formatVND(res.finalPrice)}
                </Text>
              </div>
            </div>
          </Card>

          <Card title="Trạng thái">
            <Timeline
              items={[
                { color: 'gray', children: <><Text type="secondary">Tạo đặt phòng</Text><br /><Text style={{ fontSize: 12 }} type="secondary">{dayjs(res.createdAt).format('HH:mm DD/MM')}</Text></> },
                ...(res.status !== 'PENDING' && res.status !== 'CANCELLED' ? [{ color: 'blue', children: <><Text>Đã xác nhận</Text></> }] : []),
                ...(res.status === 'CHECKED_IN' || res.status === 'CHECKED_OUT' ? [{ color: 'green', children: <><Text>Đã nhận phòng</Text></> }] : []),
                ...(res.status === 'CHECKED_OUT' ? [{ color: 'purple', children: <><Text>Đã trả phòng</Text></> }] : []),
                ...(res.status === 'CANCELLED' ? [{ color: 'red', children: <><Text style={{ color: '#ff4d4f' }}>Đã huỷ</Text></> }] : []),
                ...(res.status !== 'CHECKED_OUT' && res.status !== 'CANCELLED' ? [{ color: 'gray', dot: <span style={{ fontSize: 10 }}>○</span>, children: <Text type="secondary">Chờ tiếp theo...</Text> }] : []),
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
