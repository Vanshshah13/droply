"use client"

import React from "react"
import type { ThemeProviderProps } from "next-themes"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ImageKitProvider } from "imagekitio-next"
import { HeroUIProvider } from "@heroui/system"

import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export interface ProviderProps {
    children: React.ReactNode,
    themeProps?: ThemeProviderProps
}


const authenticator = async () => {
    try {
        const response = await fetch("/api/imagekit-auth");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Authentication Error : ", error);
        throw error;
    }
}

export function Providers({ children, themeProps }: ProviderProps) {
    return (
        <ImageKitProvider authenticator={authenticator}
            publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""}
            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""}
        >
            <NextThemesProvider {...themeProps}>
                <HeroUIProvider>
                    {children}

                    <ToastContainer
                        position="bottom-center"
                        autoClose={3000}
                        newestOnTop
                        theme="dark"
                        toastStyle={{ zIndex: 99999 }}
                    />
                </HeroUIProvider>
            </NextThemesProvider>
        </ImageKitProvider>
    )
}