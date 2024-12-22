import { type NextPage } from "next";
import { type ReactElement, type ReactNode } from "react";
import { type AppProps } from "next/app";
import { type Session } from "next-auth";

import { SessionProvider } from "next-auth/react";

import { ChakraProvider, extendTheme, ThemeConfig } from "@chakra-ui/react";

import { api } from "~/utils/api";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import 'mapbox-gl/dist/mapbox-gl.css';

import "~/styles/globals.css";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

const MyApp = ({
                 Component,
                 pageProps: { session, ...pageProps },
               }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
      <SessionProvider session={session as Session | null}>
        <ChakraProvider theme={theme}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px" }}>
          {getLayout(<Component {...pageProps} />)}
          <ReactQueryDevtools position={'bottom-right'} />
          </div>
        </ChakraProvider>
      </SessionProvider>
  );
};

export default api.withTRPC(MyApp);