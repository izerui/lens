/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterStoreInjectable from "../../../../common/cluster-store/cluster-store.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "@k8slens/application";
import initUserStoreInjectable from "../../../../main/stores/init-user-store.injectable";

const initClusterStoreInjectable = getInjectable({
  id: "init-cluster-store",
  instantiate: (di) => {
    const clusterStore = di.inject(clusterStoreInjectable);

    return {
      id: "init-cluster-store",
      run: () => {
        clusterStore.load();
      },
      runAfter: di.inject(initUserStoreInjectable),
    };
  },
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default initClusterStoreInjectable;