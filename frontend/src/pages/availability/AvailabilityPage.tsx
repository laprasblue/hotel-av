import { useRef, useState } from 'react'
import {
  Card, Typography, Space, Alert, Tag, Modal, Descriptions,
  Button, DatePicker, Empty, Spin, Row, Col,
} from 'antd'
import {
  PlusOutlined, SearchOutlined, CheckCircleFilled,
  CloseCircleFilled, ClockCircleOutlined, HomeOutlined,
} from '@ant-design/icons'
import FullCalendar from '@fullcalendar/react'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, DateSelectArg } from '@fullcalendar/core'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { useRooms } from '@/hooks/useRooms'
import { useReservations } from '@/hooks/useReservations'
import { useAppStore } from '@/store/appStore'
import { RESERVATION_STATUS_COLORS, RESERVATION_STATUS_LABELS, ROOM_TYPE_LABELS } from '@/types'
import type { Reservation } from '@/types'
import { fetchAvailability } from '@/api/availability'
import type { RoomAvailability } from '@/api/availability'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const STATUS_EVENT_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  CHECKED_IN: '#10b981',
  CHECKED_OUT: '#9ca3af',
  CANCELLED: '#ef4444',
}

export default function AvailabilityPage() {
  const navigate = useNavigate()
  const calendarRef = useRef<FullCalendar>(null)
  const { selectedProperty } = useAppStore()
  const { data: rooms = [] } = useRooms(selectedProperty?.id ?? 0)
  const { data: reservations = [] } = useReservations()

  const [selectedEvent, setSelectedEvent] = useState<Reservation | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const [searchDates, setSearchDates] = useState<[Dayjs, Dayjs] | null>(null)
  const [searchResults, setSearchResults] = useState<RoomAvailability[] | null>(null)
  const [searching, setSearching] = useState(false)

  const [lastPropertyId, setLastPropertyId] = useState(selectedProperty?.id)
  if (selectedProperty?.id !== lastPropertyId) {
    setLastPropertyId(selectedProperty?.id)
    setSearchResults(null)
  }

  const handleSearch = async () => {
    if (!selectedProperty || !searchDates) return
    setSearching(true)
    try {
      const results = await fetchAvailability(
        selectedProperty.id,
        searchDates[0].startOf('day').toISOString(),
        searchDates[1].endOf('day').toISOString(),
      )
      setSearchResults(results)
    } finally {
      setSearching(false)
    }
  }

  const propReservations = reservations.filter(
    (r) => r.propertyId === selectedProperty?.id && r.status !== 'CANCELLED',
  )

  const resources = rooms.map((r) => ({
    id: String(r.id),
    title: r.name,
    extendedProps: { type: r.type, capacity: r.capacity },
  }))

  const events = propReservations.map((r) => ({
    id: String(r.id),
    resourceId: String(r.roomId),
    title: r.guest?.fullName ?? '(Chưa có khách)',
    start: r.checkInTime,
    end: r.checkOutTime,
    backgroundColor: STATUS_EVENT_COLORS[r.status] ?? '#3b82f6',
    borderColor: STATUS_EVENT_COLORS[r.status] ?? '#3b82f6',
    extendedProps: { reservation: r },
  }))

  const handleEventClick = (info: EventClickArg) => {
    const res = info.event.extendedProps.reservation as Reservation
    setSelectedEvent(res)
    setModalOpen(true)
  }

  const handleDateSelect = (info: DateSelectArg) => {
    navigate(
      `/reservations/new?roomId=${info.resource?.id ?? ''}&checkIn=${encodeURIComponent(info.startStr)}&checkOut=${encodeURIComponent(info.endStr)}`,
    )
  }

  const availableCount = searchResults?.filter((r) => r.available).length ?? 0
  const totalCount = searchResults?.length ?? 0

  return (
    <div>
      <div className="page-header">
        <Title level={4}>Quản lý Availability</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/reservations/new')}
        >
          Tạo Reservation
        </Button>
      </div>

      {/* ── Search panel ──────────────────────────────────── */}
      <Card
        style={{ marginBottom: 20 }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <Text strong style={{ fontSize: 15, color: '#111827', display: 'block', marginBottom: 4 }}>
          Tìm phòng trống
        </Text>
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>
          Kiểm tra phòng nào còn trống trong khoảng thời gian bạn muốn đặt
        </Text>

        {!selectedProperty ? (
          <Alert
            type="info"
            showIcon
            description="Chọn Hotel ở thanh trên cùng để tìm phòng trống."
          />
        ) : (
          <Space wrap size={12} align="end">
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Property</div>
              <Tag icon={<HomeOutlined />} color="blue" style={{ fontSize: 13, padding: '6px 10px' }}>
                {selectedProperty.name}
              </Tag>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Ngày check-in → check-out</div>
              <RangePicker
                format="DD/MM/YYYY"
                placeholder={['Check-in', 'Check-out']}
                onChange={(vals) => {
                  setSearchDates(vals ? (vals as [Dayjs, Dayjs]) : null)
                  setSearchResults(null)
                }}
                style={{ width: 280 }}
              />
            </div>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              disabled={!searchDates}
              loading={searching}
              style={{ height: 32 }}
            >
              Tìm kiếm
            </Button>
            {searchResults && (
              <Button
                onClick={() => setSearchResults(null)}
                style={{ height: 32 }}
              >
                Xoá kết quả
              </Button>
            )}
          </Space>
        )}
      </Card>

      {/* ── Search results ────────────────────────────────── */}
      {searching && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 8, color: '#6b7280', fontSize: 13 }}>Đang tìm kiếm...</div>
        </div>
      )}

      {searchResults && !searching && (
        <Card style={{ marginBottom: 20 }} styles={{ body: { padding: '16px 24px' } }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap',
          }}>
            <Text strong style={{ fontSize: 14, color: '#111827' }}>Kết quả</Text>
            <Tag color="success" style={{ borderRadius: 20 }}>{availableCount} phòng trống</Tag>
            <Tag color="error" style={{ borderRadius: 20 }}>{totalCount - availableCount} phòng bận</Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {searchDates?.[0].format('HH:mm DD/MM/YYYY')}
              {' → '}
              {searchDates?.[1].format('HH:mm DD/MM/YYYY')}
            </Text>
          </div>

          {searchResults.length === 0 ? (
            <Empty description="Không có phòng nào trong property này" />
          ) : (
            <Row gutter={[12, 12]}>
              {searchResults.map((room) => (
                <Col key={room.id} xs={12} sm={8} md={6} lg={4}>
                  <Card
                    className={`room-card ${room.available ? 'available' : 'occupied'}`}
                    styles={{ body: { padding: '14px 16px' } }}
                    onClick={() => {
                      if (room.available && searchDates) {
                        navigate(
                          `/reservations/new?roomId=${room.id}&checkIn=${encodeURIComponent(searchDates[0].startOf('day').toISOString())}&checkOut=${encodeURIComponent(searchDates[1].endOf('day').toISOString())}`,
                        )
                      }
                    }}
                    style={{ cursor: room.available ? 'pointer' : 'default' }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'flex-start',
                      justifyContent: 'space-between', marginBottom: 4,
                    }}>
                      <Text strong style={{ fontSize: 14, color: '#111827' }}>{room.name}</Text>
                      {room.available
                        ? <CheckCircleFilled style={{ color: '#10b981', fontSize: 16 }} />
                        : <CloseCircleFilled style={{ color: '#ef4444', fontSize: 16 }} />}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                      {ROOM_TYPE_LABELS[room.type as keyof typeof ROOM_TYPE_LABELS]}
                      {room.capacity ? ` · ${room.capacity} khách` : ''}
                    </div>
                    {room.available ? (
                      <Tag color="success" style={{ fontSize: 11, borderRadius: 4 }}>
                        Còn trống · Đặt ngay
                      </Tag>
                    ) : (
                      <>
                        <Tag color="error" style={{ fontSize: 11, borderRadius: 4 }}>Đã bận</Tag>
                        {room.conflictingReservation && (
                          <div style={{
                            marginTop: 6, fontSize: 11, color: '#9ca3af',
                            borderTop: '1px dashed #fca5a5', paddingTop: 6,
                          }}>
                            <ClockCircleOutlined style={{ marginRight: 3 }} />
                            {dayjs(room.conflictingReservation.checkInTime).format('DD/MM')}
                            {' → '}
                            {dayjs(room.conflictingReservation.checkOutTime).format('DD/MM')}
                          </div>
                        )}
                      </>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card>
      )}

      {/* ── Calendar ──────────────────────────────────────── */}
      <Card
        title={
          <Space size={8}>
            <span style={{ fontWeight: 600, color: '#111827' }}>Lịch phòng</span>
            {selectedProperty && (
              <Tag style={{ fontWeight: 400, borderRadius: 20 }}>{selectedProperty.name}</Tag>
            )}
          </Space>
        }
        styles={{ body: { padding: 0 } }}
      >
        {!selectedProperty ? (
          <div style={{ padding: 24 }}>
            <Alert type="info" showIcon description="Chọn Hotel ở thanh trên cùng để xem lịch phòng." />
          </div>
        ) : rooms.length === 0 ? (
          <div style={{ padding: 24 }}>
            <Alert
              type="warning"
              showIcon
              description={`${selectedProperty.name} chưa có phòng nào. Thêm phòng trước.`}
            />
          </div>
        ) : (
          <>
            <div style={{
              padding: '10px 16px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              <Space size={5}>
                <span style={{
                  width: 10, height: 10, borderRadius: 3,
                  background: '#f0fdf4', border: '1px solid #6ee7b7', display: 'inline-block',
                }} />
                <span style={{ fontSize: 12, color: '#6b7280' }}>Trống (bấm để đặt)</span>
              </Space>
              {Object.entries(STATUS_EVENT_COLORS).map(([status, color]) =>
                status !== 'CANCELLED' ? (
                  <Space key={status} size={5}>
                    <span style={{
                      width: 10, height: 10, borderRadius: 3,
                      background: color, display: 'inline-block',
                    }} />
                    <span style={{ fontSize: 12, color: '#6b7280' }}>
                      {RESERVATION_STATUS_LABELS[status as keyof typeof RESERVATION_STATUS_LABELS]}
                    </span>
                  </Space>
                ) : null,
              )}
            </div>
            <div style={{ paddingBottom: 8 }}>
              <FullCalendar
                ref={calendarRef}
                schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
                plugins={[resourceTimelinePlugin, interactionPlugin]}
                initialView="resourceTimelineWeek"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth',
                }}
                buttonText={{ today: 'Hôm nay', day: 'Ngày', week: 'Tuần', month: 'Tháng' }}
                locale="vi"
                resources={resources}
                events={events}
                selectable
                selectMirror
                select={handleDateSelect}
                eventClick={handleEventClick}
                resourceAreaHeaderContent="Phòng"
                resourceAreaWidth="160px"
                height="auto"
                contentHeight={460}
                resourceLabelContent={(info) => (
                  <div style={{ padding: '2px 0' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>
                      {info.resource.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>
                      {ROOM_TYPE_LABELS[info.resource.extendedProps.type as keyof typeof ROOM_TYPE_LABELS] ?? ''}
                    </div>
                  </div>
                )}
                eventContent={(info) => (
                  <div style={{
                    padding: '1px 5px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}>
                    {info.event.title}
                  </div>
                )}
              />
            </div>
          </>
        )}
      </Card>

      {/* ── Event detail modal ────────────────────────────── */}
      <Modal
        title={
          <Space>
            <span style={{ fontWeight: 600 }}>{selectedEvent?.reservationNumber}</span>
            {selectedEvent && (
              <Tag color={RESERVATION_STATUS_COLORS[selectedEvent.status]}>
                {RESERVATION_STATUS_LABELS[selectedEvent.status]}
              </Tag>
            )}
          </Space>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setModalOpen(false)}>Đóng</Button>
            <Button
              type="primary"
              onClick={() => {
                setModalOpen(false)
                navigate(`/reservations/${selectedEvent?.id}`)
              }}
            >
              Xem chi tiết
            </Button>
          </Space>
        }
      >
        {selectedEvent && (
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Khách">
              {selectedEvent.guest?.fullName ?? <em style={{ color: '#d1d5db' }}>Chưa có</em>}
            </Descriptions.Item>
            <Descriptions.Item label="Phòng">
              {selectedEvent.room?.name ?? `#${selectedEvent.roomId}`}
            </Descriptions.Item>
            <Descriptions.Item label="Check-in">
              {dayjs(selectedEvent.checkInTime).format('HH:mm, DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Check-out">
              {dayjs(selectedEvent.checkOutTime).format('HH:mm, DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Giá">
              <strong style={{ color: '#1d4ed8' }}>
                {selectedEvent.finalPrice.toLocaleString('vi-VN')}đ
              </strong>
            </Descriptions.Item>
            {selectedEvent.notes && (
              <Descriptions.Item label="Ghi chú">{selectedEvent.notes}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}
