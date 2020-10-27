;(function () {
  /** Constant Defaults **/
  var COLLECTION_ENDPOINT = window.COLLECTION_ENDPOINT
    ? window.COLLECTION_ENDPOINT
    : ""
  var SCROLL_ELEMENT_ID = window.SCROLL_ELEMENT_ID
    ? window.SCROLL_ELEMENT_ID
    : "scroller"

  /** Global Variables **/
  var $scroller = document.getElementById(SCROLL_ELEMENT_ID)
  var scrolls = []
  var scroll = []
  var ip

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
   *
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
   * Resolves information on users IP address.
   *
   * @return string
   */
  var getIpInfo = function () {
    try {
      var key = "cc7c905b077d0a"
      window
        .fetch("https://ipinfo.io/json/?token=" + key)
        .then(function (res) {
          return res.json()
        })
        .then(function (json) {
          return (ip = json)
        })
    } catch (err) {
      console.log(err.message)
    }
  }

  /** Immediately retrieve ip information **/
  getIpInfo()

  /**
   * Creates a stripped ip identifier.
   *
   * @return {string}
   */
  var ipHash = function () {
    if (!ip) {
      return ""
    }
    return ip.ip.slice(0, -3) + "xxx"
  }

  /**
   * Creates a location string.
   *
   * @return {string}
   */
  var ipLocation = function () {
    if (!ip) {
      return ""
    }
    return ip.city + ", " + ip.country
  }

  /**
   * Identifies browser name from user agent.
   *
   * @return {string}
   */
  var getBrowserName = function () {
    var sBrowser,
      sUsrAg = navigator.userAgent

    // The order matters here, and this may report false positives for unlisted browsers.

    if (sUsrAg.indexOf("Firefox") > -1) {
      sBrowser = "Mozilla Firefox"
      // "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0"
    } else if (sUsrAg.indexOf("SamsungBrowser") > -1) {
      sBrowser = "Samsung Internet"
      // "Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G955F Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/9.4 Chrome/67.0.3396.87 Mobile Safari/537.36
    } else if (sUsrAg.indexOf("Opera") > -1 || sUsrAg.indexOf("OPR") > -1) {
      sBrowser = "Opera"
      // "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 OPR/57.0.3098.106"
    } else if (sUsrAg.indexOf("Trident") > -1) {
      sBrowser = "Microsoft Internet Explorer"
      // "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Zoom 3.6.0; wbx 1.0.0; rv:11.0) like Gecko"
    } else if (sUsrAg.indexOf("Edge") > -1) {
      sBrowser = "Microsoft Edge"
      // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
    } else if (sUsrAg.indexOf("Chrome") > -1) {
      sBrowser = "Google Chrome or Chromium"
      // "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.181 Chrome/66.0.3359.181 Safari/537.36"
    } else if (sUsrAg.indexOf("Safari") > -1) {
      sBrowser = "Apple Safari"
      // "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306"
    } else {
      sBrowser = "unknown"
    }

    return sBrowser
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
        timestamp: se.timeStamp ? se.timeStamp : null,
      }
    }
  }

  var push = function (data) {
    var xhr = new XMLHttpRequest()
    xhr.open("POST", COLLECTION_ENDPOINT, true)
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send(
      JSON.stringify(
        {
          data: data,
          browser: getBrowserName(),
          platform: window.navigator.platform,
          maxTouchPoints: window.navigator.maxTouchPoints,
          location: ipLocation(),
          hash: ipHash(),
          timestamp: Math.floor(Date.now() / 1000),
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
    $scroller.innerText = "Touch cancelled."
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
  $scroller.innerText = "Listening..."
})()
