import { useState } from 'react'
import { Button, Table, Input, Typography, Card, Space, Empty } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import type { Guest } from '@/types'
import { useGuests } from '@/hooks/useGuests'
import dayjs from 'dayjs'

const { Title } = Typography

export default function GuestListPage() {
  const navigate = useNavigate()
  const { data: guests = [], isLoading } = useGuests()
  const [search, setSearch] = useState('')

  const filtered = guests.filter(
    (g) =>
      g.fullName.toLowerCase().includes(search.toLowerCase()) ||
      g.phone?.includes(search) ||
      g.documentNumber?.includes(search)
  )

  const columns: ColumnsType<Guest> = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name: string, record) => (
        <a onClick={() => navigate(`/guests/${record.id}`)}>{name}</a>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (v?: string) => v ?? '-',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (v?: string) => v ?? '-',
    },
    {
      title: 'CCCD/Passport',
      dataIndex: 'documentNumber',
      key: 'documentNumber',
      render: (v?: string) => v ?? <em style={{ color: '#bfbfbf' }}>Chưa nhập</em>,
    },
    {
      title: 'Quốc tịch',
      dataIndex: 'nationality',
      key: 'nationality',
      render: (v?: string) => v ?? '-',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <Title level={4}>Guests</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/guests/new')}
        >
          Thêm Khách
        </Button>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm tên / SĐT / CCCD..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
          pagination={{ pageSize: 20 }}
          locale={{ emptyText: <Empty description="Chưa có khách nào" /> }}
        />
      </Card>
    </div>
  )
}
