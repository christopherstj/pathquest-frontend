import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import getRoutes from "@/helpers/getRoutes";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/images/logo-no-background.svg";
import UserButton from "./UserButton";
import SidebarLink from "./SidebarLink";
import { Suspense } from "react";

export function AppSidebar() {
    const routes = getRoutes(false);

    return (
        <Sidebar className="pointer-events-none border-none">
            <SidebarHeader className="bg-primary rounded-br-md pointer-events-auto flex flex-col gap-2">
                <Link href="/">
                    <div className="flex justify-center items-center flex-col gap-2">
                        <Image src={logo} alt="PathQuest Logo" width={125} />
                        <h1 className="text-2xl font-bold">PathQuest</h1>
                    </div>
                </Link>
                <Suspense fallback={<div className="h-10 w-full" />}>
                    <UserButton />
                </Suspense>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {routes.map((item) => (
                                <SidebarLink
                                    key={item.label}
                                    label={item.label}
                                    href={item.href}
                                >
                                    <item.icon />
                                </SidebarLink>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
