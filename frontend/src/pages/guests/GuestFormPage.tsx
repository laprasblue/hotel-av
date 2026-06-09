import { Form, Input, Select, Button, Card, Typography, Space, message, Divider } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateGuest, useUpdateGuest } from '@/hooks/useGuests'

const { Title } = Typography
const { TextArea } = Input

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

export default function GuestFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const createGuest = useCreateGuest()
  const updateGuest = useUpdateGuest()

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      if (isEdit) {
        await updateGuest.mutateAsync({ id: Number(id), data: values })
        message.success('Cập nhật khách thành công')
      } else {
        await createGuest.mutateAsync(values)
        message.success('Tạo khách thành công')
      }
      navigate('/guests')
    } catch {
      message.error('Có lỗi xảy ra')
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="page-header">
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/guests')}
          />
          <Title level={4}>{isEdit ? 'Chỉnh sửa khách' : 'Thêm khách mới'}</Title>
        </Space>
      </div>

      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark="optional">
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Họ tên là bắt buộc' }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Space.Compact style={{ width: '100%', gap: 16, display: 'flex' }}>
            <Form.Item name="phone" label="Số điện thoại" style={{ flex: 1 }}>
              <Input placeholder="0901 234 567" />
            </Form.Item>
            <Form.Item name="email" label="Email" style={{ flex: 1 }}>
              <Input placeholder="email@example.com" />
            </Form.Item>
          </Space.Compact>

          <Space.Compact style={{ width: '100%', gap: 16, display: 'flex' }}>
            <Form.Item name="nationality" label="Quốc tịch" style={{ flex: 1 }}>
              <Select
                showSearch
                placeholder="Chọn quốc tịch..."
                options={NATIONALITY_OPTIONS}
                allowClear
              />
            </Form.Item>
            <Form.Item name="documentNumber" label="Số CCCD / Passport" style={{ flex: 1 }}>
              <Input placeholder="0123456789" />
            </Form.Item>
          </Space.Compact>

          <Form.Item name="address" label="Địa chỉ">
            <Input placeholder="123 Đường ABC, TP.HCM" />
          </Form.Item>

          <Divider />

          <div
            style={{
              background: '#fafafa',
              border: '1px dashed #d9d9d9',
              borderRadius: 8,
              padding: 24,
              textAlign: 'center',
              marginBottom: 16,
              color: '#8c8c8c',
            }}
          >
            Upload ảnh CCCD / Passport (mặt trước + mặt sau)
            <br />
            <small>Tính năng upload ảnh sẽ tích hợp với backend</small>
          </div>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={2} placeholder="Ghi chú về khách..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => navigate('/guests')}>Huỷ</Button>
            <Button type="primary" htmlType="submit">
              {isEdit ? 'Cập nhật' : 'Thêm khách'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}
