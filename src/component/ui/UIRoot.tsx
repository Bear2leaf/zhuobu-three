import { Root, Fullscreen, Container, FontFamilyProvider, Text } from "@react-three/uikit";
import React, { useCallback } from "react";

export function UIRoot() {
    const callback = useCallback(() => {
        console.log(123)
    }, [])
    return (
        <Root>
            <Fullscreen flexDirection="column" padding={10} gap={10}>
                <Container onPointerDown={callback} active={{ backgroundColor: "yellow" }} flexGrow={1} backgroundOpacity={0.5} hover={{ backgroundOpacity: 1 }} backgroundColor="red" />
                <Container active={{ backgroundColor: "yellow" }} flexGrow={1} backgroundOpacity={0.5} hover={{ backgroundOpacity: 1 }} backgroundColor="blue" />
            </Fullscreen>
            <FontFamilyProvider
                roboto={{
                    bold: "resources/font/NotoSansSC-Bold.json",
                }}
            >
                <Text fontFamily="roboto" color="red" fontSize={72}>关卡</Text>
            </FontFamilyProvider>
        </Root>
    )
}