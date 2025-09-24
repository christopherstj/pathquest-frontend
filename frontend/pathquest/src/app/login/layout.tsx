import React from "react";

type Props = {
    children: React.ReactNode;
};

const layout = (props: Props) => {
    const { children } = props;
    return <div className="h-screen w-full relative">{children}</div>;
};
export default layout;
