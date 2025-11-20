import React from "react";
import Image from "next/image";
import logo from "@/public/images/logo-no-background.svg";
import poweredByStrava from "@/public/images/api_logo_pwrdBy_strava_stack_white.svg";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const page = () => {
    return (
        <div className="h-screen w-full flex items-center justify-center">
            <div className="md:h-full xs:basis-full md:basis-1/2 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(closest-side,_hsl(var(--primary-foreground)_/_0.3),_transparent)]">
                <Image src={logo} alt="PathQuest Logo" width={300} />
                <h1 className="text-6xl font-bold">PathQuest</h1>
                <Image
                    src={poweredByStrava}
                    alt="Powered by Strava"
                    height={40}
                />
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
