import { Root, Fullscreen, Container, FontFamilyProvider, Text } from "@react-three/uikit";
import React, { useCallback } from "react";

export function UIRoot() {
    const callback = useCallback(() => {
        console.log(123)
    }, [])
    return (
        <Root>
            <FontFamilyProvider
                roboto={{
                    normal: "resources/font/NotoSansSC-Regular.json",
                }}
            >
                <Fullscreen flexDirection="column" padding={10} gap={10}>
                    <Container flexGrow={1} />
                    <Container flexGrow={1} >
                        <Text fontFamily="roboto" color="red" fontSize={72}>关卡</Text>
                    </Container>
                </Fullscreen>
            </FontFamilyProvider>
        </Root>
    )
}