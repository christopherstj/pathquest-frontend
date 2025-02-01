import React from "react";
import { Glyph as CustomGlyph } from "@visx/glyph";
import PeakSummit from "../common/customIcons/PeakSummit";

type Props = { left: number; top: number };

const SummitGlyph = ({ left, top }: Props) => {
    return (
        <CustomGlyph left={left - 12.5} top={top - 35}>
            <PeakSummit width={25} height={30} />
        </CustomGlyph>
    );
};

export default SummitGlyph;
