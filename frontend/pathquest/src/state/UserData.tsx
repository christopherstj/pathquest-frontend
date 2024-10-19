import getUser from "@/actions/getUser";
import React from "react";
import UserContext from "./UserContext";

type Props = {
    children: React.ReactNode;
};

const UserData = async ({ children }: Props) => {
    const user = await getUser();

    return (
        <UserContext
            userDetails={user.userFound && user.user ? user.user : null}
        >
            {children}
        </UserContext>
    );
};

export default UserData;
