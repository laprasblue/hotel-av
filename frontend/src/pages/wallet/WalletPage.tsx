import { useState } from 'react'
import {
  Button,
  Card,
  Table,
  Tag,
  Typography,
  Space,
  DatePicker,
  Select,
  Statistic,
  Row,
  Col,
  Empty,
  Dropdown,
} from 'antd'
import {
  PlusOutlined, DownloadOutlined,
  FileExcelOutlined, FilePdfOutlined,
} from '@ant-design/icons'
import { exportToExcel, exportToPDF } from '@/utils/exportUtils'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import type { Transaction } from '@/types'
import { TRANSACTION_TYPE_LABELS } from '@/types'
import { useTransactions } from '@/hooks/useTransactions'
import dayjs from 'dayjs'

const { Title } = Typography
const { RangePicker } = DatePicker

const TYPE_COLORS: Record<string, string> = {
  INCOME: 'success',
  EXPENSE: 'error',
  ADJUSTMENT: 'warning',
}

export default function WalletPage() {
  const navigate = useNavigate()
  const { data: transactions = [], isLoading } = useTransactions()
  const [typeFilter, setTypeFilter] = useState<string | undefined>()

  const filtered = transactions.filter(
    (t) => !typeFilter || t.type === typeFilter
  )

  const EXPORT_COLS = [
    { header: 'Ngày', key: 'date' as const, format: (v: unknown) => dayjs(v as string).format('DD/MM/YYYY') },
    { header: 'Loại', key: 'type' as const, format: (v: unknown) => TRANSACTION_TYPE_LABELS[v as Transaction['type']] },
    { header: 'Số tiền (đ)', key: 'amount' as const, format: (v: unknown) => String(v) },
    { header: 'Mô tả', key: 'description' as const },
    { header: 'Ghi chú', key: 'notes' as const, format: (v: unknown) => (v as string | undefined) ?? '' },
    { header: 'Tạo bởi', key: 'createdBy' as const },
  ]

  const handleExportExcel = () => {
    exportToExcel(
      filtered as unknown as Record<string, unknown>[],
      EXPORT_COLS,
      `transactions_${dayjs().format('YYYYMMDD')}`,
      'Transactions',
    )
  }

  const handleExportPDF = () => {
    exportToPDF(
      'Danh sách giao dịch',
      EXPORT_COLS.map((c) => c.header),
      filtered.map((t) => EXPORT_COLS.map((c) => c.format ? c.format(t[c.key]) : String(t[c.key] ?? ''))),
      `transactions_${dayjs().format('YYYYMMDD')}`,
    )
  }

  const balance = transactions.reduce((sum, t) => {
    if (t.type === 'INCOME') return sum + t.amount
    if (t.type === 'EXPENSE') return sum - t.amount
    return sum + t.amount
  }, 0)

  const columns: ColumnsType<Transaction> = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      width: 130,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: Transaction['type']) => (
        <Tag color={TYPE_COLORS[type]}>{TRANSACTION_TYPE_LABELS[type]}</Tag>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 160,
      render: (v: number, record) => (
        <span
          style={{
            fontWeight: 600,
            color: record.type === 'INCOME' ? '#52c41a' : record.type === 'EXPENSE' ? '#ff4d4f' : '#fa8c16',
          }}
        >
          {record.type === 'EXPENSE' ? '-' : '+'}
          {v.toLocaleString('vi-VN')}đ
        </span>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (v?: string) => v ?? '-',
    },
    {
      title: 'Tạo bởi',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 140,
    },
  ]

  return (
    <div>
      <div className="page-header">
        <Title level={4}>Wallet & Cash Flow</Title>
        <Space>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'excel',
                  icon: <FileExcelOutlined style={{ color: '#217346' }} />,
                  label: 'Xuất Excel (.xlsx)',
                  onClick: handleExportExcel,
                },
                {
                  key: 'pdf',
                  icon: <FilePdfOutlined style={{ color: '#dc2626' }} />,
                  label: 'Xuất PDF (in trình duyệt)',
                  onClick: handleExportPDF,
                },
              ],
            }}
          >
            <Button icon={<DownloadOutlined />}>Xuất file</Button>
          </Dropdown>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/wallet/new')}
          >
            Tạo giao dịch
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Số dư hiện tại"
              value={balance}
              suffix="đ"
              formatter={(v) => Number(v).toLocaleString('vi-VN')}
              styles={{ value: { color: balance >= 0 ? '#52c41a' : '#ff4d4f', fontSize: 24 } }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            placeholder="Loại giao dịch"
            value={typeFilter}
            onChange={setTypeFilter}
            allowClear
            style={{ width: 180 }}
            options={Object.entries(TRANSACTION_TYPE_LABELS).map(([k, v]) => ({
              value: k,
              label: v,
            }))}
          />
          <RangePicker placeholder={['Từ ngày', 'Đến ngày']} />
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
          pagination={{ pageSize: 30 }}
          locale={{ emptyText: <Empty description="Chưa có giao dịch nào" /> }}
        />
      </Card>
    </div>
  )
}
