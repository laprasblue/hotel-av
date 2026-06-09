import { Card, Descriptions, Tag, Typography, Space, Button, Skeleton, Table, Empty } from 'antd'
import { ArrowLeftOutlined, EditOutlined, BookOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { useGuest } from '@/hooks/useGuests'
import { useReservations } from '@/hooks/useReservations'
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_COLORS } from '@/types'
import type { Reservation } from '@/types'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

export default function GuestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: guest, isLoading } = useGuest(Number(id))
  const { data: allReservations = [] } = useReservations()

  if (isLoading) return <Skeleton active />
  if (!guest) return <div>Không tìm thấy khách.</div>

  const stayHistory = allReservations.filter((r) => r.guestId === guest.id)

  const historyColumns: ColumnsType<Reservation> = [
    {
      title: 'Mã đặt phòng',
      dataIndex: 'reservationNumber',
      key: 'num',
      render: (num: string, r) => (
        <a onClick={() => navigate(`/reservations/${r.id}`)}>{num}</a>
      ),
    },
    {
      title: 'Phòng',
      key: 'room',
      render: (_, r) => r.room?.name ?? '-',
    },
    {
      title: 'Check-in',
      dataIndex: 'checkInTime',
      key: 'ci',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Check-out',
      dataIndex: 'checkOutTime',
      key: 'co',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Giá',
      dataIndex: 'finalPrice',
      key: 'price',
      render: (v: number) => `${v.toLocaleString('vi-VN')}đ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (s: Reservation['status']) => (
        <Tag color={RESERVATION_STATUS_COLORS[s]}>{RESERVATION_STATUS_LABELS[s]}</Tag>
      ),
    },
  ]

  const totalSpent = stayHistory
    .filter((r) => r.status !== 'CANCELLED')
    .reduce((s, r) => s + r.finalPrice, 0)

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="page-header">
        <Space>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/guests')} />
          <Title level={4}>{guest.fullName}</Title>
        </Space>
        <Button
          icon={<EditOutlined />}
          onClick={() => navigate(`/guests/${id}/edit`)}
        >
          Chỉnh sửa
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card title="Thông tin cá nhân">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Họ và tên">
              <Text strong>{guest.fullName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {guest.phone ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {guest.email ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Quốc tịch">
              {guest.nationality ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {guest.address ?? '-'}
            </Descriptions.Item>
            {guest.notes && (
              <Descriptions.Item label="Ghi chú">
                {guest.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        <Card title="Giấy tờ tùy thân">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Số CCCD / Passport">
              {guest.documentNumber
                ? <Text strong code>{guest.documentNumber}</Text>
                : <em style={{ color: '#bfbfbf' }}>Chưa nhập</em>}
            </Descriptions.Item>
          </Descriptions>
          {!guest.documentNumber && (
            <div style={{
              marginTop: 12,
              padding: '16px',
              background: '#fffbe6',
              border: '1px solid #ffe58f',
              borderRadius: 6,
              fontSize: 13,
              color: '#8c6d00',
            }}>
              Chưa có thông tin giấy tờ. Cập nhật trước khi nhận phòng.
            </div>
          )}
          <div style={{
            marginTop: 12,
            padding: 16,
            background: '#fafafa',
            border: '1px dashed #d9d9d9',
            borderRadius: 6,
            textAlign: 'center',
            color: '#8c8c8c',
            fontSize: 12,
          }}>
            Upload ảnh CCCD / Passport<br />sẽ tích hợp với backend
          </div>
        </Card>
      </div>

      <Card
        title={
          <Space>
            <BookOutlined />
            <span>Lịch sử lưu trú</span>
            <Tag>{stayHistory.length} lần</Tag>
            {totalSpent > 0 && (
              <Text type="secondary" style={{ fontWeight: 400, fontSize: 13 }}>
                · Tổng chi: <strong style={{ color: '#1677ff' }}>{totalSpent.toLocaleString('vi-VN')}đ</strong>
              </Text>
            )}
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={historyColumns}
          dataSource={stayHistory}
          pagination={false}
          size="small"
          locale={{ emptyText: <Empty description="Chưa có lịch sử lưu trú" /> }}
        />
      </Card>
    </div>
  )
}
