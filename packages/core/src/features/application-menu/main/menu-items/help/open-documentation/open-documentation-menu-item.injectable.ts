/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import { docsUrl } from "../../../../../../common/vars";
import openLinkInBrowserInjectable from "../../../../../../common/utils/open-link-in-browser.injectable";
import { loggerInjectable } from "@k8slens/logging";

const openDocumentationMenuItemInjectable = getInjectable({
  id: "open-documentation-menu-item",

  instantiate: (di) => {
    const openLinkInBrowser = di.inject(openLinkInBrowserInjectable);
    const logger = di.inject(loggerInjectable);

    return {
      kind: "clickable-menu-item" as const,
      parentId: "help",
      id: "open-documentation",
      orderNumber: 20,
      label: "Documentation",

      // TODO: Convert to async/await
      onClick: () => {
        openLinkInBrowser(docsUrl).catch((error) => {
          logger.error("[MENU]: failed to open browser", { error });
        });
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default openDocumentationMenuItemInjectable;
