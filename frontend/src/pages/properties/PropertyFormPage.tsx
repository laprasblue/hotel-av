import { useEffect } from 'react'
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Typography,
  Space,
  message,
  Divider,
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useProperty, useCreateProperty, useUpdateProperty } from '@/hooks/useProperties'
import { PROPERTY_TYPE_LABELS, AMENITY_OPTIONS } from '@/types'
import type { PropertyType } from '@/types'

const { Title } = Typography
const { TextArea } = Input

const propertyTypeOptions = (Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map(
  (key) => ({ value: key, label: PROPERTY_TYPE_LABELS[key] })
)

const amenityOptions = AMENITY_OPTIONS.map((a) => ({ value: a, label: a }))

export default function PropertyFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const { data: property, isLoading } = useProperty(isEdit ? Number(id) : 0)
  const createProperty = useCreateProperty()
  const updateProperty = useUpdateProperty()

  useEffect(() => {
    if (property) form.setFieldsValue(property)
  }, [property, form])

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      if (isEdit) {
        await updateProperty.mutateAsync({ id: Number(id), data: values })
        message.success('Cập nhật thành công')
      } else {
        await createProperty.mutateAsync(values)
        message.success('Tạo property thành công')
      }
      navigate('/properties')
    } catch {
      message.error('Có lỗi xảy ra')
    }
  }

  const isPending = createProperty.isPending || updateProperty.isPending

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="page-header">
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/properties')}
          />
          <Title level={4}>{isEdit ? 'Chỉnh sửa Property' : 'Tạo Property mới'}</Title>
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
            label="Tên Property"
            rules={[{ required: true, message: 'Tên property là bắt buộc' }]}
          >
            <Input placeholder="VD: Khách sạn ABC" size="large" />
          </Form.Item>

          <Form.Item name="type" label="Loại Property">
            <Select
              placeholder="Chọn loại..."
              options={propertyTypeOptions}
              allowClear
            />
          </Form.Item>

          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="0901 234 567" />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input placeholder="123 Đường ABC, Quận 1, TP.HCM" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả ngắn về property..." />
          </Form.Item>

          <Form.Item name="amenities" label="Tiện ích">
            <Select
              mode="multiple"
              placeholder="Chọn tiện ích..."
              options={amenityOptions}
              allowClear
            />
          </Form.Item>

          <Divider />

          <Form.Item name="checkInInstructions" label="Hướng dẫn nhận phòng">
            <TextArea rows={3} placeholder="VD: Nhận phòng từ 14:00, xuất trình CCCD tại lễ tân..." />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú nội bộ">
            <TextArea rows={2} placeholder="Ghi chú chỉ dành cho nhân viên..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => navigate('/properties')}>Huỷ</Button>
            <Button type="primary" htmlType="submit" loading={isPending}>
              {isEdit ? 'Cập nhật' : 'Tạo Property'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}
