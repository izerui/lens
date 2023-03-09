/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import computeStatusCountsForOwnersInjectable from "../../utils/compute-status-counts.injectable";
import statefulSetStoreInjectable from "./store.injectable";

const totalStatusesForStatefulSetsInSelectedNamespacesInjectable = getInjectable({
  id: "total-statuses-for-stateful-sets-in-selected-namespaces",
  instantiate: (di) => {
    const statefulSetStore = di.inject(statefulSetStoreInjectable);
    const computeStatusCountsForOwners = di.inject(computeStatusCountsForOwnersInjectable);

    return computed(() => computeStatusCountsForOwners(statefulSetStore.contextItems));
  },
});

export default totalStatusesForStatefulSetsInSelectedNamespacesInjectable;