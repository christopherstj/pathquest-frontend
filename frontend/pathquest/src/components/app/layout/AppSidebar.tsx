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

export function AppSidebar() {
    const routes = getRoutes(false);

    return (
        <Sidebar>
            <SidebarHeader>
                <Link href="/">
                    <div className="flex justify-center items-center flex-col gap-2">
                        <Image src={logo} alt="PathQuest Logo" width={125} />
                        <h1 className="text-2xl font-bold">PathQuest</h1>
                    </div>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {routes.map((item) => (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <UserButton />
            </SidebarFooter>
        </Sidebar>
    );
}
