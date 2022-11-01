/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainerForInjection, InjectionToken } from "@ogre-tools/injectable";
import type { Composite } from "../utils/composite/get-composite/get-composite";
import { getCompositeFor } from "../utils/composite/get-composite/get-composite";
import * as uuid from "uuid";

export interface RunnableSync<TParameter = void> {
  id: string;
  run: RunSync<TParameter>;
  runAfter?: RunnableSync<TParameter>;
}

type RunSync<Param> = (parameter: Param) => void;

export type RunManySync = <Param>(injectionToken: InjectionToken<RunnableSync<Param>, void>) => RunSync<Param>;

function runCompositeRunnableSyncs<Param>(param: Param, composite: Composite<RunnableSync<Param>>) {
  composite.value.run(param);
  composite.children.map(composite => runCompositeRunnableSyncs(param, composite));
}

export function runManySyncFor(di: DiContainerForInjection): RunManySync {
  return <Param>(injectionToken: InjectionToken<RunnableSync<Param>, void>) => async (param: Param) => {
    const allRunnables = di.injectMany(injectionToken);
    const rootId = uuid.v4();
    const getCompositeRunnables = getCompositeFor<RunnableSync<Param>>({
      getId: (runnable) => runnable.id,
      getParentId: (runnable) => (
        runnable.id === rootId
          ? undefined
          : runnable.runAfter?.id ?? rootId
      ),
    });
    const composite = getCompositeRunnables([
      // This is a dummy runnable to conform to the requirements of `getCompositeFor` to only have one root
      {
        id: rootId,
        run: () => {},
      },
      ...allRunnables,
    ]);

    runCompositeRunnableSyncs(param, composite);
  };
}
