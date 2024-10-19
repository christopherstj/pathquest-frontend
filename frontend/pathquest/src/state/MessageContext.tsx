"use client";
import Peak from "@/typeDefs/Peak";
import PeakSummit from "@/typeDefs/PeakSummit";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import React, { createContext, useReducer, useState } from "react";

interface MessageState {
    message: {
        type: "success" | "error";
        text: string;
        timeout?: number;
    };
}

const reducer = (
    state: MessageState,
    action: {
        type: "SET_MESSAGE";
        payload: {
            text: string;
            type: "success" | "error";
            timeout?: number;
        };
    }
): MessageState => {
    switch (action.type) {
        case "SET_MESSAGE":
            return {
                ...state,
                message: action.payload,
            };
        default:
            return state;
    }
};

const useMessageState = (messageState: MessageState) =>
    useReducer(reducer, messageState);

export const MessageContext = createContext<ReturnType<
    typeof useMessageState
> | null>(null);

export const useMessage = () => {
    const context = React.useContext(MessageContext);
    if (!context) {
        throw new Error("useMessage must be used within a MessageProvider");
    }
    return context;
};

const MessageProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, setState] = useMessageState({
        message: {
            type: "success",
            text: "",
        },
    });

    return (
        <MessageContext.Provider value={[state, setState]}>
            {children}
        </MessageContext.Provider>
    );
};

export default MessageProvider;
