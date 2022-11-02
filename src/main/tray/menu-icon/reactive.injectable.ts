/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import { getSyncStartableStoppable } from "../../../common/utils/get-startable-stoppable";
import electronTrayInjectable from "../electron-tray/electron-tray.injectable";
import trayIconInjectable from "./tray-icon.injectable";

const reactiveTrayMenuIconInjectable = getInjectable({
  id: "reactive-tray-menu-icon",

  instantiate: (di) => {
    const trayMenuIcon = di.inject(trayIconInjectable);
    const electronTray = di.inject(electronTrayInjectable);

    return getSyncStartableStoppable("reactive-tray-menu-icon", () => (
      reaction(
        () => trayMenuIcon.get(),
        icon => {
          electronTray.setIconPath(icon.iconPath);
        },
        {
          fireImmediately: true,
        },
      )
    ));
  },
});

export default reactiveTrayMenuIconInjectable;
