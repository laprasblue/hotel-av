import { useRef, useState } from 'react'
import {
  Card, Steps, Typography, Button, Space, Form, Select, DatePicker,
  InputNumber, Input, Divider, Tag, Row, Col, Alert, Checkbox, message,
} from 'antd'
import { ArrowLeftOutlined, UserOutlined, SearchOutlined, HomeOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs, { type Dayjs } from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { useRooms } from '@/hooks/useRooms'
import { useGuests, useCreateGuest } from '@/hooks/useGuests'
import { useCreateReservation } from '@/hooks/useReservations'
import { useAppStore } from '@/store/appStore'
import type { Room, Guest, Surcharge, SurchargeCategory } from '@/types'
import { ROOM_TYPE_LABELS, SURCHARGE_CATEGORY_LABELS } from '@/types'

dayjs.extend(duration)

const { Title, Text } = Typography
const { TextArea } = Input

const steps = [
  { title: 'Chọn phòng', description: 'Property, phòng, thời gian' },
  { title: 'Thông tin khách', description: 'Tìm hoặc tạo khách' },
  { title: 'Xác nhận giá', description: 'Review & confirm' },
]

const numberFormatter = (v: number | string | undefined) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
const numberParser = (v: string | undefined) => parseFloat(v?.replace(/,/g, '') ?? '0') as 0

const SURCHARGE_CATEGORY_OPTIONS = (Object.keys(SURCHARGE_CATEGORY_LABELS) as SurchargeCategory[]).map((value) => ({
  value,
  label: SURCHARGE_CATEGORY_LABELS[value],
}))

interface SurchargeRow extends Surcharge {
  id: number
}

const NATIONALITY_OPTIONS = [
  { value: 'VN', label: 'Việt Nam' },
  { value: 'US', label: 'Hoa Kỳ' },
  { value: 'CN', label: 'Trung Quốc' },
  { value: 'KR', label: 'Hàn Quốc' },
  { value: 'JP', label: 'Nhật Bản' },
  { value: 'AU', label: 'Úc' },
  { value: 'GB', label: 'Anh' },
  { value: 'FR', label: 'Pháp' },
  { value: 'DE', label: 'Đức' },
  { value: 'OTHER', label: 'Khác' },
]

export default function ReservationFormPage() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [form1] = Form.useForm()
  const [form2] = Form.useForm()
  const [form3] = Form.useForm()

  const { selectedProperty } = useAppStore()
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [checkIn, setCheckIn] = useState<Dayjs | null>(null)
  const [checkOut, setCheckOut] = useState<Dayjs | null>(null)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [guestSearch, setGuestSearch] = useState('')
  const [showNewGuestForm, setShowNewGuestForm] = useState(false)
  const [manualPrice, setManualPrice] = useState(false)
  const [pricePerNightInput, setPricePerNightInput] = useState(0)
  const [surcharges, setSurcharges] = useState<SurchargeRow[]>([])
  const nextSurchargeId = useRef(1)

  const { data: rooms = [] } = useRooms(selectedProperty?.id ?? 0)
  const { data: allGuests = [] } = useGuests()
  const createReservation = useCreateReservation()
  const createGuest = useCreateGuest()

  const [lastPropertyId, setLastPropertyId] = useState(selectedProperty?.id)
  if (selectedProperty?.id !== lastPropertyId) {
    setLastPropertyId(selectedProperty?.id)
    setSelectedRoom(null)
    form1.setFieldValue('roomId', undefined)
  }

  const [lastRoomId, setLastRoomId] = useState(selectedRoom?.id)
  if (selectedRoom?.id !== lastRoomId) {
    setLastRoomId(selectedRoom?.id)
    setPricePerNightInput(selectedRoom?.pricePerNight ?? 0)
    setSurcharges([])
  }

  const nights = checkIn && checkOut && checkOut.isAfter(checkIn)
    ? Math.max(1, Math.ceil(checkOut.diff(checkIn, 'hour', true) / 24))
    : 0

  const additionTotal = surcharges.reduce((sum, s) => sum + (s.amount || 0), 0)
  const totalBase = pricePerNightInput * nights + additionTotal

  const addSurcharge = () => {
    setSurcharges((prev) => [
      ...prev,
      { id: nextSurchargeId.current++, category: 'BROKEN_FACILITY', amount: 0, notes: '' },
    ])
  }
  const removeSurcharge = (id: number) => setSurcharges((prev) => prev.filter((s) => s.id !== id))
  const updateSurcharge = (id: number, patch: Partial<SurchargeRow>) =>
    setSurcharges((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))

  const filteredGuests = allGuests.filter(
    (g) =>
      g.fullName.toLowerCase().includes(guestSearch.toLowerCase()) ||
      g.phone?.includes(guestSearch) ||
      g.documentNumber?.includes(guestSearch)
  )

  const handleCreateGuest = async () => {
    let vals: Record<string, unknown>
    try {
      vals = await form2.validateFields()
    } catch {
      return
    }
    try {
      const newGuest = await createGuest.mutateAsync(vals)
      setSelectedGuest(newGuest)
      setShowNewGuestForm(false)
      form2.resetFields()
      message.success('Tạo khách thành công')
    } catch {
      message.error('Có lỗi xảy ra khi tạo khách')
    }
  }

  const handleNextStep1 = async () => {
    if (!selectedProperty) {
      message.warning('Vui lòng chọn Hotel ở thanh trên cùng trước')
      return
    }
    try {
      await form1.validateFields(['roomId'])
    } catch {
      return
    }
    if (!checkIn || !checkOut) {
      message.warning('Vui lòng chọn check-in và check-out')
      return
    }
    if (!checkOut.isAfter(checkIn)) {
      message.warning('Check-out phải sau check-in')
      return
    }
    setCurrent(1)
  }

  const handleSubmit = async () => {
    try {
      const vals = form3.getFieldsValue()
      const finalPrice = manualPrice ? (vals.finalPrice ?? totalBase) : totalBase - (vals.discount ?? 0)
      const discount = totalBase - finalPrice
      const validSurcharges: Surcharge[] = surcharges
        .filter((s) => s.amount > 0 || s.notes?.trim() || (s.category === 'OTHER' && s.customCategory?.trim()))
        .map((s) => ({ category: s.category, customCategory: s.customCategory, amount: s.amount, notes: s.notes }))
      await createReservation.mutateAsync({
        propertyId: selectedProperty!.id,
        roomId: selectedRoom!.id,
        guestId: selectedGuest?.id,
        checkInTime: checkIn!.toISOString(),
        checkOutTime: checkOut!.toISOString(),
        price: totalBase,
        discount,
        finalPrice,
        surcharges: validSurcharges.length ? validSurcharges : undefined,
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
      <Form.Item label="Property">
        <Tag icon={<HomeOutlined />} color="blue" style={{ fontSize: 13, padding: '4px 10px' }}>
          {selectedProperty?.name}
        </Tag>
        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
          Đổi hotel ở thanh trên cùng
        </Text>
      </Form.Item>

      <Form.Item name="roomId" label="Phòng" rules={[{ required: true, message: 'Chọn phòng' }]}>
        <Select
          placeholder="Chọn phòng..."
          options={rooms.map((r) => ({
            value: r.id,
            label: (
              <Space>
                <span>{r.name}</span>
                <Tag color="blue" style={{ fontSize: 11 }}>{ROOM_TYPE_LABELS[r.type]}</Tag>
                {r.capacity && <Text type="secondary" style={{ fontSize: 12 }}>{r.capacity} người</Text>}
                {r.pricePerNight ? (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Gợi ý: {r.pricePerNight.toLocaleString('vi-VN')}đ/đêm
                    {r.pricePerHour ? ` · ${r.pricePerHour.toLocaleString('vi-VN')}đ/giờ` : ''}
                  </Text>
                ) : (
                  <Text type="warning" style={{ fontSize: 12 }}>
                    Chưa thiết lập giá - cập nhật ở trang Phòng
                  </Text>
                )}
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
          <Form.Item label="Check-in">
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Ngày & giờ nhận phòng"
              value={checkIn}
              disabledDate={(d) => d.isBefore(dayjs().startOf('day'))}
              onChange={(val) => {
                setCheckIn(val)
                if (checkOut && val && !checkOut.isAfter(val)) {
                  setCheckOut(null)
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Check-out">
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Ngày & giờ trả phòng"
              value={checkOut}
              disabled={!checkIn}
              disabledDate={(d) => !checkIn || d.isBefore(checkIn, 'day')}
              onChange={setCheckOut}
            />
          </Form.Item>
        </Col>
      </Row>

      {selectedRoom && checkIn && checkOut && nights > 0 && (
        <Alert
          type="info"
          style={{ marginTop: 4 }}
          description={
            <span style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <strong>{selectedRoom.name}</strong>
              <span>·</span>
              <span>{checkIn.format('DD/MM HH:mm')} → {checkOut.format('DD/MM HH:mm')}</span>
              <span>·</span>
              <Tag>{nights} đêm</Tag>
            </span>
          }
        />
      )}
    </Form>
  )

  // ── Step 2 ────────────────────────────────────────────────
  const step2 = (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm khách theo tên, số điện thoại, CCCD..."
          value={guestSearch}
          onChange={(e) => setGuestSearch(e.target.value)}
          allowClear
          style={{ flex: 1 }}
        />
        <Button
          icon={<PlusOutlined />}
          onClick={() => setShowNewGuestForm((v) => !v)}
        >
          Tạo khách mới
        </Button>
      </div>

      {showNewGuestForm && (
        <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
          <Form form={form2} layout="vertical" requiredMark="optional">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="fullName"
                  label="Họ và tên"
                  rules={[{ required: true, message: 'Họ tên là bắt buộc' }]}
                >
                  <Input placeholder="Nguyễn Văn A" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="phone" label="Số điện thoại">
                  <Input placeholder="0901 234 567" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="documentNumber" label="Số CCCD / Passport">
                  <Input placeholder="0123456789" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="nationality" label="Quốc tịch" initialValue="VN">
                  <Select showSearch options={NATIONALITY_OPTIONS} />
                </Form.Item>
              </Col>
            </Row>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => { setShowNewGuestForm(false); form2.resetFields() }}>
                Huỷ
              </Button>
              <Button type="primary" loading={createGuest.isPending} onClick={handleCreateGuest}>
                Tạo & chọn khách
              </Button>
            </div>
          </Form>
        </Card>
      )}

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
            <div style={{ fontWeight: 500 }}>{nights} đêm</div>
          </Col>
        </Row>
      </Card>

      <Form form={form3} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Giá / đêm (đ)">
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                value={pricePerNightInput}
                onChange={(v) => setPricePerNightInput(v ?? 0)}
                formatter={numberFormatter}
                parser={numberParser}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Số đêm">
              <InputNumber value={nights} disabled style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Tổng phụ thu (đ)" tooltip="Tổng các khoản phụ thu bên dưới">
              <InputNumber
                value={additionTotal}
                disabled
                style={{ width: '100%' }}
                formatter={numberFormatter}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Phụ thu" style={{ marginBottom: 8 }}>
          {surcharges.length === 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>Chưa có phụ thu nào</Text>
          )}
          {surcharges.map((s) => (
            <div key={s.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
              <Select
                style={{ width: 170 }}
                value={s.category}
                options={SURCHARGE_CATEGORY_OPTIONS}
                onChange={(category: SurchargeCategory) =>
                  updateSurcharge(s.id, { category, customCategory: category === 'OTHER' ? s.customCategory : undefined })
                }
              />
              {s.category === 'OTHER' && (
                <Input
                  style={{ width: 150 }}
                  placeholder="Loại khác..."
                  value={s.customCategory}
                  onChange={(e) => updateSurcharge(s.id, { customCategory: e.target.value })}
                />
              )}
              <InputNumber
                min={0}
                style={{ width: 140 }}
                placeholder="Số tiền"
                value={s.amount}
                onChange={(v) => updateSurcharge(s.id, { amount: v ?? 0 })}
                formatter={numberFormatter}
                parser={numberParser}
              />
              <Input
                style={{ flex: 1 }}
                placeholder="Ghi chú"
                value={s.notes}
                onChange={(e) => updateSurcharge(s.id, { notes: e.target.value })}
              />
              <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeSurcharge(s.id)} />
            </div>
          ))}
          <Button type="dashed" icon={<PlusOutlined />} onClick={addSurcharge}>
            Thêm phụ thu
          </Button>
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Giá gốc (đ)">
              <InputNumber
                value={totalBase}
                disabled
                style={{ width: '100%' }}
                formatter={numberFormatter}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="discount" label="Giảm giá (đ)" initialValue={0}>
              <InputNumber
                min={0}
                max={totalBase}
                disabled={manualPrice}
                style={{ width: '100%' }}
                formatter={numberFormatter}
                parser={numberParser}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Thành tiền (đ)">
              {manualPrice ? (
                <Form.Item name="finalPrice" noStyle initialValue={totalBase}>
                  <InputNumber
                    min={0}
                    style={{ width: '100%', fontWeight: 600 }}
                    formatter={numberFormatter}
                    parser={numberParser}
                  />
                </Form.Item>
              ) : (
                <Form.Item noStyle shouldUpdate>
                  {() => {
                    const disc = form3.getFieldValue('discount') ?? 0
                    const final = totalBase - disc
                    return (
                      <InputNumber
                        value={final}
                        disabled
                        style={{ width: '100%', fontWeight: 600 }}
                        formatter={numberFormatter}
                      />
                    )
                  }}
                </Form.Item>
              )}
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Checkbox
            checked={manualPrice}
            onChange={(e) => {
              setManualPrice(e.target.checked)
              if (e.target.checked) {
                form3.setFieldValue('finalPrice', totalBase - (form3.getFieldValue('discount') ?? 0))
              }
            }}
          >
            Nhập giá cuối thủ công (ghi đè giá tính tự động)
          </Checkbox>
        </Form.Item>

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

      {!selectedProperty && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
          title="Chưa chọn Hotel"
          description="Vui lòng chọn Property/Hotel ở thanh trên cùng trước khi tạo reservation, để tránh đặt nhầm phòng của hotel khác."
        />
      )}

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
