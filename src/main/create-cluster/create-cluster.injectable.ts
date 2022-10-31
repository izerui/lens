/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterDependencies } from "../../common/cluster/cluster";
import { Cluster } from "../../common/cluster/cluster";
import directoryForKubeConfigsInjectable from "../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import createKubeconfigManagerInjectable from "../kubeconfig-manager/create-kubeconfig-manager.injectable";
import createKubectlInjectable from "../kubectl/create-kubectl.injectable";
import createContextHandlerInjectable from "../context-handler/create-context-handler.injectable";
import { createClusterInjectionToken } from "../../common/cluster/create-cluster-injection-token";
import authorizationReviewInjectable from "../../common/cluster/authorization-review.injectable";
import listNamespacesForInjectable from "../../common/cluster/list-namespaces.injectable";
import createListApiResourcesInjectable from "../cluster/request-api-resources.injectable";
import loggerInjectable from "../../common/logger.injectable";
import detectorRegistryInjectable from "../cluster-detectors/detector-registry.injectable";
import createVersionDetectorInjectable from "../cluster-detectors/create-version-detector.injectable";
import broadcastMessageInjectable from "../../common/ipc/broadcast-message.injectable";
import loadConfigfromFileInjectable from "../../common/kube-helpers/load-config-from-file.injectable";
import requestNamespaceListPermissionsForInjectable from "../../common/cluster/request-namespace-list-permissions.injectable";

const createClusterInjectable = getInjectable({
  id: "create-cluster",

  instantiate: (di) => {
    const dependencies: ClusterDependencies = {
      directoryForKubeConfigs: di.inject(directoryForKubeConfigsInjectable),
      createKubeconfigManager: di.inject(createKubeconfigManagerInjectable),
      createKubectl: di.inject(createKubectlInjectable),
      createContextHandler: di.inject(createContextHandlerInjectable),
      createAuthorizationReview: di.inject(authorizationReviewInjectable),
      requestNamespaceListPermissionsFor: di.inject(requestNamespaceListPermissionsForInjectable),
      requestApiResources: di.inject(createListApiResourcesInjectable),
      listNamespacesFor: di.inject(listNamespacesForInjectable),
      logger: di.inject(loggerInjectable),
      detectorRegistry: di.inject(detectorRegistryInjectable),
      createVersionDetector: di.inject(createVersionDetectorInjectable),
      broadcastMessage: di.inject(broadcastMessageInjectable),
      loadConfigfromFile: di.inject(loadConfigfromFileInjectable),
    };

    return (model, configData) => new Cluster(dependencies, model, configData);
  },

  injectionToken: createClusterInjectionToken,
});

export default createClusterInjectable;
