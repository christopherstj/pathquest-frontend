import React from "react";

type Props = {
    name: string;
    elevation: number;
    location: string;
};

const PeakTitle = (props: Props) => {
    return (
        <div className="bg-primary py-2 px-4 rounded-md flex gap-2 items-center shadow-md">
            <h1 className="text-2xl font-bold basis-auto text-base-foreground">
                {props.name}
            </h1>
            <p className="text-sm text-primary-foreground-dim">
                {props.location}
            </p>
            <div className="rounded-sm bg-secondary-foreground px-2 py-1">
                <p className="text-sm text-secondary-dim font-semibold">
                    {props.elevation} m
                </p>
            </div>
        </div>
    );
};

export default PeakTitle;
