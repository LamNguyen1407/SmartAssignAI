"use client";

import React, { useState } from "react";
import { Button, Drawer, Dropdown, Avatar, Menu, Space } from "antd";
import { MenuOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { useAuthStore } from "@/stores/useAuthStore";
import { LogoutUser } from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import type { MenuProps } from 'antd';
import { cn } from "@/lib/utils";

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
            toast.success("Đăng xuất thành công")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Đăng xuất thất bại")
        },
    })

    const userMenuItems: MenuProps['items'] = [
        {
            key: "/profile",
            label: "Thông tin cá nhân",
            icon: <UserOutlined />,
            disabled: isLogoutPending
        },
        ...((role === 'admin' || role === 'lecture') ? [
            {
                key: '/dashboard',
                label: 'Dashboard',
                icon: <MenuOutlined />,
            },
        ] : []),
        { type: "divider" },
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
        <header className="sticky top-4 z-[1000] transition-all w-auto border-b border-gray-200/50 !bg-slate-800/95 backdrop-blur-sm !rounded-[1.5rem] !mx-4 !mt-4 !h-16">
            <div className="mx-auto flex h-16 max-w-[1920px] items-center justify-between px-4 sm:px-6 lg:px-8">

                <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 font-bold text-white shadow-lg">
                        AI
                    </div>
                    <span className="hidden text-lg font-bold tracking-tight text-white sm:block">
                        SmartAssign<span className="text-blue-600">AI</span>
                    </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 justify-end">
                    <Dropdown
                        menu={{ items: userMenuItems, onClick: handleMenuClick }}
                        placement="bottomRight"
                        arrow={false}
                        align={{ offset: [0, 12] }} // Tăng offset một chút để menu không dính sát avatar
                        overlayClassName="custom-dropdown-width"
                    >
                        <Space
                            className={cn(
                                "group cursor-pointer p-1 pr-2 rounded-2xl transition-all duration-300",
                                "hover:bg-slate-200/50 active:scale-95 border border-transparent hover:border-slate-200/50"
                            )}
                        >
                            <div className="hidden text-right sm:flex flex-col justify-center gap-1.5">
                                {/* Tên người dùng */}
                                <p className="text-[13.5px] font-bold leading-none text-white group-hover:text-blue-600 transition-colors duration-300">
                                    {name}
                                </p>

                                {/* Badge vai trò */}
                                <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md self-end transition-all duration-300 group-hover:bg-blue-50 group-hover:text-blue-500">
                                    {role === 'admin' ? "Quản trị viên" : role === 'lecture' ? "Giảng viên" : "Sinh viên"}
                                </p>
                            </div>

                            <div className="relative">
                                <Avatar
                                    size={38}
                                    icon={<UserOutlined />}
                                    className="bg-slate-800 text-white border-2 border-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300"
                                />
                                {/* Trạng thái online */}
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full shadow-sm animate-pulse"></span>
                            </div>
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