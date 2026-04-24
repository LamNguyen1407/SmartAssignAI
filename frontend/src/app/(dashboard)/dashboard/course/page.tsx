"use client";

import { useState } from 'react';
import { Table, Space, Button, Input, Popconfirm, Modal, Tooltip, Typography, Card, Form } from 'antd';
import { FileAddOutlined, DeleteOutlined, EyeOutlined, ReadOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { getCourseWithFiles, createCourse } from '@/services/course.service';
import { toast } from 'react-toastify';
import AddDocumentModal from '@/components/dashboard/course/FormAddFile';
import { deleteFile } from '@/services/course.service';
import { useAuthStore } from '@/stores/useAuthStore';

const { Text } = Typography;

const CourseManager = () => {
    const queryClient = useQueryClient();
    const [isOpenAddFile, setOpenAddFile] = useState(false);
    const [record, setRecord] = useState(null);
    const [isAddOpen, setAddOpen] = useState(false);
    const [form] = Form.useForm();
    const { role } = useAuthStore();

    const { data: questionsData, isLoading: isGettingQuestion } = useQuery({
        queryKey: ['dashboard-get-course-file'],
        queryFn: () => getCourseWithFiles(),
    });

    const { mutate: deleteFileMutation, isPending: deletingFile } = useMutation({
        mutationFn: (data: { id: string }) => deleteFile(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-get-course-file'] });
            toast.success(data.message);
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const { mutate: createCourseMutation, isPending: creating } = useMutation({
        mutationFn: (data: { id: string, name: string }) => createCourse(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-get-course-file'] });
            toast.success(data.message);
            form.resetFields();
            setAddOpen(false);
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const handleShowOpen = (record: any) => {
        setRecord(record);
        setOpenAddFile(true);
    }

    const handleSubmit = () => {
        const value = form.getFieldsValue();
        const obj = {
            id: value.subjectCode,
            name: value.subjectName
        }
        createCourseMutation(obj);
    }

    const handleClose = () => {
        form.resetFields();
        setAddOpen(false);
    }

    const handleDeleteFile = (file: any) => {
        Swal.fire({
            title: 'Bạn có chắc muốn xóa?',
            text: 'Bạn có chắc muốn xóa tài liệu này? Hành động này không thể hoàn tác',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonColor: 'red',
            cancelButtonText: 'Hủy',
            confirmButtonColor: 'green',
            confirmButtonText: 'Xác nhận',
        }).then((result) => {
            const confirm = result.isConfirmed;
            if (confirm) {
                deleteFileMutation({ id: file._id });
            }
        })
    }

    const columns: ColumnsType<any> = [
        {
            title: 'STT',
            key: 'stt',
            width: '4%',
            render: (_: any, __: any, index: number) => index + 1
        },
        {
            title: 'Mã MH',
            dataIndex: 'id',
            key: 'title',
            width: '10%',
            render: (text) => (
                <div className="max-w-[300px] md:max-w-none">
                    <Text strong className="block truncate">{text}</Text>
                </div>
            ),
        },
        {
            title: 'Môn học',
            dataIndex: 'name',
            key: 'name',
            responsive: ['md'],
        },
        {
            title: 'Thêm tài liệu',
            key: 'action',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <div className="flex w-full items-center justify-center">
                    <Tooltip title="Thêm tài liệu">
                        <Button icon={<FileAddOutlined />} onClick={() => handleShowOpen(record)} size="small" className='flex items-center justify-center' />
                    </Tooltip>
                </div>

            ),
        },
    ];

    const expandedRowRender = (record: any) => {
        const formatDateTime = (date: string) => {
            if (!date) return "-";
            return new Intl.DateTimeFormat('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(new Date(date));
        };
        const commentColumns = [
            { title: 'STT', key: 'stt', width: '5%', render: (_: any, __: any, index: number) => index + 1, },
            { title: 'File', dataIndex: 'filename', key: 'filename' },
            {
                title: 'Chỉnh sửa', dataIndex: 'updatedAt', key: 'updatedAt', width: '15%', render: (date: string) => (
                    <span className="text-gray-600">
                        {formatDateTime(date)}
                    </span>
                )
            },
            {
                title: 'Ngày tải lên', dataIndex: 'createdAt', key: 'createdAt', width: '15%', render: (date: string) => (
                    <span className="text-gray-600">
                        {formatDateTime(date)}
                    </span>
                )
            },
            {
                title: 'Thao tác',
                key: 'fileAction',
                width: '5%',
                render: (_: any, file: any) => (
                    <div className="flex w-full items-center justify-center">
                        <Tooltip title="Xóa tài liệu">
                            <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteFile(file)} />
                        </Tooltip>
                    </div>
                ),
            },
        ];

        return (
            <Card title="Danh sách tài liệu" size="small" className="bg-gray-50 ml-8">
                <Table
                    columns={commentColumns}
                    dataSource={record.fileList}
                    pagination={false}
                    rowKey="Aid"
                    size="small"
                    locale={{ emptyText: 'Chưa có tài liệu nào cho môn học này' }}
                />
            </Card>
        );
    };

    return (
        <>
            <div className="p-0 md:p-4 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold m-0 flex items-center gap-2">
                            <ReadOutlined className="text-blue-500" />
                            Quản lý môn học
                        </h2>
                        <Text type="secondary">Quản lý các tài liệu của môn học</Text>
                    </div>

                    {(role === 'admin') && (<div className="flex gap-2">
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="large"
                            className="w-full md:w-auto"
                            onClick={() => { setAddOpen(true) }}
                        >
                            Thêm môn học
                        </Button>
                    </div>)}
                </div>

                <Card className="shadow-sm overflow-hidden">
                    <Table
                        rowKey="_id"
                        columns={columns}
                        dataSource={questionsData}
                        expandable={{ expandedRowRender, defaultExpandedRowKeys: ['0'] }}
                        scroll={{ x: 800 }}
                        pagination={{ pageSize: 10 }}
                        className="forum-table"
                    />
                </Card>
            </div>
            <AddDocumentModal open={isOpenAddFile} onCancel={() => setOpenAddFile(false)} data={record} />
            <Modal
                open={isAddOpen}
                title="Thêm mới môn học"
                okText="Tạo mới"
                cancelText="Hủy bỏ"
                onCancel={handleClose}
                onOk={handleSubmit}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="form_in_modal"
                    initialValues={{ modifier: 'public' }}
                >
                    <Form.Item
                        name="subjectName"
                        label="Tên môn học"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập tên môn học!',
                            },
                        ]}
                    >
                        <Input placeholder="Ví dụ: Cấu trúc dữ liệu và Giải thuật" />
                    </Form.Item>

                    <Form.Item
                        name="subjectCode"
                        label="Mã môn học"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mã môn học!',
                            },
                        ]}
                    >
                        <Input placeholder="Ví dụ: CO2003" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default CourseManager;