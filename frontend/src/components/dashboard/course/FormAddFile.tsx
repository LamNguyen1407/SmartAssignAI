"use client"

import React, { useState } from 'react';
import { Modal, Upload, Typography, Tabs, Alert, Divider, Popover, Timeline, Tag, Form } from 'antd';
import {
    FileMarkdownOutlined,
    InboxOutlined,
    TableOutlined,
    FileImageOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { uploadFile } from '@/services/course.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/useAuthStore';

const { Dragger } = Upload;
const { Text, Title, Paragraph } = Typography;

export default function AddDocumentModal({ open, onCancel, data }: { open: boolean, onCancel: () => void, data?: any }) {
    const [fileList, setFileList] = useState<any>([]);
    const { user, role } = useAuthStore();
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { mutate: uploadMutation, isPending: uploading } = useMutation({
        mutationFn: (data: { userID: any; courseId: any, file: File }) => uploadFile(data),
        onSuccess: (data) => {
            setFileList([]);
            onCancel();
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['dashboard-get-course-file'] });
            toast.success("upload thành công");
        },
        onError: (error) => { toast.error(error.message) }
    });

    const handleSubmit = () => {
        const value = form.getFieldsValue();
        const obj = {
            userID: user,
            courseId: data?._id,
            file: value.file[0].originFileObj,
        };
        console.log(obj)
        if (role === 'admin') uploadMutation(obj);
    }

    const exampleContent = (
        <div className="max-w-[350px]">
            <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 shadow-inner">
                <code className="text-blue-300 text-[11px] leading-relaxed block">
                    ![Hình 1: Biểu đồ cột doanh số 2025. Trục tung là VNĐ, trục hoành là tháng.
                    Tháng 12 đạt đỉnh 50 tỷ nhờ chiến dịch Tết, tháng 2 thấp nhất (10 tỷ) do kỳ nghỉ lễ.]
                </code>
            </div>
            <Divider className="my-2" />
            <div className="space-y-1">
                <div className="flex gap-2">
                    <Tag color="success" className="m-0 text-[10px]">Nên</Tag>
                    <Text className="text-[11px]">Ghi rõ các con số, xu hướng của dữ liệu.</Text>
                </div>
                <div className="flex gap-2 mt-1">
                    <Tag color="error" className="m-0 text-[10px]">Không</Tag>
                    <Text className="text-[11px]">Chỉ ghi: "Đây là ảnh doanh thu".</Text>
                </div>
            </div>
        </div>
    );
    const guideItems = [
        {
            key: '1',
            label: <span className="flex items-center gap-1"><TableOutlined /> Định nghĩa bảng</span>,
            children: (
                <div className="space-y-2">
                    <Text className="text-gray-500 italic text-sm font-medium">Dùng dấu gạch đứng (|) để chia cột:</Text>
                    <div className="bg-slate-800 p-3 rounded-lg">
                        <pre className="text-blue-300 text-[11px] m-0">
                            {`| Tiêu đề A | Tiêu đề B |
| --------- | --------- |
| Dữ liệu 1 | Dữ liệu 2 |`}
                        </pre>
                    </div>
                </div>
            )
        },
        {
            key: '2',
            label: <span className="flex items-center gap-1"><FileImageOutlined /> Mô tả Hình ảnh</span>,
            children: (
                <div className="space-y-4">
                    <Timeline
                        items={[
                            {
                                color: 'green',
                                children: (
                                    <>
                                        <Text strong>Bước 1: Xác định loại ảnh</Text>
                                        <p className="text-xs text-gray-500">Đó là Biểu đồ, Sơ đồ, hay Ảnh chụp?</p>
                                    </>
                                ),
                            },
                            {
                                color: 'blue',
                                children: (
                                    <>
                                        <Text strong>Bước 2: Liệt kê thông số (Nếu có)</Text>
                                        <p className="text-xs text-gray-500">Ghi lại các con số, tên các bước hoặc nhãn (labels) có trong ảnh.</p>
                                    </>
                                ),
                            },
                            {
                                color: 'orange',
                                children: (
                                    <>
                                        <Popover
                                            content={exampleContent}
                                            title={<span className="font-bold text-gray-700">Mẫu mô tả hình ảnh</span>}
                                            placement="right"
                                            overlayClassName="rounded-2xl shadow-xl"
                                        >
                                            <div className="cursor-help flex flex-col items-start">
                                                <Text strong className="text-indigo-900">
                                                    Bước 3: Viết câu mô tả hoàn chỉnh
                                                </Text>
                                                <div className="mt-1 flex items-center gap-1">
                                                    <Tag color="blue" className="m-0 text-[10px] py-0 px-2">
                                                        💡 Rê chuột xem ví dụ mẫu
                                                    </Tag>
                                                </div>
                                            </div>
                                        </Popover>
                                    </>
                                ),
                            },
                        ]}
                    />
                </div>
            )
        }
    ];

    return (
        <Modal
            open={open}
            onCancel={() => {
                setFileList([]);
                form.resetFields();
                onCancel();
            }}
            footer={null}
            width={900}
            title={
                <div className="flex items-center gap-2">
                    <FileMarkdownOutlined className="text-blue-600 text-xl" />
                    <span className="font-bold">Thêm tài liệu cho môn {data ? data.name : "học"}</span>
                </div>
            }
        >
            <div className="flex flex-col md:flex-row gap-8 py-4">

                <div className="w-full md:w-5/12 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <Title level={5} className="flex items-center gap-2 text-blue-800">
                        <InfoCircleOutlined /> Hướng dẫn định dạng Markdown
                    </Title>
                    <Paragraph className="text-xs text-gray-500">
                        Hệ thống chỉ nhận file <Text code>.md</Text>. Để AI xử lý chính xác nhất, vui lòng tuân thủ các quy tắc sau:
                    </Paragraph>

                    <Tabs items={guideItems} size="small" className="mt-4" />

                    <Divider className="my-4" />

                    <div className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                        <div className="flex gap-2 text-[14px] text-indigo-600">
                            <p className="leading-relaxed">
                                <b className="text-indigo-700">Mẹo tối ưu:</b> Giảng viên có thể dùng công cụ
                                <a
                                    href="https://cloudconvert.com/pdf-to-md"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mx-1 text-indigo-800 underline font-bold hover:text-indigo-900"
                                >
                                    chuyển đổi tự động tại đây
                                </a>,
                                sau đó <b className="text-indigo-700">kiểm tra lại cấu trúc bảng và mô tả hình ảnh</b>.
                                Dữ liệu không tốt có thể dẫn tới câu trả lời thiếu chính xác.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-7/12 flex flex-col">
                    <Title level={5} className="mb-4">Tải tệp tin</Title>
                    <Form
                        form={form}
                    >
                        <Form.Item
                            name="file" // Khớp với key 'file' bạn dùng trong form.getFieldsValue()
                            valuePropName="fileList"
                            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                            rules={[{ required: true, message: 'Vui lòng chọn file!' }]}
                        >
                            {(fileList.length > 0) ? (
                                <div className="mt-4 p-4 border rounded-xl bg-blue-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold">
                                            MD
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 mb-0">{fileList[0].name}</p>
                                            <p className="text-xs text-gray-500 mb-0">
                                                {(fileList[0].size / 1024).toFixed(2)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFileList([])}
                                        className="text-red-500 hover:text-red-700 font-semibold text-sm"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            ) : (
                                <Dragger
                                    accept=".md"
                                    multiple={false}
                                    maxCount={1}
                                    className="rounded-2xl bg-white hover:bg-blue-50/30 transition-all p-10"
                                    beforeUpload={(file: File) => {
                                        const isMd = file.name.endsWith('.md');
                                        if (!isMd) {
                                            toast.error(`${file.name} không phải là file .md`);
                                            return Upload.LIST_IGNORE;
                                        }
                                        const isLt10M = file.size / 1024 / 1024 < 10;
                                        if (!isLt10M) {
                                            toast.error(`File phải nhỏ hơn 10MB!`);
                                            return Upload.LIST_IGNORE;
                                        }
                                        setFileList([file]);
                                        return false
                                    }}
                                >
                                    <p className="ant-upload-drag-icon">
                                        <InboxOutlined className="text-blue-400" />
                                    </p>
                                    <p className="ant-upload-text font-bold">Kéo thả file .md vào đây</p>
                                    <p className="ant-upload-hint text-xs">Dung lượng tối đa: 10MB</p>
                                </Dragger>
                            )}
                        </Form.Item>
                    </Form>

                    <div className="mt-8 flex justify-end gap-2">
                        <button
                            onClick={onCancel}
                            className="px-6 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all font-medium text-gray-600"
                        >
                            Hủy
                        </button>
                        <button
                            className="px-10 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all"
                            disabled={uploading}
                            onClick={handleSubmit}
                        >
                            Tải lên ngay
                        </button>
                    </div>
                </div>

            </div>
        </Modal>
    );
};