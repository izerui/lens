/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ServerResponse } from "http";
import loggerInjectable from "../../common/logger.injectable";
import type { LensApiRequest, Route } from "./route";
import { contentTypes } from "./router-content-types";
import { writeServerResponseFor } from "./write-server-response";

export type RouteHandler = (request: LensApiRequest<string>, response: ServerResponse) => Promise<void>;
export type CreateHandlerForRoute = (route: Route<unknown, string>) => RouteHandler;

const createHandlerForRouteInjectable = getInjectable({
  id: "create-handler-for-route",
  instantiate: (di): CreateHandlerForRoute => {
    const logger = di.inject(loggerInjectable);

    return (route) => async (request, response) => {
      const writeServerResponse = writeServerResponseFor(response);

      try {
        const result = await route.handler(request);

        if (!result) {
          writeServerResponse(contentTypes.txt.resultMapper({
            statusCode: 204,
            response: undefined,
          }));
        } else if (!result.proxy) {
          const contentType = result.contentType || contentTypes.json;

          writeServerResponse(contentType.resultMapper(result));
        }
      } catch(error) {
        logger.error(`[ROUTER]: route ${route.path}, called with ${request.path}, threw an error`, error);
        writeServerResponse(contentTypes.txt.resultMapper({
          statusCode: 500,
          error: error ? String(error) : "unknown error",
        }));
      }
    };
  },
});

export default createHandlerForRouteInjectable;