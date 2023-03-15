/* ignore coverage somehow */

import { getInjectable } from "@ogre-tools/injectable";

const castDieInjectable = getInjectable({
  id: "cast-die",
  instantiate: () => () => Promise.resolve(0),
  causesSideEffects: true,
});

export default castDieInjectable;
