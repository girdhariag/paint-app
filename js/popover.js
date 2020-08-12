'use strict';

/* ------ For pop over functionality with clicking. --- */
window.addEventListener('DOMContentLoaded', (ev) => {
  var popoverContainers = document.querySelectorAll('.popover-container');

  /* register a click event will all the popover triggering buttons. */
  popoverContainers.forEach(function(popover) {
    popover.addEventListener('click', function(ev) {
      popOverClicked(ev);
    }, false);
  });

  document.addEventListener('click', function(ev) {
    closePopoverOnClickOutside(ev.target); // closes the popover when we click outside the LHS popover containers
  }, false);

  function popOverClicked(ev) {
    var popover = ev.target.closest('.popover-container');
    if (popover.classList.contains('open')) {
      closePopover(popover); // if the popover is already opened, close it.
    } else {
      popover.classList.add('open');
    }
  }

  function closePopover(selectList) {
    selectList.classList.remove('open');
  }

  function closePopoverOnClickOutside(target) { // closes popover on outside click

    if (target !== document) {
      var selectList = target.closest('.popover-container');

      popoverContainers.forEach(function(popover) {
        if (popover !== selectList) { // Closes the other popovers if open
          closePopover(popover);
        }
      });
    }
  }
});