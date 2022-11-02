/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getSyncStartableStoppable } from "../../../common/utils/get-startable-stoppable";
import operatingSystemThemeStateInjectable from "../../theme/operating-system-theme-state.injectable";
import nativeThemeInjectable from "./native-theme.injectable";
import getElectronThemeInjectable from "./get-electron-theme.injectable";

const syncThemeFromOperatingSystemInjectable = getInjectable({
  id: "sync-theme-from-operating-system",

  instantiate: (di) => {
    const currentThemeState = di.inject(operatingSystemThemeStateInjectable);
    const nativeTheme = di.inject(nativeThemeInjectable);
    const getElectronTheme = di.inject(getElectronThemeInjectable);

    return getSyncStartableStoppable("sync-theme-from-operating-system", () => {
      const updateThemeState = () => {
        currentThemeState.set(getElectronTheme());
      };

      nativeTheme.on("updated", updateThemeState);

      return () => {
        nativeTheme.off("updated", updateThemeState);
      };
    });
  },
});

export default syncThemeFromOperatingSystemInjectable;
