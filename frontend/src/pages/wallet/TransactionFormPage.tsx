import { Form, Input, InputNumber, Select, DatePicker, Button, Card, Typography, Space, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { TRANSACTION_TYPE_LABELS } from '@/types'
import type { TransactionType } from '@/types'
import dayjs from 'dayjs'

const { Title } = Typography
const { TextArea } = Input

const typeOptions = (Object.keys(TRANSACTION_TYPE_LABELS) as TransactionType[]).map((k) => ({
  value: k,
  label: TRANSACTION_TYPE_LABELS[k],
}))

export default function TransactionFormPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const handleSubmit = async (values: Record<string, unknown>) => {
    console.log('Transaction:', values)
    // TODO: connect API
    message.success('Tạo giao dịch thành công')
    navigate('/wallet')
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="page-header">
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/wallet')}
          />
          <Title level={4}>Tạo giao dịch mới</Title>
        </Space>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
          initialValues={{ date: dayjs() }}
        >
          <Form.Item
            name="type"
            label="Loại giao dịch"
            rules={[{ required: true, message: 'Chọn loại giao dịch' }]}
          >
            <Select placeholder="Thu / Chi / Điều chỉnh" options={typeOptions} />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Số tiền (đ)"
            rules={[{ required: true, message: 'Nhập số tiền' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="500,000"
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => (v ? parseFloat(v.replace(/,/g, '')) : 0) as 0}
            />
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày giao dịch"
            rules={[{ required: true, message: 'Chọn ngày' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Nhập mô tả' }]}
          >
            <Input placeholder="VD: Thu tiền phòng 101, Chi phí điện nước..." />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={2} placeholder="Ghi chú thêm..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => navigate('/wallet')}>Huỷ</Button>
            <Button type="primary" htmlType="submit">
              Tạo giao dịch
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}
