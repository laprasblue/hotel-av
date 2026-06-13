import { Button, Table, Tag, Space, Popconfirm, Switch, Modal, message, Empty } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useRooms, useDeleteRoom, useUpdateRoom } from '@/hooks/useRooms'
import { useReservations } from '@/hooks/useReservations'
import type { Room } from '@/types'
import { ROOM_TYPE_LABELS } from '@/types'

interface Props {
  propertyId: number
}

export default function RoomListTab({ propertyId }: Props) {
  const navigate = useNavigate()
  const { data: rooms = [], isLoading } = useRooms(propertyId)
  const { data: reservations = [] } = useReservations(propertyId)
  const deleteRoom = useDeleteRoom(propertyId)
  const updateRoom = useUpdateRoom(propertyId)

  const handleDelete = async (id: number) => {
    try {
      await deleteRoom.mutateAsync(id)
      message.success('Đã xoá phòng')
    } catch {
      message.error('Xoá thất bại')
    }
  }

  const handleToggleActive = async (room: Room, checked: boolean) => {
    if (!checked) {
      const now = dayjs()
      const activeReservation = reservations.find(
        (r) =>
          r.roomId === room.id &&
          r.status !== 'CANCELLED' &&
          r.status !== 'CHECKED_OUT' &&
          dayjs(r.checkInTime).isBefore(now) &&
          dayjs(r.checkOutTime).isAfter(now)
      )
      if (activeReservation) {
        Modal.warning({
          title: 'Không thể ngừng hoạt động phòng',
          content: `Phòng "${room.name}" đang được đặt (mã đặt phòng ${activeReservation.reservationNumber}). Vui lòng đợi khách trả phòng trước khi tắt phòng này.`,
          okText: 'Đã hiểu',
        })
        return
      }
    }

    try {
      await updateRoom.mutateAsync({ id: room.id, data: { isActive: checked } })
      message.success(checked ? 'Đã bật hoạt động phòng' : 'Đã tắt hoạt động phòng')
    } catch {
      message.error('Cập nhật trạng thái thất bại')
    }
  }

  const columns: ColumnsType<Room> = [
    {
      title: 'Tên phòng',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <a onClick={() => navigate(`/rooms/${propertyId}/${record.id}/edit`)}>{name}</a>
      ),
    },
    {
      title: 'Loại phòng',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (type: Room['type']) =>
        type ? <Tag color="blue">{ROOM_TYPE_LABELS[type]}</Tag> : '-',
    },
    {
      title: 'Sức chứa',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 100,
      render: (v?: number) => (v ? `${v} người` : '-'),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (v?: string) => v ?? '-',
    },
    {
      title: 'Hoạt động',
      key: 'isActive',
      width: 110,
      render: (_, record) => (
        <Switch
          checked={record.isActive !== false}
          onChange={(checked) => handleToggleActive(record, checked)}
          loading={updateRoom.isPending && updateRoom.variables?.id === record.id}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/rooms/${propertyId}/${record.id}/edit`)}
          />
          <Popconfirm
            title="Xoá phòng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xoá"
            cancelText="Huỷ"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(`/properties/${propertyId}/rooms/new`)}
        >
          Thêm phòng
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={rooms}
        loading={isLoading}
        pagination={false}
        locale={{ emptyText: <Empty description="Chưa có phòng nào" /> }}
        size="small"
      />
    </div>
  )
}
