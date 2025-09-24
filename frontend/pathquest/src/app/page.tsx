import React from "react";
import Image from "next/image";
import logo from "@/public/images/logo-no-background.svg";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const page = () => {
    return (
        <div className="h-screen w-full flex items-center justify-center">
            <div className="md:h-full xs:basis-full md:basis-1/2 flex flex-col items-center justify-center gap-4 bg-radial">
                <Image src={logo} alt="PathQuest Logo" width={300} />
                <h1 className="text-6xl font-bold">PathQuest</h1>
            </div>
            <div className="xs:basis-full md:basis-1/2 flex flex-col items-center justify-center gap-4">
                <h3 className="text-center text-lg text-primary-foreground">
                    Your adventure starts here.
                </h3>
                <Button asChild className="rounded-full bg-accent text-white">
                    <Link href="/m/peaks">Explore</Link>
                </Button>
            </div>
        </div>
    );
};

export default page;
