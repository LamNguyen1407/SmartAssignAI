"use client"

import React, { useEffect } from 'react';
import { Input, Modal, Form, Row, Col } from 'antd';
import { updateCourse } from '@/services/course.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/useAuthStore';


export default function EditCourseModal({ open, onCancel, data }: { open: boolean, onCancel: () => void, data?: any }) {
    const { role } = useAuthStore();
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (data && open) {
            form.setFieldsValue(data);
        } else form.resetFields();
    }, [data, form, open])

    const { mutate: updateCourseMutation, isPending: updatingCourse } = useMutation({
        mutationFn: (data: {
            _id: string;
            name: string;
            id: string;
        }) => updateCourse(data),
        onSuccess: (data) => {
            onCancel();
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['dashboard-get-course-file'] });
            toast.success("Cập nhật môn học thành công");
        },
        onError: (error) => { toast.error(error.message) }
    });

    const handleSubmit = () => {
        const value = form.getFieldsValue();
        const obj = {
            ...value,
            _id: data._id,
        }
        if (role === 'admin') updateCourseMutation(obj);
    }

    return (
        <Modal
            open={open}
            title="Chỉnh sửa môn học"
            okText="Lưu thay đổi"
            cancelText="Hủy bỏ"
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={handleSubmit}
            confirmLoading={updatingCourse}
            okButtonProps={{ disabled: updatingCourse }}
            cancelButtonProps={{ disabled: updatingCourse }}
        >
            <Form
                form={form}
                layout="vertical"
                name="subject_form"
            >
                <Row>
                    <Col span={24}>
                        <Form.Item
                            name="name"
                            label="Tên môn học"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên môn học!'
                                }
                            ]}
                        >
                            <Input size="large" placeholder="Ví dụ: Cấu trúc dữ liệu và Giải thuật" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Form.Item
                            name="id"
                            label="Mã môn học"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mã môn học!'
                                }
                            ]}
                        >
                            <Input size="large" placeholder="Ví dụ: CS101" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};