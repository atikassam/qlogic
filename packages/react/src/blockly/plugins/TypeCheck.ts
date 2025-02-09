import * as Blockly from 'blockly/core';


export class StrictConnectionChecker extends Blockly.ConnectionChecker {


  override doTypeChecks(a: Blockly.Connection, b: Blockly.Connection) {
    const checkArrayOne = a.getCheck();
    const checkArrayTwo = b.getCheck();

    if (checkArrayOne === null || checkArrayTwo === null)
      return true;

    if (!checkArrayOne || !checkArrayTwo) {
      // Null arrays can only connect to other null arrays.
      return checkArrayOne == checkArrayTwo;
    }

    // Find any intersection in the check lists.
    for (let i = 0; i < checkArrayOne.length; i++) {
      if (checkArrayTwo.indexOf(checkArrayOne[i]) != -1) {
        return true;
      }
    }
    // No intersection.
    return false;
  }
}

export const registrationType = Blockly.registry.Type.CONNECTION_CHECKER;
export const registrationName = 'StrictConnectionChecker';

// Register the checker so that it can be used by name.
Blockly.registry.register(
  registrationType,
  registrationName,
  StrictConnectionChecker,
);

export const StrictConnectionCheckerPluginInfo = {
  [registrationType as any]: registrationName,
};