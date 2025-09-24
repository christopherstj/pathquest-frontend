import Peak from "@/typeDefs/Peak";
import React from "react";
import { Virtuoso } from "react-virtuoso";
import PeakRow from "./PeakRow";

type Props = {
    peaks: Peak[];
};

const PeaksList = ({ peaks }: Props) => {
    return (
        <div className="absolute bg-primary rounded-lg overflow-hidden shadow-lg h-full w-full">
            <Virtuoso
                className="h-full w-full"
                data={peaks}
                itemContent={(_, peak) => <PeakRow peak={peak} />}
            />
        </div>
    );
};

export default PeaksList;
