import { Typography, Card, Alert } from 'antd'
import { useAppStore } from '@/store/appStore'
import RoomListTab from './RoomListTab'

const { Title } = Typography

export default function RoomListPage() {
  const { selectedProperty } = useAppStore()

  return (
    <div>
      <div className="page-header">
        <Title level={4}>Phòng</Title>
      </div>

      {!selectedProperty ? (
        <Alert type="info" showIcon description="Chọn Hotel ở thanh trên cùng để xem danh sách phòng." />
      ) : (
        <Card>
          <RoomListTab propertyId={selectedProperty.id} />
        </Card>
      )}
    </div>
  )
}
