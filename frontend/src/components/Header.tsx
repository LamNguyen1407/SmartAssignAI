"use client";

import React, { useState } from "react";
import { Button, Drawer, Dropdown, Avatar, Menu, Space } from "antd";
import { MenuOutlined, UserOutlined, LogoutOutlined, BellOutlined, SettingOutlined } from "@ant-design/icons";
import Link from "next/link";
import type { MenuProps } from 'antd';
import { useAuthStore } from "@/stores/useAuthStore";
import { LogoutUser } from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const Header = () => {
    const { name, role } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

    const userMenuItems: MenuProps['items'] = [
        {
            key: "/profile",
            label: "Thông tin cá nhân",
            icon: <UserOutlined />,
            disabled: isLogoutPending
        },
        ...((role === 'admin') ? [
            {
                key: '/dashboard',
                label: 'Dashboard',
                icon: <MenuOutlined />,
            },
        ] : []),
        {
            type: "divider"
        },
        {
            key: "logout",
            label: isLogoutPending ? "Đang đăng xuất..." : "Đăng xuất",
            icon: <LogoutOutlined />,
            danger: true,
            disabled: isLogoutPending
        },
    ];

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        if (e.key === 'logout') LogoutMutation()
        else router.push(e.key)
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-[1920px] items-center justify-between px-4 sm:px-6 lg:px-8">

                <div className="flex items-center gap-4">
                    {/* <Button
                        type="text"
                        icon={<MenuOutlined />}
                        className="lg:hidden"
                        onClick={() => setIsMobileMenuOpen(true)}
                    /> */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
                        AI
                    </div>
                    <span className="hidden text-xl font-bold tracking-tight text-gray-900 sm:block">
                        SmartAssignAI
                    </span>
                </div>

                {/* <nav className="hidden lg:flex lg:items-center lg:gap-8">
                    <Link href="/dashboard" className="text-sm font-medium text-blue-600">Assistant</Link>
                    <Link href="/courses" className="text-sm font-medium text-gray-500 hover:text-gray-900">Courses</Link>
                    <Link href="/history" className="text-sm font-medium text-gray-500 hover:text-gray-900">History</Link>
                </nav> */}

                <div className="flex items-center gap-2 sm:gap-4">
                    {/* <Button type="text" icon={<BellOutlined className="text-lg text-gray-500" />} /> */}

                    {/* <div className="h-6 w-[1px] bg-gray-200" /> Divider */}

                    <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }} placement="bottomRight" arrow>
                        <Space className="cursor-pointer">
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-semibold leading-none text-gray-900">{name}</p>
                                <p className="mt-1 text-xs text-gray-500">{role === 'user' ? 'Sinh viên' : 'Giảng viên'}</p>
                            </div>
                            <Avatar icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
                        </Space>
                    </Dropdown>
                </div>
            </div>

            <Drawer
                title="SmartAssignAI"
                placement="right"
                onClose={() => setIsMobileMenuOpen(false)}
                open={isMobileMenuOpen}
                width={280}
            >
                <Menu
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    items={[
                        { key: '1', label: 'AI Assistant', icon: <SettingOutlined /> },
                        { key: '2', label: 'My Courses', icon: <SettingOutlined /> },
                        { key: '3', label: 'Chat History', icon: <SettingOutlined /> },
                    ]}
                />
            </Drawer>
        </header>
    );
};

export default Header;