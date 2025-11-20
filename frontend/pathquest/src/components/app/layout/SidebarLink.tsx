"use client";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type Props = {
    label: string;
    href: string;
    children?: React.ReactNode;
};

const SidebarLink = ({ label, href, children }: Props) => {
    const pathname = usePathname();

    const isActive = pathname.startsWith(href);

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                className={cn("pointer-events-auto bg-primary", {
                    "bg-primary-foreground text-primary": isActive,
                })}
            >
                <Link href={href}>
                    {children}
                    <span>{label}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
};

export default SidebarLink;
