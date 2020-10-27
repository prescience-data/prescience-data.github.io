;(function () {
  /** Constant Defaults **/
  var COLLECTION_ENDPOINT = window.COLLECTION_ENDPOINT
    ? window.COLLECTION_ENDPOINT
    : ""
  var SCROLL_ELEMENT_ID = window.SCROLL_ELEMENT_ID
    ? window.SCROLL_ELEMENT_ID
    : "scroller"

  /**
   * Helper function for handling circular references.
   *
   * @param node
   * @return {string|null}
   */
  var pathToSelector = function (node) {
    if (!node || !node.outerHTML) {
      return null
    }

    var path
    while (node.parentElement) {
      var name = node.localName
      if (!name) {
        break
      }
      name = name.toLowerCase()
      var parent = node.parentElement

      var domSiblings = []

      if (parent.children && parent.children.length > 0) {
        for (var i = 0; i < parent.children.length; i++) {
          var sibling = parent.children[i]
          if (sibling.localName && sibling.localName.toLowerCase) {
            if (sibling.localName.toLowerCase() === name) {
              domSiblings.push(sibling)
            }
          }
        }
      }

      if (domSiblings.length > 1) {
        name += ":eq(" + domSiblings.indexOf(node) + ")"
      }
      path = name + (path ? ">" + path : "")
      node = parent
    }

    return path
  }

  /**
   * Handles serialisation of an event to prevent circular reference errors.
   * @param e
   * @return any
   */
  var serializeEvent = function (e) {
    if (e) {
      return {
        eventName: e.toString(),
        //altKey: e.altKey,
        //bubbles: e.bubbles,
        button: e.button,
        buttons: e.buttons,
        //cancelBubble: e.cancelBubble,
        //cancelable: e.cancelable,
        clientX: e.clientX,
        clientY: e.clientY,
        //composed: e.composed,
        //ctrlKey: e.ctrlKey,
        //currentTarget: e.currentTarget ? e.currentTarget.outerHTML : null,
        defaultPrevented: e.defaultPrevented,
        //detail: e.detail,
        //eventPhase: e.eventPhase,
        //fromElement: e.fromElement ? e.fromElement.outerHTML : null,
        //isTrusted: e.isTrusted,
        layerX: e.layerX,
        layerY: e.layerY,
        //metaKey: e.metaKey,
        movementX: e.movementX,
        movementY: e.movementY,
        offsetX: e.offsetX,
        offsetY: e.offsetY,
        pageX: e.pageX,
        pageY: e.pageY,
        //path: pathToSelector(e.path && e.path.length ? e.path[0] : null),
        //relatedTarget: e.relatedTarget ? e.relatedTarget.outerHTML : null,
        //returnValue: e.returnValue,
        screenX: e.screenX,
        screenY: e.screenY,
        touches:
          e.touches && e.touches[0]
            ? { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }
            : null,
        //shiftKey: e.shiftKey,
        //sourceCapabilities: e.sourceCapabilities ? e.sourceCapabilities.toString() : null,
        //target: e.target ? e.target.outerHTML : null,
        timeStamp: e.timeStamp,
        //toElement: e.toElement ? e.toElement.outerHTML : null,
        type: e.type,
        //view: e.view ? e.view.toString() : null,
        which: e.which,
        x: e.x,
        y: e.y,
      }
    }
  }

  /**
   * Normalises a touch event into the format we are expecting.
   *
   * @param se
   * @return {{x: (*|null), y: (*|null), type: (*|null), timestamp: (*|null)}}
   */
  var normaliseEvent = function (se) {
    if (se && se.touches) {
      return {
        type: se.type ? se.type : null,
        x: se.touches ? se.touches.clientX : null,
        y: se.touches ? se.touches.clientY : null,
        timestamp: se.timestamp ? se.timestamp : null,
      }
    }
  }

  /** Global Variables **/
  var $scroller = document.getElementById(SCROLL_ELEMENT_ID)
  var scrolls = []
  var scroll = []

  var push = function (data) {
    var xhr = new XMLHttpRequest()
    xhr.open("POST", COLLECTION_ENDPOINT, true)
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send(
      JSON.stringify(
        {
          data: data,
          timestamp: Date.now(),
        },
        undefined,
        2
      )
    )
  }

  /**
   * Adds a touch event to the current sequence.
   *
   * @param event
   */
  var listener = function (event) {
    event = serializeEvent(event)
    event = normaliseEvent(event)
    scroll.push(event)
  }

  /**
   * Aborts the touch collection.
   *
   * @param event
   */
  var canceller = function (event) {
    console.log("Cancelled touch: " + event.type)
    scroll = []
  }

  /**
   * Listen for end events and refresh the process.
   * Posts the collected touch event sequence to collection endpoint.
   *
   * @param event
   */
  var closer = function (event) {
    event = serializeEvent(event)
    event = normaliseEvent(event)
    scroll.push(event)
    scrolls.push(scrolls)
    $scroller.innerText = JSON.stringify(scroll, undefined, 2)
    console.log(scroll)
    push(scroll)
    scroll = []
  }

  /** Touch Event Listeners **/
  document.addEventListener("touchmove", listener, !0)
  document.addEventListener("touchstart", listener, !0)
  document.addEventListener("touchend", closer, !0)
  document.addEventListener("touchcancel", canceller, !0)
  // Disable mouse events for production...
  //document.addEventListener("click", listener, !0)
  //document.addEventListener("pointerdown", listener, !0)
  //document.addEventListener("pointerup", closer, !0)
})()
