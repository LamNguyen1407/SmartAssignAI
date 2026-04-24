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
import { cn } from "@/lib/utils";

const { Header, Sider, Content } = Layout;

export default function SilderLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const { name, role } = useAuthStore();
    const router = useRouter();

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const { mutate: LogoutMutation, isPending: isLogoutPending } = useMutation({
        mutationFn: async () => {
            await LogoutUser();
            router.push("/login")
        },
        onSuccess: () => toast.success("Logout successfully"),
        onError: (err: any) => toast.error(err.response?.data?.message || "Logout failed"),
    })

    const handleSlider = (info: any) => {
        if (info.key === '/signout') return LogoutMutation();
        router.push(info.key);
    }

    const userItems: MenuProps['items'] = [
        { key: '/info', label: 'Thông tin cá nhân', icon: <UserOutlined /> },
        { key: '/chat', label: 'Chat với AI', icon: <RobotOutlined /> },
        { type: 'divider' },
        { key: '/signout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true },
    ];

    return (
        <Layout className="min-h-screen bg-[#F0F2F5]">
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                breakpoint="lg"
                width={260}
                collapsedWidth={80}
                onBreakpoint={(broken) => setCollapsed(broken)}
                className="!sticky !top-0 !left-0 !h-screen !bg-[#1E293B] shadow-xl z-[1001]"
            >
                <div className="flex h-16 items-center px-6 my-4">
                    <div className="flex h-9 w-9 min-w-[36px] items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/30">
                        AI
                    </div>
                    {!collapsed && (
                        <span className="ml-3 text-lg font-bold tracking-tight text-white truncate transition-opacity duration-300">
                            SmartAssignAI
                        </span>
                    )}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['/dashboard']}
                    onClick={handleSlider}
                    className="!bg-transparent border-none"
                    items={[
                        { key: '/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
                        ...(role === 'admin' ? [{ key: '/dashboard/user', icon: <ReadOutlined />, label: 'Quản lý người dùng' }] : []),
                        { key: '/dashboard/course', icon: <ReadOutlined />, label: 'Môn học' },
                    ]}
                />
            </Sider>

            <Layout className="bg-transparent flex flex-col">
                <Header
                    className="!bg-slate-800/95 backdrop-blur-md !rounded-[1.5rem] shadow-sm border border-gray-100 !mx-5 !mt-4 !px-6 !h-16 sticky top-4 z-[1000] transition-all flex items-center justify-between"
                    style={{ lineHeight: 'normal' }}
                >
                    <div className="flex items-center gap-3">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined className='!text-white' /> : <MenuFoldOutlined className='!text-white' />}
                            onClick={() => setCollapsed(!collapsed)}
                            className="!w-10 !h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                        />
                        <div className="flex flex-col justify-center">
                            <h1 className="text-[14px] font-bold text-white m-0 leading-tight">
                                Bảng điều khiển
                            </h1>
                            <p className="text-[10px] text-slate-400 m-0 font-medium whitespace-nowrap">
                                Hệ thống quản lý học tập AI
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Dropdown
                            menu={{ items: userItems, onClick: handleSlider }}
                            placement="bottomRight"
                            arrow={false}
                            align={{ offset: [0, 12] }}
                        >
                            <Space className="group cursor-pointer p-1 pr-2 rounded-2xl transition-all hover:bg-slate-200/50">
                                <div className="hidden text-right md:flex flex-col justify-center gap-1.5">
                                    <p className="text-[13px] font-bold leading-none text-white group-hover:text-blue-600 transition-colors">
                                        {name}
                                    </p>
                                    <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md self-end">
                                        {role === 'admin' ? "Quản trị viên" : role === 'lecture' ? "Giảng viên" : "Sinh viên"}
                                    </p>
                                </div>

                                <div className="relative">
                                    <Avatar
                                        size={38}
                                        icon={<UserOutlined />}
                                        className="bg-slate-800 text-white border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
                                    />
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
                                </div>
                            </Space>
                        </Dropdown>
                    </div>
                </Header>
                <Content
                    className="m-5 p-8"
                    style={{
                        background: '#ffffff',
                        borderRadius: '1.5rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                        minHeight: '280px'
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}