import { Button, Card, Descriptions, Tag, Tabs, Typography, Space, Skeleton } from 'antd'
import { EditOutlined, ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useProperty } from '@/hooks/useProperties'
import { PROPERTY_TYPE_LABELS } from '@/types'
import RoomListTab from '../rooms/RoomListTab'

const { Title } = Typography

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: property, isLoading } = useProperty(Number(id))

  if (isLoading) return <Skeleton active />

  if (!property) return <div>Không tìm thấy property.</div>

  const tabItems = [
    {
      key: 'info',
      label: 'Thông tin',
      children: (
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Tên Property" span={2}>
            {property.name}
          </Descriptions.Item>
          <Descriptions.Item label="Loại">
            {property.type ? (
              <Tag>{PROPERTY_TYPE_LABELS[property.type]}</Tag>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {property.phone ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={2}>
            {property.address ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả" span={2}>
            {property.description ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Tiện ích" span={2}>
            {property.amenities?.length
              ? property.amenities.map((a) => <Tag key={a}>{a}</Tag>)
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Hướng dẫn nhận phòng" span={2}>
            {property.checkInInstructions ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={2}>
            {property.notes ?? '-'}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'rooms',
      label: 'Phòng',
      children: <RoomListTab propertyId={Number(id)} />,
    },
  ]

  return (
    <div>
      <div className="page-header">
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/properties')}
          />
          <Title level={4}>{property.name}</Title>
        </Space>
        <Space>
          <Button
            icon={<PlusOutlined />}
            onClick={() => navigate(`/properties/${id}/rooms/new`)}
          >
            Thêm phòng
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/properties/${id}/edit`)}
          >
            Chỉnh sửa
          </Button>
        </Space>
      </div>

      <Card>
        <Tabs items={tabItems} defaultActiveKey="info" />
      </Card>
    </div>
  )
}
