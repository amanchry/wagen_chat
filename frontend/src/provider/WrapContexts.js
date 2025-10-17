import React from "react";
import { SelectedFeatureProvider } from "./SelectedFeatureContext";
import { LoaderProvider } from "./LoaderContext";
import { AlertProvider } from "./AlertContext";
import { ToastProvider } from "./ToastContext";
// import AlertMessage from '../components/AlertMessage'
import MapProvider from "./MapContext";
import { AuthProvider } from "./AuthProvider";
import GlobalProvider from "./GlobalProvider";

export default function wrapContexts({ children, session }) {
  return (
    <>
      <AuthProvider session={session}>
          <GlobalProvider>
            <LoaderProvider>
              <ToastProvider>
                <AlertProvider>
                  {/* <AlertMessage /> */}
                  <MapProvider>
                    <SelectedFeatureProvider>{children}</SelectedFeatureProvider>
                  </MapProvider>
                </AlertProvider>
              </ToastProvider>
            </LoaderProvider>
          </GlobalProvider>
      </AuthProvider>
    </>
  );
}
