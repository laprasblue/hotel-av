import { Button, Table, Tag, Space, Popconfirm, message, Empty } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import { useRooms, useDeleteRoom } from '@/hooks/useRooms'
import type { Room } from '@/types'
import { ROOM_TYPE_LABELS } from '@/types'

interface Props {
  propertyId: number
}

export default function RoomListTab({ propertyId }: Props) {
  const navigate = useNavigate()
  const { data: rooms = [], isLoading } = useRooms(propertyId)
  const deleteRoom = useDeleteRoom(propertyId)

  const handleDelete = async (id: number) => {
    try {
      await deleteRoom.mutateAsync(id)
      message.success('Đã xoá phòng')
    } catch {
      message.error('Xoá thất bại')
    }
  }

  const columns: ColumnsType<Room> = [
    {
      title: 'Tên phòng',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <a onClick={() => navigate(`/rooms/${record.id}`)}>{name}</a>
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
      title: '',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/rooms/${record.id}/edit`)}
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
