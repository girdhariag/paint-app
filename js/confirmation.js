'use strict';

// To show a prompt when the canvas is edited and the user tries to close or reload the tab.
window.addEventListener('beforeunload', function (ev) {
  if (!allowPrompt) {
    delete ev['returnValue'];

  } else if (ev) {
    ev.returnValue = 'Are you sure you want to close?';

  } else {
    return 'Are you sure you want to close?';

  }
});