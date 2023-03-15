import { getInjectable } from "@ogre-tools/injectable";
import messageToPlayerInjectable from "./message-to-player.injectable";
import questionToPlayerInjectable from "./question-to-player.injectable";
import monsterInjectable from "./monster.injectable";

const handleInitialMonsterEncounterInjectable = getInjectable({
  id: "handle-initial-monster-encounter",

  instantiate: (di) => {
    const messageToPlayer = di.inject(messageToPlayerInjectable);
    const questionToPlayer = di.inject(questionToPlayerInjectable);
    const monster = di.inject(monsterInjectable);

    return async () => {
      messageToPlayer(`You encounter a monster "${monster.name}" with ${monster.hitPoints} hit-points`);

      const playerWantsToAttack = await questionToPlayer("Attack the monster?");
      if (playerWantsToAttack) {
        return { gameIsOver: false };
      }

      messageToPlayer(
        "You chose not to attack the monster, and the monster eats you dead, in disappointment.",
      );

      messageToPlayer("You lose. Game over!");

      return { gameIsOver: true };
    };
  },
});

export default handleInitialMonsterEncounterInjectable;
