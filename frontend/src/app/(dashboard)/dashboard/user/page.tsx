"use client";

import { useState } from 'react';
import { Table, Button, Tooltip, Typography, Card, Form } from 'antd';
import { DeleteOutlined, EyeOutlined, TeamOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import EditUserModal from '@/components/dashboard/user/editUserModal';
import AddUserModal from '@/components/dashboard/user/addUserModal';
import { useAuthStore } from '@/stores/useAuthStore';
import { getAllUser, deleteUser } from '@/services/user.service';

const { Text } = Typography;

const UserManager = () => {
    const queryClient = useQueryClient();
    const [isOpenEditUser, setOpenEditUser] = useState(false);
    const [isOpenShowUser, setOpenShowUser] = useState(false);
    const [record, setRecord] = useState(null);
    const [isAddOpen, setAddOpen] = useState(false);
    const [form] = Form.useForm();
    const { role } = useAuthStore();

    const { data: usersData, isLoading: isGettingUsers } = useQuery({
        queryKey: ['dashboard-get-all-user'],
        queryFn: () => getAllUser(),
    });

    const { mutate: deleteUserMutation, isPending: deletingUser } = useMutation({
        mutationFn: (data: { id: string }) => deleteUser(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-get-all-user'] });
            toast.success("Xóa người dùng thành công");
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const handleEditOpen = (record: any) => {
        setRecord(record);
        setOpenEditUser(true);
    }

    const handleShowOpen = (record: any) => {
        setRecord(record);
        setOpenShowUser(true);
    }

    const handleClose = () => {
        form.resetFields();
        setAddOpen(false);
    }

    const handleDeleteFile = (record: any) => {
        Swal.fire({
            title: 'Bạn có chắc muốn xóa?',
            text: 'Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonColor: 'red',
            cancelButtonText: 'Hủy',
            confirmButtonColor: 'green',
            confirmButtonText: 'Xác nhận',
        }).then((result) => {
            const confirm = result.isConfirmed;
            if (confirm && role === 'admin') {
                deleteUserMutation({ id: record._id });
            }
        })
    }

    const columns: ColumnsType<any> = [
        {
            title: 'STT',
            key: 'stt',
            width: 70,
            align: 'center',
            render: (_: any, __: any, index: number) => index + 1
        },
        {
            title: 'Họ và tên',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            render: (text: string) => text || 'Chưa cập nhật',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => {
                let config = {
                    label: 'Người dùng',
                    colorClass: 'bg-gray-100 text-gray-700'
                };

                switch (role) {
                    case 'admin':
                        config = {
                            label: 'Quản trị viên',
                            colorClass: 'bg-red-100 text-red-700 border border-red-200'
                        };
                        break;
                    case 'lecture':
                        config = {
                            label: 'Giảng viên',
                            colorClass: 'bg-blue-100 text-blue-700 border border-blue-200'
                        };
                        break;
                    case 'user':
                        config = {
                            label: 'Sinh viên',
                            colorClass: 'bg-green-100 text-green-700 border border-green-200'
                        };
                        break;
                }

                return (
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${config.colorClass}`}>
                        {config.label}
                    </span>
                );
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <div className="flex w-full items-center justify-center gap-2">
                    <Tooltip title="Xem người dùng">
                        <Button
                            type="dashed"
                            icon={<EyeOutlined />}
                            onClick={() => handleShowOpen(record)}
                            size="small"
                            className='flex items-center justify-center hover:scale-110'
                        />
                    </Tooltip>
                    <Tooltip title="Sửa người dùng">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => handleEditOpen(record)}
                            size="small"
                            className='flex items-center justify-center hover:scale-110'
                        />
                    </Tooltip>
                    <Tooltip title="Xóa người dùng">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteFile(record)}
                            size="small"
                            className='flex items-center justify-center hover:bg-red-50 hover:scale-110'
                        />
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="p-0 md:p-4 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold m-0 flex items-center gap-2">
                            <TeamOutlined className="text-blue-500" />
                            Quản lý người dùng
                        </h2>
                        <Text type="secondary">Quản lý người dùng trong hệ thống</Text>
                    </div>

                    {(role === 'admin') && (<div className="flex gap-2">
                        <Button
                            type="primary"
                            icon={<PlusOutlined className="transition-transform duration-300 group-hover:rotate-90" />}
                            size="large"
                            // className="w-full md:w-auto"
                            className="w-full md:w-auto group flex items-center justify-center hover:scale-105"
                            onClick={() => { setAddOpen(true) }}
                        >
                            Thêm người dùng
                        </Button>
                    </div>)}
                </div>

                <Card className="shadow-sm overflow-hidden">
                    <Table
                        rowKey="_id"
                        columns={columns}
                        dataSource={usersData}
                        scroll={{ x: 800 }}
                        pagination={{ pageSize: 10 }}
                        className="forum-table"
                    />
                </Card>
            </div>
            <AddUserModal open={isAddOpen} onCancel={handleClose} />
            <EditUserModal open={isOpenEditUser} onCancel={() => setOpenEditUser(false)} data={record} edit={true} />
            <EditUserModal open={isOpenShowUser} onCancel={() => setOpenShowUser(false)} data={record} edit={false} />
        </>
    );
};

export default UserManager;