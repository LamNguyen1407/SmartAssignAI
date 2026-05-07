"use client"

import React, { useState } from 'react';
import { Input, Modal, Form, Row, Col, Select, DatePicker } from 'antd';
import { createUser } from '@/services/user.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/useAuthStore';

const { Option } = Select;

export default function AddUserModal({ open, onCancel, data }: { open: boolean, onCancel: () => void, data?: any }) {
    const { role } = useAuthStore();
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { mutate: createUserMutation, isPending: creatingUser } = useMutation({
        mutationFn: (data: {
            name: string;
            email: string;
            password: string;
            username: string;
            phoneNumber?: string;
            role: string;
            gender: string;
            dateOfBirth?: Date;
        }) => createUser(data),
        onSuccess: (data) => {
            onCancel();
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['dashboard-get-all-user'] });
            toast.success("Tạo người dùng thành công");
        },
        onError: (error) => { toast.error(error.message) }
    });

    const handleSubmit = () => {
        const value = form.getFieldsValue();
        if (role === 'admin') createUserMutation(value);
    }

    return (
        <Modal
            open={open}
            title="Thêm người dùng mới"
            okText="Thêm mới"
            cancelText="Hủy bỏ"
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={handleSubmit}
            confirmLoading={creatingUser}
            okButtonProps={{ disabled: creatingUser }}
            cancelButtonProps={{ disabled: creatingUser }}
        >
            <Form
                form={form}
                layout="vertical"
                name="create_user_form"
                initialValues={{
                    role: 'user',
                    gender: 'male'
                }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="Họ và tên"
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                        >
                            <Input placeholder="Nguyễn Văn A" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="username"
                            label="Tên đăng nhập"
                            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                        >
                            <Input placeholder="vanna123" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không đúng định dạng!' }
                            ]}
                        >
                            <Input placeholder="example@gmail.com" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="phoneNumber" label="Số điện thoại">
                            <Input placeholder="09xxxxxxx" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                            hasFeedback
                        >
                            <Input.Password placeholder="Nhập mật khẩu" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="confirmPassword"
                            label="Xác nhận mật khẩu"
                            dependencies={['password']}
                            hasFeedback
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="Nhập lại mật khẩu" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
                            <Select placeholder="Chọn giới tính">
                                <Option value="male">Nam</Option>
                                <Option value="female">Nữ</Option>
                                <Option value="other">Khác</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="dateOfBirth" label="Ngày sinh">
                            <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                            <Select placeholder="Chọn vai trò">
                                <Option value="user">Sinh viên</Option>
                                <Option value="lecture">Giảng viên</Option>
                                <Option value="admin">Quản trị viên</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};