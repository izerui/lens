/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { preferenceItemInjectionToken } from "@lensapp/preferences";
import { getInjectable } from "@ogre-tools/injectable";
import { AllowUntrustedCertificates } from "./allow-untrusted-certificates";

const allowUntrustedCertificatesPreferenceBlockInjectable = getInjectable({
  id: "allow-untrusted-certificates-preference-item",

  instantiate: () => ({
    kind: "block" as const,
    id: "allow-untrusted-certificates",
    parentId: "proxy-page",
    orderNumber: 20,
    Component: AllowUntrustedCertificates,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default allowUntrustedCertificatesPreferenceBlockInjectable;