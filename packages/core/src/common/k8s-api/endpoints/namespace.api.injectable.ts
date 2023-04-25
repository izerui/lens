/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { NamespaceApi } from "./namespace.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";
import { loggerInjectable } from "@k8slens/logging";
import maybeKubeApiInjectable from "../maybe-kube-api.injectable";

const namespaceApiInjectable = getInjectable({
  id: "namespace-api",

  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "namespaceApi is only available in certain environments");

    return new NamespaceApi({
      logger: di.inject(loggerInjectable),
      maybeKubeApi: di.inject(maybeKubeApiInjectable),
    });
  },

  injectionToken: kubeApiInjectionToken,
});

export default namespaceApiInjectable;
