import { useState } from 'react'
import {
  Button,
  Table,
  Tag,
  Input,
  Typography,
  Card,
  Space,
  Select,
  DatePicker,
  Empty,
  Dropdown,
} from 'antd'
import {
  PlusOutlined, SearchOutlined, DownloadOutlined,
  FileExcelOutlined, FilePdfOutlined, HomeOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import type { Reservation } from '@/types'
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_COLORS } from '@/types'
import { useReservations } from '@/hooks/useReservations'
import { useAppStore } from '@/store/appStore'
import { exportToExcel, exportToPDF } from '@/utils/exportUtils'
import dayjs from 'dayjs'

const { Title } = Typography
const { RangePicker } = DatePicker

export default function ReservationListPage() {
  const navigate = useNavigate()
  const { selectedProperty } = useAppStore()
  const { data: reservations = [], isLoading } = useReservations(selectedProperty?.id)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>()

  const filtered = reservations.filter((r) => {
    const matchSearch =
      r.reservationNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.guest?.fullName?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const EXPORT_COLS = [
    { header: 'Mã đặt phòng', key: 'reservationNumber' as const },
    { header: 'Khách', key: 'guest' as const, format: (v: unknown) => (v as Reservation['guest'])?.fullName ?? '' },
    { header: 'Phòng', key: 'room' as const, format: (v: unknown) => (v as Reservation['room'])?.name ?? '' },
    { header: 'Check-in', key: 'checkInTime' as const, format: (v: unknown) => dayjs(v as string).format('DD/MM/YYYY HH:mm') },
    { header: 'Check-out', key: 'checkOutTime' as const, format: (v: unknown) => dayjs(v as string).format('DD/MM/YYYY HH:mm') },
    { header: 'Giá cuối (đ)', key: 'finalPrice' as const, format: (v: unknown) => String(v) },
    { header: 'Trạng thái', key: 'status' as const, format: (v: unknown) => RESERVATION_STATUS_LABELS[v as Reservation['status']] },
  ]

  const handleExportExcel = () => {
    exportToExcel(filtered as unknown as Record<string, unknown>[], EXPORT_COLS, `reservations_${dayjs().format('YYYYMMDD')}`, 'Reservations')
  }

  const handleExportPDF = () => {
    exportToPDF(
      'Danh sách Reservation',
      EXPORT_COLS.map((c) => c.header),
      filtered.map((r) => EXPORT_COLS.map((c) => c.format ? c.format(r[c.key]) : String(r[c.key] ?? ''))),
      `reservations_${dayjs().format('YYYYMMDD')}`,
    )
  }

  const columns: ColumnsType<Reservation> = [
    {
      title: 'Mã đặt phòng',
      dataIndex: 'reservationNumber',
      key: 'reservationNumber',
      render: (num: string, record) => (
        <a onClick={() => navigate(`/reservations/${record.id}`)}>{num}</a>
      ),
    },
    {
      title: 'Khách',
      key: 'guest',
      render: (_, r) => r.guest?.fullName ?? <em style={{ color: '#bfbfbf' }}>Chưa nhập</em>,
    },
    {
      title: 'Phòng',
      key: 'room',
      render: (_, r) => r.room?.name ?? '-',
    },
    {
      title: 'Check-in',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Check-out',
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Giá',
      dataIndex: 'finalPrice',
      key: 'finalPrice',
      render: (v: number) =>
        v?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) ?? '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: Reservation['status']) => (
        <Tag color={RESERVATION_STATUS_COLORS[status]}>
          {RESERVATION_STATUS_LABELS[status]}
        </Tag>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <Space>
          <Title level={4} style={{ margin: 0 }}>Reservations</Title>
          {selectedProperty && (
            <Tag icon={<HomeOutlined />} color="blue">{selectedProperty.name}</Tag>
          )}
        </Space>
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
            <Button icon={<DownloadOutlined />}>
              Xuất file
            </Button>
          </Dropdown>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/reservations/new')}
          >
            Tạo Reservation
          </Button>
        </Space>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Tìm mã / tên khách..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="Trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            style={{ width: 180 }}
            options={Object.entries(RESERVATION_STATUS_LABELS).map(([k, v]) => ({
              value: k,
              label: v,
            }))}
          />
          <RangePicker placeholder={['Check-in từ', 'đến']} />
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
          pagination={{ pageSize: 20 }}
          locale={{ emptyText: <Empty description="Chưa có reservation nào" /> }}
        />
      </Card>
    </div>
  )
}
