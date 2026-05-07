"use client"

import React, { useEffect } from 'react';
import { Input, Modal, Form, Row, Col, Select, DatePicker } from 'antd';
import { editUser } from '@/services/user.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/useAuthStore';
import dayjs from 'dayjs';

const { Option } = Select;

export default function EditUserModal({ open, onCancel, data, edit }: { open: boolean, onCancel: () => void, data?: any, edit: boolean }) {
    const { role } = useAuthStore();
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (open && data) {
            form.setFieldsValue({
                ...data,
                dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth) : null,
            });
        } else form.resetFields();
    }, [data, open, form]);

    const { mutate: editUserMutation, isPending: updatingUser } = useMutation({
        mutationFn: (data: {
            id: string;
            name: string;
            email: string;
            password: string;
            username: string;
            phoneNumber?: string;
            role: string;
            gender: string;
            dateOfBirth?: Date;
        }) => editUser(data),
        onSuccess: (data) => {
            onCancel();
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['dashboard-get-all-user'] });
            toast.success("Cập nhật người dùng thành công");
        },
        onError: (error) => { toast.error(error.message) }
    });

    const handleSubmit = () => {
        if (!edit) return;
        const value = form.getFieldsValue();
        const obj = {
            ...value,
            id: data._id,
            dateOfBirth: value.dateOfBirth ? value.dateOfBirth.toISOString() : null,
        };
        if (role === 'admin') editUserMutation(obj);
    }

    return (
        <Modal
            open={open}
            title={edit ? "Chỉnh sửa thông tin người dùng" : "Chi tiết người dùng"}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={updatingUser}
            okButtonProps={{
                style: !edit ? { display: 'none' } : {},
                disabled: updatingUser
            }}
            cancelText={edit ? "Hủy bỏ" : "Đóng"}
            cancelButtonProps={{ disabled: updatingUser }}
        >
            <Form
                form={form}
                layout="vertical"
                name="edit_user_form"
                disabled={!edit || updatingUser}
            >
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="name"
                            label="Họ và tên"
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                        >
                            <Input placeholder="Nguyễn Văn A" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="phoneNumber" label="Số điện thoại">
                            <Input placeholder="09xxxxxxx" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
                            <Select placeholder="Chọn giới tính">
                                <Option value="male">Nam</Option>
                                <Option value="female">Nữ</Option>
                                <Option value="other">Khác</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                            <Select placeholder="Chọn vai trò">
                                <Option value="user">Sinh viên</Option>
                                <Option value="lecture">Giảng viên</Option>
                                <Option value="admin">Quản trị viên</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="dateOfBirth" label="Ngày sinh">
                            <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};