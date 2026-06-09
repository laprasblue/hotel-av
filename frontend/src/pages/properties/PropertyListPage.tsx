import { useState } from 'react'
import {
  Button,
  Table,
  Tag,
  Space,
  Popconfirm,
  message,
  Input,
  Typography,
  Card,
  Empty,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import { useProperties, useDeleteProperty } from '@/hooks/useProperties'
import type { Property } from '@/types'
import { PROPERTY_TYPE_LABELS } from '@/types'

const { Title } = Typography

export default function PropertyListPage() {
  const navigate = useNavigate()
  const { data: properties = [], isLoading } = useProperties()
  const deleteProperty = useDeleteProperty()
  const [search, setSearch] = useState('')

  const filtered = properties.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: number) => {
    try {
      await deleteProperty.mutateAsync(id)
      message.success('Đã xoá property')
    } catch {
      message.error('Xoá thất bại')
    }
  }

  const columns: ColumnsType<Property> = [
    {
      title: 'Tên Property',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <a onClick={() => navigate(`/properties/${record.id}`)}>{name}</a>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 160,
      render: (type: Property['type']) =>
        type ? <Tag>{PROPERTY_TYPE_LABELS[type]}</Tag> : '-',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 160,
      render: (v?: string) => v ?? '-',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      render: (v?: string) => v ?? '-',
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/properties/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/properties/${record.id}/edit`)}
          />
          <Popconfirm
            title="Xoá property này?"
            description="Thao tác này không thể hoàn tác."
            onConfirm={() => handleDelete(record.id)}
            okText="Xoá"
            cancelText="Huỷ"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <Title level={4}>Properties</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/properties/new')}
        >
          Thêm Property
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm theo tên..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
          pagination={{ pageSize: 20, showSizeChanger: false }}
          locale={{ emptyText: <Empty description="Chưa có property nào" /> }}
        />
      </Card>
    </div>
  )
}
