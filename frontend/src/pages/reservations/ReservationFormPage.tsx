import { useState } from 'react'
import {
  Card, Steps, Typography, Button, Space, Form, Select, DatePicker,
  InputNumber, Input, Divider, Tag, Row, Col, Alert, message,
} from 'antd'
import { ArrowLeftOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs, { type Dayjs } from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { useProperties } from '@/hooks/useProperties'
import { useRooms } from '@/hooks/useRooms'
import { useGuests } from '@/hooks/useGuests'
import { useCreateReservation } from '@/hooks/useReservations'
import type { Property, Room, Guest } from '@/types'
import { ROOM_TYPE_LABELS } from '@/types'

dayjs.extend(duration)

const { Title, Text } = Typography
const { TextArea } = Input

const steps = [
  { title: 'Chọn phòng', description: 'Property, phòng, thời gian' },
  { title: 'Thông tin khách', description: 'Tìm hoặc tạo khách' },
  { title: 'Xác nhận giá', description: 'Review & confirm' },
]

const PRICE_PER_NIGHT: Record<number, number> = {
  101: 650_000, 102: 650_000,
  103: 850_000, 104: 950_000,
  105: 2_200_000, 106: 1_400_000,
  201: 420_000, 202: 520_000, 203: 580_000, 204: 750_000,
  301: 4_500_000, 302: 3_800_000, 303: 3_200_000,
}

function calcNights(checkIn: Dayjs | null, checkOut: Dayjs | null) {
  if (!checkIn || !checkOut) return 0
  return Math.max(1, checkOut.diff(checkIn, 'hour') / 24)
}

export default function ReservationFormPage() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [form1] = Form.useForm()
  const [form3] = Form.useForm()

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [checkIn, setCheckIn] = useState<Dayjs | null>(null)
  const [checkOut, setCheckOut] = useState<Dayjs | null>(null)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [guestSearch, setGuestSearch] = useState('')

  const { data: properties = [] } = useProperties()
  const { data: rooms = [] } = useRooms(selectedProperty?.id ?? 0)
  const { data: allGuests = [] } = useGuests()
  const createReservation = useCreateReservation()

  const nights = calcNights(checkIn, checkOut)
  const basePrice = selectedRoom ? (PRICE_PER_NIGHT[selectedRoom.id] ?? 500_000) : 0
  const totalBase = Math.round(basePrice * nights)

  const filteredGuests = allGuests.filter(
    (g) =>
      g.fullName.toLowerCase().includes(guestSearch.toLowerCase()) ||
      g.phone?.includes(guestSearch) ||
      g.documentNumber?.includes(guestSearch)
  )

  const handleNextStep1 = async () => {
    try {
      await form1.validateFields()
      setCurrent(1)
    } catch {}
  }

  const handleSubmit = async () => {
    try {
      const vals = form3.getFieldsValue()
      const discount = vals.discount ?? 0
      await createReservation.mutateAsync({
        propertyId: selectedProperty!.id,
        roomId: selectedRoom!.id,
        guestId: selectedGuest?.id,
        checkInTime: checkIn!.toISOString(),
        checkOutTime: checkOut!.toISOString(),
        price: totalBase,
        discount,
        finalPrice: totalBase - discount,
        notes: vals.notes,
      })
      message.success('Tạo reservation thành công!')
      navigate('/reservations')
    } catch {
      message.error('Có lỗi xảy ra')
    }
  }

  // ── Step 1 ────────────────────────────────────────────────
  const step1 = (
    <Form form={form1} layout="vertical" requiredMark="optional">
      <Form.Item name="propertyId" label="Property" rules={[{ required: true, message: 'Chọn property' }]}>
        <Select
          placeholder="Chọn property..."
          options={properties.map((p) => ({ value: p.id, label: p.name }))}
          onChange={(id) => {
            const prop = properties.find((p) => p.id === id) ?? null
            setSelectedProperty(prop)
            setSelectedRoom(null)
            form1.setFieldValue('roomId', undefined)
          }}
        />
      </Form.Item>

      <Form.Item name="roomId" label="Phòng" rules={[{ required: true, message: 'Chọn phòng' }]}>
        <Select
          placeholder={selectedProperty ? 'Chọn phòng...' : 'Chọn property trước'}
          disabled={!selectedProperty}
          options={rooms.map((r) => ({
            value: r.id,
            label: (
              <Space>
                <span>{r.name}</span>
                <Tag color="blue" style={{ fontSize: 11 }}>{ROOM_TYPE_LABELS[r.type]}</Tag>
                {r.capacity && <Text type="secondary" style={{ fontSize: 12 }}>{r.capacity} người</Text>}
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {(PRICE_PER_NIGHT[r.id] ?? 500_000).toLocaleString('vi-VN')}đ/đêm
                </Text>
              </Space>
            ),
          }))}
          onChange={(id) => {
            const room = rooms.find((r) => r.id === id) ?? null
            setSelectedRoom(room)
          }}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="checkIn" label="Check-in" rules={[{ required: true, message: 'Chọn ngày check-in' }]}>
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Ngày & giờ nhận phòng"
              disabledDate={(d) => d.isBefore(dayjs().startOf('day'))}
              onChange={(val) => {
                setCheckIn(val)
                if (checkOut && val && checkOut.isBefore(val)) {
                  setCheckOut(null)
                  form1.setFieldValue('checkOut', null)
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="checkOut" label="Check-out" rules={[{ required: true, message: 'Chọn ngày check-out' }]}>
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Ngày & giờ trả phòng"
              disabled={!checkIn}
              disabledDate={(d) => !checkIn || d.isBefore(checkIn)}
              onChange={(val) => setCheckOut(val)}
            />
          </Form.Item>
        </Col>
      </Row>

      {selectedRoom && checkIn && checkOut && (
        <Alert
          type="info"
          style={{ marginTop: 4 }}
          description={
            <span style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <strong>{selectedRoom.name}</strong>
              <span>·</span>
              <span>{checkIn.format('DD/MM HH:mm')} → {checkOut.format('DD/MM HH:mm')}</span>
              <span>·</span>
              <span>{nights % 1 === 0 ? nights : nights.toFixed(1)} đêm</span>
              <span>·</span>
              <span style={{ color: '#1677ff', fontWeight: 600 }}>
                {totalBase.toLocaleString('vi-VN')}đ
              </span>
            </span>
          }
        />
      )}
    </Form>
  )

  // ── Step 2 ────────────────────────────────────────────────
  const step2 = (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm khách theo tên, số điện thoại, CCCD..."
          value={guestSearch}
          onChange={(e) => setGuestSearch(e.target.value)}
          allowClear
        />
      </div>

      {selectedGuest && (
        <Alert
          type="success"
          style={{ marginBottom: 16 }}
          description={
            <Space>
              <UserOutlined />
              <strong>{selectedGuest.fullName}</strong>
              <Text type="secondary">{selectedGuest.phone}</Text>
              <Text type="secondary">{selectedGuest.documentNumber}</Text>
              <Button size="small" type="link" onClick={() => setSelectedGuest(null)}>
                Bỏ chọn
              </Button>
            </Space>
          }
        />
      )}

      <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: 8 }}>
        {filteredGuests.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#8c8c8c' }}>
            Không tìm thấy khách
          </div>
        ) : (
          filteredGuests.map((g) => (
            <div
              key={g.id}
              onClick={() => setSelectedGuest(g)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f5f5f5',
                background: selectedGuest?.id === g.id ? '#e6f4ff' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { if (selectedGuest?.id !== g.id) (e.currentTarget as HTMLDivElement).style.background = '#fafafa' }}
              onMouseLeave={(e) => { if (selectedGuest?.id !== g.id) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
            >
              <Space>
                <UserOutlined style={{ color: '#1677ff' }} />
                <div>
                  <div style={{ fontWeight: 500 }}>{g.fullName}</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                    {[g.phone, g.documentNumber, g.nationality].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </Space>
            </div>
          ))
        )}
      </div>

      <Divider plain style={{ color: '#8c8c8c', fontSize: 12 }}>
        Hoặc để trống — có thể bổ sung thông tin khách sau
      </Divider>
    </div>
  )

  // ── Step 3 ────────────────────────────────────────────────
  const step3 = (
    <div>
      <Card size="small" style={{ marginBottom: 20, background: '#fafafa' }}>
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text type="secondary">Property</Text>
            <div style={{ fontWeight: 500 }}>{selectedProperty?.name}</div>
          </Col>
          <Col span={12}>
            <Text type="secondary">Phòng</Text>
            <div style={{ fontWeight: 500 }}>{selectedRoom?.name}</div>
          </Col>
          <Col span={12}>
            <Text type="secondary">Check-in</Text>
            <div style={{ fontWeight: 500 }}>{checkIn?.format('HH:mm, DD/MM/YYYY')}</div>
          </Col>
          <Col span={12}>
            <Text type="secondary">Check-out</Text>
            <div style={{ fontWeight: 500 }}>{checkOut?.format('HH:mm, DD/MM/YYYY')}</div>
          </Col>
          <Col span={12}>
            <Text type="secondary">Khách</Text>
            <div style={{ fontWeight: 500 }}>
              {selectedGuest?.fullName ?? <em style={{ color: '#bfbfbf' }}>Chưa chọn</em>}
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">Thời lưu trú</Text>
            <div style={{ fontWeight: 500 }}>{nights % 1 === 0 ? nights : nights.toFixed(1)} đêm</div>
          </Col>
        </Row>
      </Card>

      <Form form={form3} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Giá gốc (đ)">
              <InputNumber
                value={totalBase}
                disabled
                style={{ width: '100%' }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="discount" label="Giảm giá (đ)" initialValue={0}>
              <InputNumber
                min={0}
                max={totalBase}
                style={{ width: '100%' }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => parseFloat(v?.replace(/,/g, '') ?? '0') as 0}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Thành tiền (đ)">
              <Form.Item noStyle shouldUpdate>
                {() => {
                  const disc = form3.getFieldValue('discount') ?? 0
                  const final = totalBase - disc
                  return (
                    <InputNumber
                      value={final}
                      disabled
                      style={{ width: '100%', fontWeight: 600 }}
                      formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  )
                }}
              </Form.Item>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="notes" label="Ghi chú">
          <TextArea rows={3} placeholder="Yêu cầu đặc biệt, ghi chú cho nhân viên..." />
        </Form.Item>
      </Form>
    </div>
  )

  const stepContent = [step1, step2, step3]

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="page-header">
        <Space>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/reservations')} />
          <Title level={4}>Tạo Reservation mới</Title>
        </Space>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Steps current={current} items={steps} />
      </Card>

      <Card>
        <div style={{ minHeight: 280 }}>{stepContent[current]}</div>

        <Divider style={{ margin: '20px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => navigate('/reservations')}>Huỷ</Button>
          <Space>
            {current > 0 && (
              <Button onClick={() => setCurrent(current - 1)}>Quay lại</Button>
            )}
            {current < steps.length - 1 ? (
              <Button
                type="primary"
                onClick={current === 0 ? handleNextStep1 : () => setCurrent(current + 1)}
              >
                Tiếp theo
              </Button>
            ) : (
              <Button
                type="primary"
                loading={createReservation.isPending}
                onClick={handleSubmit}
                disabled={!selectedRoom || !checkIn || !checkOut}
              >
                Xác nhận đặt phòng
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  )
}
