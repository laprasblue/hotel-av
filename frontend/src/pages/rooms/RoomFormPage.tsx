import { useEffect } from 'react'
import { Form, Input, Select, InputNumber, Button, Card, Typography, Space, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useRoom, useCreateRoom, useUpdateRoom } from '@/hooks/useRooms'
import { ROOM_TYPE_LABELS } from '@/types'
import type { RoomType } from '@/types'

const { Title } = Typography
const { TextArea } = Input

const roomTypeOptions = (Object.keys(ROOM_TYPE_LABELS) as RoomType[]).map((key) => ({
  value: key,
  label: ROOM_TYPE_LABELS[key],
}))

export default function RoomFormPage() {
  const { propertyId, roomId } = useParams<{ propertyId: string; roomId?: string }>()
  const isEdit = !!roomId
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const propId = Number(propertyId)

  const { data: room, isLoading } = useRoom(isEdit ? Number(roomId) : 0)
  const createRoom = useCreateRoom(propId)
  const updateRoom = useUpdateRoom(propId)

  useEffect(() => {
    if (room) form.setFieldsValue(room)
  }, [room, form])

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      if (isEdit) {
        await updateRoom.mutateAsync({ id: Number(roomId), data: values })
        message.success('Cập nhật phòng thành công')
      } else {
        await createRoom.mutateAsync(values)
        message.success('Tạo phòng thành công')
      }
      navigate(`/properties/${propertyId}`)
    } catch {
      message.error('Có lỗi xảy ra')
    }
  }

  const isPending = createRoom.isPending || updateRoom.isPending

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="page-header">
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/properties/${propertyId}`)}
          />
          <Title level={4}>{isEdit ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}</Title>
        </Space>
      </div>

      <Card loading={isEdit && isLoading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Form.Item
            name="name"
            label="Tên phòng"
            rules={[{ required: true, message: 'Tên phòng là bắt buộc' }]}
          >
            <Input placeholder="VD: Phòng 101, Suite A..." />
          </Form.Item>

          <Form.Item name="type" label="Loại phòng">
            <Select placeholder="Chọn loại phòng..." options={roomTypeOptions} allowClear />
          </Form.Item>

          <Form.Item name="capacity" label="Sức chứa (người)">
            <InputNumber min={1} max={20} style={{ width: '100%' }} placeholder="2" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả về phòng..." />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ phòng (nếu cần)">
            <Input placeholder="VD: Tầng 3, Block A..." />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú nội bộ">
            <TextArea rows={2} placeholder="Ghi chú dành cho nhân viên..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => navigate(`/properties/${propertyId}`)}>Huỷ</Button>
            <Button type="primary" htmlType="submit" loading={isPending}>
              {isEdit ? 'Cập nhật' : 'Tạo phòng'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}
