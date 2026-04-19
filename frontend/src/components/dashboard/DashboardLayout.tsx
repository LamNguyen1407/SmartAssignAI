"use client";

import React, { useState } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
    DashboardOutlined,
    RobotOutlined,
    ReadOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button, Dropdown, Avatar, Space, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { LogoutUser } from '@/services/auth.service';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const { Header, Sider, Content } = Layout;

export default function SilderLayout({ children }: { children: React.ReactNode }) {
    const route = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const { name, role } = useAuthStore();

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const router = useRouter();
    const { mutate: LogoutMutation, isPending: isLogoutPending } = useMutation({
        mutationFn: async () => {
            await LogoutUser();
            router.push("/login")
        },
        onSuccess: () => {
            toast.success("Logout successfully")
        },
        onError: (err: any) => { toast.error(err.response?.data?.message || "Logout failed") },
    })

    const handleSlider = (info: any) => {
        if (info.key === '/signout') {
            return LogoutMutation();
        }
        route.push(info.key);
    }

    const userItems: MenuProps['items'] = [
        {
            key: '/info',
            label: 'Thông tin cá nhân',
            icon: <UserOutlined />,
            disabled: isLogoutPending,
        },
        {
            key: '/chat',
            label: 'Chat với AI',
            icon: <RobotOutlined />,
            disabled: isLogoutPending,
        },
        {
            type: 'divider',
        },
        {
            key: '/signout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            danger: true,
            disabled: isLogoutPending,
        },
    ];

    return (
        <Layout className="min-h-screen">
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                breakpoint="lg"
                width={260}
                collapsedWidth={typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 80}
                onBreakpoint={(broken) => {
                    if (broken) setCollapsed(true);
                }}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'sticky',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 1001,
                }}
                className="shadow-md sticky"
            >
                <div className="flex h-16 items-center px-6 my-2">
                    <div className="flex h-8 w-8 min-w-[32px] items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/30">
                        AI
                    </div>
                    {!collapsed && (
                        <span className="ml-3 text-lg font-bold tracking-tight text-white truncate transition-all duration-300">
                            SmartAssignAI
                        </span>
                    )}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['/dashboard']}
                    onClick={handleSlider}
                    items={[
                        {
                            key: '/dashboard',
                            icon: <DashboardOutlined />,
                            label: 'Tổng quan',
                        },
                        {
                            key: '/dashboard/course',
                            icon: <ReadOutlined />,
                            label: 'Môn học',
                        },
                    ]}
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                        position: 'sticky',
                        top: 0,
                        zIndex: 1000,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                    className="pr-6 shadow-sm"
                >
                    <div className="flex items-center ml-4">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            className="w-16 h-16 text-lg hover:bg-gray-50"
                        />
                        <h1 className="text-lg font-semibold m-0 hidden sm:block">Bảng điều khiển</h1>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 mr-8">
                        {/* <Button type="text" icon={<BellOutlined className="text-lg text-gray-500" />} /> */}

                        {/* <div className="h-6 w-[1px] bg-gray-200" /> Divider */}

                        <Dropdown menu={{ items: userItems, onClick: handleSlider }} placement="bottomRight" arrow>
                            <Space className="cursor-pointer">
                                <div className="hidden text-right sm:block">
                                    <p className="text-sm font-semibold leading-none text-gray-900">{name}</p>
                                    <p className="mt-1 text-xs text-gray-500">{role === 'user' ? 'Sinh viên' : 'Giảng viên'}</p>
                                </div>
                                <Avatar icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
                            </Space>
                        </Dropdown>
                    </div>
                </Header>

                <Content
                    className="m-4 p-6 min-h-[280px]"
                    style={{
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    )
}