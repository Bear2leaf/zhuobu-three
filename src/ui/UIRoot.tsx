import { Root, Fullscreen, Container, FontFamilyProvider, Text } from "@react-three/uikit";
import React, { useCallback } from "react";
import { phyState } from "../physics/PhysicsProvider";

export function UIRoot() {
    return (
        <Root>
            <FontFamilyProvider
                roboto={{
                    normal: "resources/font/NotoSansSC-Regular.json",
                }}
            >
                <Fullscreen flexDirection="column" padding={10} gap={10}>
                    <Text onPointerDown={() => {
                        phyState.ready = true;
                    }} fontFamily="roboto" color="red" fontSize={72}>关卡</Text>
                </Fullscreen>
            </FontFamilyProvider>
        </Root>
    )
}