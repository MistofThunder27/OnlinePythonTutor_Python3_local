(function () {
  var r = !!document.createElement("canvas").getContext;
  var d =
    !!window.SVGAngle || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
  var a = !(r | d);
  var l = function (y, z, w, C) {
    var B = function (E, D) {
      if (E === D) {
        return true;
      } else {
        if (typeof E == "object" && typeof D == "object") {
          var F = true;
          for (var v in E) {
            if (!B(E[v], D[v])) {
              F = false;
              break;
            }
          }
          for (var v in D) {
            if (!B(D[v], E[v])) {
              F = false;
              break;
            }
          }
          return F;
        }
      }
    };
    for (var A = +w || 0, x = y.length; A < x; A++) {
      if (B(y[A], z)) {
        return A;
      }
    }
    return -1;
  };
  var g = function (y, w, x) {
    var v = y[w];
    if (v == null) {
      v = [];
      y[w] = v;
    }
    v.push(x);
    return v;
  };
  var p = null;
  var c = function (v, w) {
      return i.CurrentLibrary.getAttribute(u(v), w);
    },
    e = function (w, x, v) {
      i.CurrentLibrary.setAttribute(u(w), x, v);
    },
    s = function (w, v) {
      i.CurrentLibrary.addClass(u(w), v);
    },
    f = function (w, v) {
      return i.CurrentLibrary.hasClass(u(w), v);
    },
    h = function (w, v) {
      i.CurrentLibrary.removeClass(u(w), v);
    },
    u = function (v) {
      return i.CurrentLibrary.getElementObject(v);
    },
    n = function (v) {
      return i.CurrentLibrary.getOffset(u(v));
    },
    b = function (v) {
      return i.CurrentLibrary.getSize(u(v));
    },
    k = function (v, w) {
      if (v.logEnabled && typeof console != "undefined") {
        console.log(w);
      }
    };
  var o = function () {
    var x = {},
      w = this;
    var v = ["ready"];
    this.bind = function (y, z) {
      g(x, y, z);
    };
    this.fire = function (A, B, y) {
      if (x[A]) {
        for (var z = 0; z < x[A].length; z++) {
          if (l(v, A) != -1) {
            x[A][z](B, y);
          } else {
            try {
              x[A][z](B, y);
            } catch (C) {
              k("jsPlumb: fire failed for event " + A + " : " + C);
            }
          }
        }
      }
    };
    this.clearListeners = function (y) {
      if (y) {
        delete x[y];
      } else {
        delete x;
        x = {};
      }
    };
  };
  var t = function (z) {
    var x = this,
      w = arguments,
      v = false;
    x._jsPlumb = z._jsPlumb;
    o.apply(this);
    this.clone = function () {
      var B = new Object();
      x.constructor.apply(B, w);
      return B;
    };
    (this.overlayPlacements = []), (this.paintStyle = null), (this.hoverPaintStyle = null);
    var A = function () {
      if (x.paintStyle && x.hoverPaintStyle) {
        var B = {};
        i.extend(B, x.paintStyle);
        i.extend(B, x.hoverPaintStyle);
        delete x.hoverPaintStyle;
        if (B.gradient && x.paintStyle.fillStyle) {
          delete B.gradient;
        }
        x.hoverPaintStyle = B;
      }
    };
    this.setPaintStyle = function (B, C) {
      x.paintStyle = B;
      x.paintStyleInUse = x.paintStyle;
      A();
      if (!C) {
        x.repaint();
      }
    };
    this.setHoverPaintStyle = function (B, C) {
      x.hoverPaintStyle = B;
      A();
      if (!C) {
        x.repaint();
      }
    };
    this.setHover = function (B, C) {
      v = B;
      if (x.hoverPaintStyle != null) {
        x.paintStyleInUse = B ? x.hoverPaintStyle : x.paintStyle;
        x.repaint();
        if (!C) {
          y(B);
        }
      }
    };
    this.isHover = function () {
      return v;
    };
    this.attachListeners = function (G, H) {
      var E = i.CurrentLibrary,
        C = ["click", "dblclick", "mouseenter", "mouseout", "mousemove", "mousedown", "mouseup"],
        F = {
          mouseout: "mouseexit",
        },
        D = function (J) {
          var I = F[J] || J;
          E.bind(G, J, function (K) {
            H.fire(I, H, K);
          });
        };
      for (var B = 0; B < C.length; B++) {
        D(C[B]);
      }
    };
    var y = function (D) {
      var C = x.getAttachedElements();
      if (C) {
        for (var B = 0; B < C.length; B++) {
          C[B].setHover(D, true);
        }
      }
    };
  };
  var q = function (A) {
    this.Defaults = {
      Anchor: "BottomCenter",
      Anchors: [null, null],
      Connector: "Bezier",
      DragOptions: {},
      DropOptions: {},
      Endpoint: "Dot",
      Endpoints: [null, null],
      EndpointStyle: {
        fillStyle: "#456",
      },
      EndpointStyles: [null, null],
      EndpointHoverStyle: null,
      EndpointHoverStyles: [null, null],
      HoverPaintStyle: null,
      LabelStyle: {
        color: "black",
      },
      LogEnabled: false,
      Overlays: [],
      MaxConnections: 1,
      MouseEventsEnabled: true,
      PaintStyle: {
        lineWidth: 8,
        strokeStyle: "#456",
      },
      RenderMode: "canvas",
      Scope: "_jsPlumb_DefaultScope",
    };
    if (A) {
      i.extend(this.Defaults, A);
    }
    this.logEnabled = this.Defaults.LogEnabled;
    o.apply(this);
    var av = this.bind;
    this.bind = function (ay, ax) {
      if ("ready" === ay && J) {
        ax();
      } else {
        av(ay, ax);
      }
    };
    var D = this,
      F = null,
      ak = function () {
        i.repaintEverything();
      },
      y = true,
      aj = function () {
        if (y) {
          ak();
        }
      },
      ai = null,
      J = false,
      L = {},
      ah = {},
      T = {},
      V = {},
      C = {},
      Z = {},
      ag = {},
      ap = this.Defaults.MouseEventsEnabled,
      Y = true,
      af = [],
      P = [],
      al = {},
      B = this.Defaults.Scope,
      aa = null,
      S = function (aA, ay, az) {
        var ax = aA[ay];
        if (ax == null) {
          ax = [];
          aA[ay] = ax;
        }
        ax.push(az);
        return ax;
      },
      R = function (ay, ax) {
        if (D.Defaults.Container) {
          i.CurrentLibrary.appendElement(ay, D.Defaults.Container);
        } else {
          if (!ax) {
            document.body.appendChild(ay);
          } else {
            i.CurrentLibrary.appendElement(ay, ax);
          }
        }
      },
      ar = function () {
        return "" + new Date().getTime();
      },
      w = function (ax) {
        return ax._nodes ? ax._nodes : ax;
      },
      at = function (aD, aI, aG) {
        var ax = c(aD, "id");
        var ay = ah[ax];
        if (!aG) {
          aG = ar();
        }
        if (ay) {
          E({
            elId: ax,
            offset: aI,
            recalc: false,
            timestamp: aG,
          });
          var aH = V[ax],
            aF = P[ax];
          for (var aE = 0; aE < ay.length; aE++) {
            ay[aE].paint({
              timestamp: aG,
              offset: aH,
              dimensions: aF,
            });
            var aA = ay[aE].connections;
            for (var aC = 0; aC < aA.length; aC++) {
              aA[aC].paint({
                elId: ax,
                ui: aI,
                recalc: false,
                timestamp: aG,
              });
              var aJ = aA[aC].endpoints[0] == ay[aE] ? 1 : 0,
                az = aA[aC].endpoints[aJ];
              if (az.anchor.isDynamic && !az.isFloating()) {
                E({
                  elId: az.elementId,
                  timestamp: aG,
                });
                az.paint({
                  elementWithPrecedence: ax,
                });
                for (var aB = 0; aB < az.connections.length; aB++) {
                  if (az.connections[aB] !== aA) {
                    az.connections[aB].paint({
                      elId: ax,
                      ui: aI,
                      recalc: false,
                      timestamp: aG,
                    });
                  }
                }
              }
            }
          }
        }
      },
      I = function (ay, aA) {
        var aB = null;
        if (ay.constructor == Array) {
          aB = [];
          for (var ax = 0; ax < ay.length; ax++) {
            var az = u(ay[ax]),
              aC = c(az, "id");
            aB.push(aA(az, aC));
          }
        } else {
          var az = u(ay),
            aC = c(az, "id");
          aB = aA(az, aC);
        }
        return aB;
      },
      X = function (ax) {
        return T[ax];
      },
      O = function (aB, aA, az) {
        var ax = aA == null ? Y : aA;
        if (ax) {
          if (i.CurrentLibrary.isDragSupported(aB) && !i.CurrentLibrary.isAlreadyDraggable(aB)) {
            var ay = az || D.Defaults.DragOptions || i.Defaults.DragOptions;
            ay = i.extend({}, ay);
            var aD = i.CurrentLibrary.dragEvents.drag;
            var aC = i.CurrentLibrary.dragEvents.stop;
            ay[aD] = am(ay[aD], function () {
              var aE = i.CurrentLibrary.getUIPosition(arguments);
              at(aB, aE);
              s(aB, "jsPlumb_dragged");
            });
            ay[aC] = am(ay[aC], function () {
              var aE = i.CurrentLibrary.getUIPosition(arguments);
              at(aB, aE);
              h(aB, "jsPlumb_dragged");
            });
            var ax = ag[aw(aB)];
            ay.disabled = ax == null ? false : !ax;
            i.CurrentLibrary.initDraggable(aB, ay);
          }
        }
      },
      au = function (aB) {
        var aA = i.Defaults.ConnectionType || G,
          az = i.Defaults.EndpointType || aq,
          ay = i.CurrentLibrary.getParent;
        if (aB.container) {
          aB.parent = aB.container;
        } else {
          if (aB.sourceEndpoint) {
            aB.parent = aB.sourceEndpoint.parent;
          } else {
            if (aB.source.constructor == az) {
              aB.parent = aB.source.parent;
            } else {
              aB.parent = ay(aB.source);
            }
          }
        }
        aB._jsPlumb = D;
        var ax = new aA(aB);
        z("click", "click", ax);
        z("dblclick", "dblclick", ax);
        return ax;
      },
      z = function (ax, ay, az) {
        az.bind(ax, function (aB, aA) {
          D.fire(ay, az, aA);
        });
      },
      an = function (ay) {
        var ax = i.Defaults.EndpointType || aq;
        if (ay.container) {
          ay.parent = ay.container;
        } else {
          ay.parent = i.CurrentLibrary.getParent(ay.source);
        }
        (ay._jsPlumb = D), (ep = new ax(ay));
        z("click", "endpointClick", ep);
        z("dblclick", "endpointDblClick", ep);
        return ep;
      },
      U = function (az, aC, aB) {
        var ax = ah[az];
        if (ax && ax.length) {
          for (var aA = 0; aA < ax.length; aA++) {
            for (var ay = 0; ay < ax[aA].connections.length; ay++) {
              var aD = aC(ax[aA].connections[ay]);
              if (aD) {
                return;
              }
            }
            if (aB) {
              aB(ax[aA]);
            }
          }
        }
      },
      K = function (ay) {
        for (var ax in ah) {
          U(ax, ay);
        }
      },
      ae = function (ax, ay) {
        if (ax != null && ax.parentNode != null) {
          ax.parentNode.removeChild(ax);
        }
      },
      Q = function (az, ay) {
        for (var ax = 0; ax < az.length; ax++) {
          ae(az[ax], ay);
        }
      },
      M = function (aB, az, aA) {
        if (az != null) {
          var ax = aB[az];
          if (ax != null) {
            var ay = l(ax, aA);
            if (ay >= 0) {
              delete ax[ay];
              ax.splice(ay, 1);
              return true;
            }
          }
        }
        return false;
      },
      v = function (ay, ax) {
        return I(ay, function (az, aA) {
          ag[aA] = ax;
          if (i.CurrentLibrary.isDragSupported(az)) {
            i.CurrentLibrary.setDraggable(az, ax);
          }
        });
      },
      ao = function (az, aA, ax) {
        aA = aA === "block";
        var ay = null;
        if (ax) {
          if (aA) {
            ay = function (aC) {
              aC.setVisible(true, true, true);
            };
          } else {
            ay = function (aC) {
              aC.setVisible(false, true, true);
            };
          }
        }
        var aB = c(az, "id");
        U(
          aB,
          function (aD) {
            if (aA && ax) {
              var aC = aD.sourceId === aB ? 1 : 0;
              if (aD.endpoints[aC].isVisible()) {
                aD.setVisible(true);
              }
            } else {
              aD.setVisible(aA);
            }
          },
          ay
        );
      },
      N = function (ax) {
        return I(ax, function (az, ay) {
          var aA = ag[ay] == null ? Y : ag[ay];
          aA = !aA;
          ag[ay] = aA;
          i.CurrentLibrary.setDraggable(az, aA);
          return aA;
        });
      },
      x = function (ax, az) {
        var ay = null;
        if (az) {
          ay = function (aA) {
            var aB = aA.isVisible();
            aA.setVisible(!aB);
          };
        }
        U(
          ax,
          function (aB) {
            var aA = aB.isVisible();
            aB.setVisible(!aA);
          },
          ay
        );
      },
      E = function (aC) {
        var aA = aC.timestamp,
          ax = aC.recalc,
          aB = aC.offset,
          ay = aC.elId;
        if (!ax) {
          if (aA && aA === C[ay]) {
            return V[ay];
          }
        }
        if (ax || aB == null) {
          var az = u(ay);
          if (az != null) {
            P[ay] = b(az);
            V[ay] = n(az);
            C[ay] = aA;
          }
        } else {
          V[ay] = aB;
        }
        return V[ay];
      },
      aw = function (ax, ay) {
        var az = u(ax);
        var aA = c(az, "id");
        if (!aA || aA == "undefined") {
          if (arguments.length == 2 && arguments[1] != undefined) {
            aA = ay;
          } else {
            aA = "jsPlumb_" + ar();
          }
          e(az, "id", aA);
        }
        return aA;
      },
      am = function (az, ax, ay) {
        az = az || function () {};
        ax = ax || function () {};
        return function () {
          var aA = null;
          try {
            aA = ax.apply(this, arguments);
          } catch (aB) {
            k(D, "jsPlumb function failed : " + aB);
          }
          if (ay == null || aA !== ay) {
            try {
              az.apply(this, arguments);
            } catch (aB) {
              k(D, "wrapped function failed : " + aB);
            }
          }
          return aA;
        };
      };
    this.connectorClass = "_jsPlumb_connector";
    this.endpointClass = "_jsPlumb_endpoint";
    this.overlayClass = "_jsPlumb_overlay";
    this.Anchors = {};
    this.Connectors = {
      canvas: {},
      svg: {},
      vml: {},
    };
    this.Endpoints = {
      canvas: {},
      svg: {},
      vml: {},
    };
    this.Overlays = {
      canvas: {},
      svg: {},
      vml: {},
    };
    this.addEndpoint = function (az, aA, aJ) {
      aJ = aJ || {};
      var ay = i.extend({}, aJ);
      i.extend(ay, aA);
      ay.endpoint = ay.endpoint || D.Defaults.Endpoint || i.Defaults.Endpoint;
      ay.paintStyle = ay.paintStyle || D.Defaults.EndpointStyle || i.Defaults.EndpointStyle;
      az = w(az);
      var aB = [],
        aE = az.length && az.constructor != String ? az : [az];
      for (var aC = 0; aC < aE.length; aC++) {
        var aH = u(aE[aC]),
          ax = aw(aH);
        ay.source = aH;
        E({
          elId: ax,
        });
        var aG = an(ay);
        S(ah, ax, aG);
        var aF = V[ax],
          aD = P[ax];
        var aI = aG.anchor.compute({
          xy: [aF.left, aF.top],
          wh: aD,
          element: aG,
        });
        aG.paint({
          anchorLoc: aI,
        });
        aB.push(aG);
      }
      return aB.length == 1 ? aB[0] : aB;
    };
    this.addEndpoints = function (aB, ay, ax) {
      var aA = [];
      for (var az = 0; az < ay.length; az++) {
        var aC = D.addEndpoint(aB, ay[az], ax);
        if (aC.constructor == Array) {
          Array.prototype.push.apply(aA, aC);
        } else {
          aA.push(aC);
        }
      }
      return aA;
    };
    this.animate = function (az, ay, ax) {
      var aA = u(az),
        aD = c(az, "id");
      ax = ax || {};
      var aC = i.CurrentLibrary.dragEvents.step;
      var aB = i.CurrentLibrary.dragEvents.complete;
      ax[aC] = am(ax[aC], function () {
        D.repaint(aD);
      });
      ax[aB] = am(ax[aB], function () {
        D.repaint(aD);
      });
      i.CurrentLibrary.animate(aA, ay, ax);
    };
    this.connect = function (aA, aG) {
      var ax = i.extend({}, aA);
      if (aG) {
        i.extend(ax, aG);
      }
      if (ax.source && ax.source.endpoint) {
        ax.sourceEndpoint = ax.source;
      }
      if (ax.source && ax.target.endpoint) {
        ax.targetEndpoint = ax.target;
      }
      if (aA.uuids) {
        ax.sourceEndpoint = X(aA.uuids[0]);
        ax.targetEndpoint = X(aA.uuids[1]);
      }
      if (ax.sourceEndpoint && ax.sourceEndpoint.isFull()) {
        k(D, "could not add connection; source endpoint is full");
        return;
      }
      if (ax.targetEndpoint && ax.targetEndpoint.isFull()) {
        k(D, "could not add connection; target endpoint is full");
        return;
      }
      if (ax.target && !ax.target.endpoint) {
        var aB = aw(ax.target),
          ay = W[aB];
        var az = function (aJ, aH, aI, aK) {
          if (aK[aI]) {
            if (ax[aH]) {
              ax[aH][1] = aK[aI];
            } else {
              if (ax[aJ]) {
                ax[aH] = [ax[aJ], aK[aI]];
                ax[aJ] = null;
              } else {
                ax[aH] = [null, aK[aI]];
              }
            }
          }
        };
        if (ay) {
          az("endpoint", "endpoints", "endpoint", ay);
          az("endpointStyle", "endpointStyles", "paintStyle", ay);
          az("endpointHoverStyle", "endpointHoverStyles", "hoverPaintStyle", ay);
        }
      }
      if (ax.dynamicAnchors) {
        var aE = ax.dynamicAnchors.constructor == Array;
        var aF = aE ? new ab(i.makeAnchors(ax.dynamicAnchors)) : new ab(i.makeAnchors(ax.dynamicAnchors.source));
        var aC = aE ? new ab(i.makeAnchors(ax.dynamicAnchors)) : new ab(i.makeAnchors(ax.dynamicAnchors.target));
        ax.anchors = [aF, aC];
      }
      var aD = au(ax);
      S(L, aD.scope, aD);
      D.fire("jsPlumbConnection", {
        connection: aD,
        source: aD.source,
        target: aD.target,
        sourceId: aD.sourceId,
        targetId: aD.targetId,
        sourceEndpoint: aD.endpoints[0],
        targetEndpoint: aD.endpoints[1],
      });
      at(aD.source);
      return aD;
    };
    this.deleteEndpoint = function (ay) {
      var aD = typeof ay == "string" ? T[ay] : ay;
      if (aD) {
        var aA = aD.getUuid();
        if (aA) {
          T[aA] = null;
        }
        aD.detachAll();
        ae(aD.canvas, aD.parent);
        for (var aC in ah) {
          var ax = ah[aC];
          if (ax) {
            var aB = [];
            for (var az = 0; az < ax.length; az++) {
              if (ax[az] != aD) {
                aB.push(ax[az]);
              }
            }
            ah[aC] = aB;
          }
        }
        delete aD;
      }
    };
    this.deleteEveryEndpoint = function () {
      for (var az in ah) {
        var ax = ah[az];
        if (ax && ax.length) {
          for (var ay = 0; ay < ax.length; ay++) {
            D.deleteEndpoint(ax[ay]);
          }
        }
      }
      delete ah;
      ah = {};
      delete T;
      T = {};
    };
    var ad = function (ax) {
      D.fire("jsPlumbConnectionDetached", {
        connection: ax,
        source: ax.source,
        target: ax.target,
        sourceId: ax.sourceId,
        targetId: ax.targetId,
        sourceEndpoint: ax.endpoints[0],
        targetEndpoint: ax.endpoints[1],
      });
    };
    this.detach = function (ax, aB) {
      if (arguments.length == 2) {
        var aF = u(ax),
          az = aw(aF);
        var aE = u(aB),
          aA = aw(aE);
        U(az, function (aG) {
          if ((aG.sourceId == az && aG.targetId == aA) || (aG.targetId == az && aG.sourceId == aA)) {
            Q(aG.connector.getDisplayElements(), aG.parent);
            aG.endpoints[0].removeConnection(aG);
            aG.endpoints[1].removeConnection(aG);
            M(L, aG.scope, aG);
          }
        });
      } else {
        if (arguments.length == 1) {
          if (arguments[0].constructor == G) {
            arguments[0].endpoints[0].detachFrom(arguments[0].endpoints[1]);
          } else {
            if (arguments[0].connection) {
              arguments[0].connection.endpoints[0].detachFrom(arguments[0].connection.endpoints[1]);
            } else {
              var ay = i.extend({}, ax);
              if (ay.uuids) {
                X(ay.uuids[0]).detachFrom(X(ay.uuids[1]));
              } else {
                if (ay.sourceEndpoint && ay.targetEndpoint) {
                  ay.sourceEndpoint.detachFrom(ay.targetEndpoint);
                } else {
                  var aD = aw(ay.source);
                  var aC = aw(ay.target);
                  U(aD, function (aG) {
                    if ((aG.sourceId == aD && aG.targetId == aC) || (aG.targetId == aD && aG.sourceId == aC)) {
                      Q(aG.connector.getDisplayElements(), aG.parent);
                      aG.endpoints[0].removeConnection(aG);
                      aG.endpoints[1].removeConnection(aG);
                      M(L, aG.scope, aG);
                    }
                  });
                }
              }
            }
          }
        }
      }
    };
    this.detachAllConnections = function (az) {
      var aA = c(az, "id");
      var ax = ah[aA];
      if (ax && ax.length) {
        for (var ay = 0; ay < ax.length; ay++) {
          ax[ay].detachAll();
        }
      }
    };
    this.detachAll = this.detachAllConnections;
    this.detachEveryConnection = function () {
      for (var az in ah) {
        var ax = ah[az];
        if (ax && ax.length) {
          for (var ay = 0; ay < ax.length; ay++) {
            ax[ay].detachAll();
          }
        }
      }
      delete L;
      L = {};
    };
    this.detachEverything = this.detachEveryConnection;
    this.draggable = function (az, ax) {
      if (typeof az == "object" && az.length) {
        for (var ay = 0; ay < az.length; ay++) {
          var aA = u(az[ay]);
          if (aA) {
            O(aA, true, ax);
          }
        }
      } else {
        if (az._nodes) {
          for (var ay = 0; ay < az._nodes.length; ay++) {
            var aA = u(az._nodes[ay]);
            if (aA) {
              O(aA, true, ax);
            }
          }
        } else {
          var aA = u(az);
          if (aA) {
            O(aA, true, ax);
          }
        }
      }
    };
    this.extend = function (ay, ax) {
      return i.CurrentLibrary.extend(ay, ax);
    };
    this.getDefaultEndpointType = function () {
      return aq;
    };
    this.getDefaultConnectionType = function () {
      return G;
    };
    this.getConnections = function (aI) {
      if (!aI) {
        aI = {};
      } else {
        if (aI.constructor == String) {
          aI = {
            scope: aI,
          };
        }
      }
      var aF = function (aJ) {
        var aK = [];
        if (aJ) {
          if (typeof aJ == "string") {
            aK.push(aJ);
          } else {
            aK = aJ;
          }
        }
        return aK;
      };
      var aG = aI.scope || i.getDefaultScope(),
        aE = aF(aG),
        ax = aF(aI.source),
        aC = aF(aI.target),
        ay = function (aK, aJ) {
          return aK.length > 0 ? l(aK, aJ) != -1 : true;
        },
        aB = aE.length > 1 ? {} : [],
        aH = function (aK, aL) {
          if (aE.length > 1) {
            var aJ = aB[aK];
            if (aJ == null) {
              aJ = [];
              aB[aK] = aJ;
            }
            aJ.push(aL);
          } else {
            aB.push(aL);
          }
        };
      for (var aA in L) {
        if (ay(aE, aA)) {
          for (var az = 0; az < L[aA].length; az++) {
            var aD = L[aA][az];
            if (ay(ax, aD.sourceId) && ay(aC, aD.targetId)) {
              aH(aA, aD);
            }
          }
        }
      }
      return aB;
    };
    this.getAllConnections = function () {
      return L;
    };
    this.getDefaultScope = function () {
      return B;
    };
    this.getEndpoint = X;
    this.getEndpoints = function (ax) {
      return ah[aw(ax)];
    };
    this.getId = aw;
    this.appendElement = R;
    this.hide = function (ax, ay) {
      ao(ax, "none", ay);
    };
    this.init = function () {
      if (!J) {
        D.setRenderMode(D.Defaults.RenderMode);
        var ax = function (ay) {
          i.CurrentLibrary.bind(document, ay, function (aE) {
            if (!D.currentlyDragging && ap && aa == i.CANVAS) {
              for (var aD in L) {
                var aF = L[aD];
                for (var aB = 0; aB < aF.length; aB++) {
                  var aA = aF[aB].connector[ay](aE);
                  if (aA) {
                    return;
                  }
                }
              }
              for (var aC in ah) {
                var az = ah[aC];
                for (var aB = 0; aB < az.length; aB++) {
                  if (az[aB].endpoint[ay](aE)) {
                    return;
                  }
                }
              }
            }
          });
        };
        ax("click");
        ax("dblclick");
        ax("mousemove");
        ax("mousedown");
        ax("mouseup");
        J = true;
        D.fire("ready");
      }
    };
    this.jsPlumbUIComponent = t;
    this.EventGenerator = o;
    this.makeAnchor = function (aE, aB, aC, az, aA, ax) {
      if (arguments.length == 0) {
        return null;
      }
      var ay = {};
      if (arguments.length == 1) {
        var aF = arguments[0];
        if (aF.compute && aF.getOrientation) {
          return aF;
        } else {
          if (typeof aF == "string") {
            return D.Anchors[arguments[0]]();
          } else {
            if (aF.constructor == Array) {
              if (aF[0].constructor == Array || aF[0].constructor == String) {
                return new ab(aF);
              } else {
                return i.makeAnchor.apply(this, aF);
              }
            } else {
              if (typeof arguments[0] == "object") {
                i.extend(ay, aE);
              }
            }
          }
        }
      } else {
        ay = {
          x: aE,
          y: aB,
        };
        if (arguments.length >= 4) {
          ay.orientation = [arguments[2], arguments[3]];
        }
        if (arguments.length == 6) {
          ay.offsets = [arguments[4], arguments[5]];
        }
      }
      var aD = new ac(ay);
      aD.clone = function () {
        return new ac(ay);
      };
      return aD;
    };
    this.makeAnchors = function (ay) {
      var az = [];
      for (var ax = 0; ax < ay.length; ax++) {
        if (typeof ay[ax] == "string") {
          az.push(D.Anchors[ay[ax]]());
        } else {
          if (ay[ax].constructor == Array) {
            az.push(i.makeAnchor(ay[ax]));
          }
        }
      }
      return az;
    };
    this.makeDynamicAnchor = function (ax, ay) {
      return new ab(ax, ay);
    };
    var W = {};
    this.makeTarget = function (az, aA, aG) {
      var ay = i.extend({}, aG);
      i.extend(ay, aA);
      var aF = i.CurrentLibrary,
        aH = ay.scope || D.Defaults.Scope,
        aB = ay.deleteEndpointsOnDetach || false,
        ax = function (aM) {
          var aK = aw(aM);
          W[aK] = ay.endpoint;
          var aJ = i.extend({}, ay.dropOptions || {});
          var aI = function () {
            var aN = u(aF.getDragObject(arguments)),
              aU = c(aN, "dragId"),
              aP = c(aN, "originalScope");
            if (aP) {
              i.CurrentLibrary.setDragScope(aN, aP);
            }
            var aR = Z[aU],
              aQ = aR.endpoints[0],
              aT = ay.endpoint ? i.extend({}, ay.endpoint) : null,
              aO = i.addEndpoint(aM, aT);
            var aS = i.connect({
              source: aQ,
              target: aO,
              scope: aP,
            });
            if (aB) {
              aS.endpointToDeleteOnDetach = aO;
            }
          };
          var aL = aF.dragEvents.drop;
          aJ.scope = aJ.scope || aH;
          aJ[aL] = am(aJ[aL], aI);
          aF.initDroppable(aM, aJ);
        };
      az = w(az);
      var aD = [],
        aE = az.length && az.constructor != String ? az : [az];
      for (var aC = 0; aC < aE.length; aC++) {
        ax(u(aE[aC]));
      }
    };
    this.makeTargets = function (az, aA, ax) {
      for (var ay = 0; ay < az.length; ay++) {
        D.makeTarget(az[ay], aA, ax);
      }
    };
    (this.ready = function (ax) {
      D.bind("ready", ax);
    }),
      (this.repaint = function (ay) {
        var az = function (aA) {
          at(u(aA));
        };
        if (typeof ay == "object") {
          for (var ax = 0; ax < ay.length; ax++) {
            az(ay[ax]);
          }
        } else {
          az(ay);
        }
      });
    this.repaintEverything = function () {
      var ay = ar();
      for (var ax in ah) {
        at(u(ax), null, ay);
      }
    };
    this.removeAllEndpoints = function (az) {
      var ax = c(az, "id");
      var aA = ah[ax];
      for (var ay in aA) {
        D.deleteEndpoint(aA[ay]);
      }
      ah[ax] = [];
    };
    this.removeEveryEndpoint = this.deleteEveryEndpoint;
    this.removeEndpoint = function (ax, ay) {
      D.deleteEndpoint(ay);
    };
    this.reset = function () {
      this.deleteEveryEndpoint();
      this.clearListeners();
    };
    this.setAutomaticRepaint = function (ax) {
      y = ax;
    };
    this.setDefaultScope = function (ax) {
      B = ax;
    };
    this.setDraggable = v;
    this.setDraggableByDefault = function (ax) {
      Y = ax;
    };
    this.setDebugLog = function (ax) {
      F = ax;
    };
    this.setRepaintFunction = function (ax) {
      ak = ax;
    };
    this.setMouseEventsEnabled = function (ax) {
      ap = ax;
    };
    this.CANVAS = "canvas";
    this.SVG = "svg";
    this.VML = "vml";
    this.setRenderMode = function (ax) {
      if (ax) {
        ax = ax.toLowerCase();
      } else {
        return;
      }
      if (ax !== i.CANVAS && ax !== i.SVG && ax !== i.VML) {
        throw new Error("render mode must be one of jsPlumb.CANVAS, jsPlumb.SVG or jsPlumb.VML");
      }
      if (ax === i.CANVAS && r) {
        aa = i.CANVAS;
      } else {
        if (ax === i.SVG && d) {
          aa = i.SVG;
        } else {
          if (a) {
            aa = i.VML;
          }
        }
      }
      return aa;
    };
    this.getRenderMode = function () {
      return aa;
    };
    this.show = function (ax, ay) {
      ao(ax, "block", ay);
    };
    this.sizeCanvas = function (az, ax, aB, ay, aA) {
      if (az) {
        az.style.height = aA + "px";
        az.height = aA;
        az.style.width = ay + "px";
        az.width = ay;
        az.style.left = ax + "px";
        az.style.top = aB + "px";
      }
    };
    this.getTestHarness = function () {
      return {
        endpointsByElement: ah,
        endpointCount: function (ax) {
          var ay = ah[ax];
          return ay ? ay.length : 0;
        },
        connectionCount: function (ax) {
          ax = ax || B;
          var ay = L[ax];
          return ay ? ay.length : 0;
        },
        findIndex: l,
        getId: aw,
        makeAnchor: self.makeAnchor,
        makeDynamicAnchor: self.makeDynamicAnchor,
      };
    };
    this.toggle = x;
    this.toggleVisible = x;
    this.toggleDraggable = N;
    this.unload = function () {
      delete ah;
      delete T;
      delete V;
      delete P;
      delete Z;
      delete ag;
      delete af;
    };
    this.wrap = am;
    this.addListener = this.bind;
    var ac = function (aB) {
      var az = this;
      this.x = aB.x || 0;
      this.y = aB.y || 0;
      var ay = aB.orientation || [0, 0];
      var aA = null,
        ax = null;
      this.offsets = aB.offsets || [0, 0];
      az.timestamp = null;
      this.compute = function (aH) {
        var aG = aH.xy,
          aC = aH.wh,
          aE = aH.element,
          aF = aH.timestamp;
        if (aF && aF === az.timestamp) {
          return ax;
        }
        ax = [aG[0] + az.x * aC[0] + az.offsets[0], aG[1] + az.y * aC[1] + az.offsets[1]];
        if (aE.canvas && aE.canvas.offsetParent) {
          var aD =
            aE.canvas.offsetParent.tagName.toLowerCase() === "body"
              ? {
                  left: 0,
                  top: 0,
                }
              : n(aE.canvas.offsetParent);
          ax[0] = ax[0] - aD.left;
          ax[1] = ax[1] - aD.top;
        }
        az.timestamp = aF;
        return ax;
      };
      this.getOrientation = function () {
        return ay;
      };
      this.equals = function (aC) {
        if (!aC) {
          return false;
        }
        var aD = aC.getOrientation();
        var aE = this.getOrientation();
        return (
          this.x == aC.x &&
          this.y == aC.y &&
          this.offsets[0] == aC.offsets[0] &&
          this.offsets[1] == aC.offsets[1] &&
          aE[0] == aD[0] &&
          aE[1] == aD[1]
        );
      };
      this.getCurrentLocation = function () {
        return ax;
      };
    };
    var H = function (aD) {
      var aB = aD.reference;
      var aC = aD.referenceCanvas;
      var az = b(u(aC));
      var ay = 0,
        aE = 0;
      var ax = null;
      var aA = null;
      this.compute = function (aJ) {
        var aI = aJ.xy,
          aH = aJ.element;
        var aF = [aI[0] + az[0] / 2, aI[1] + az[1] / 2];
        if (aH.canvas && aH.canvas.offsetParent) {
          var aG =
            aH.canvas.offsetParent.tagName.toLowerCase() === "body"
              ? {
                  left: 0,
                  top: 0,
                }
              : n(aH.canvas.offsetParent);
          aF[0] = aF[0] - aG.left;
          aF[1] = aF[1] - aG.top;
        }
        aA = aF;
        return aF;
      };
      this.getOrientation = function () {
        if (ax) {
          return ax;
        } else {
          var aF = aB.getOrientation();
          return [Math.abs(aF[0]) * ay * -1, Math.abs(aF[1]) * aE * -1];
        }
      };
      this.over = function (aF) {
        ax = aF.getOrientation();
      };
      this.out = function () {
        ax = null;
      };
      this.getCurrentLocation = function () {
        return aA;
      };
    };
    var ab = function (az, ay) {
      this.isSelective = true;
      this.isDynamic = true;
      var aG = [],
        aE = function (aH) {
          return aH.constructor == ac ? aH : i.makeAnchor(aH);
        };
      for (var aD = 0; aD < az.length; aD++) {
        aG[aD] = aE(az[aD]);
      }
      this.addAnchor = function (aH) {
        aG.push(aE(aH));
      };
      this.getAnchors = function () {
        return aG;
      };
      this.locked = false;
      var aA = aG.length > 0 ? aG[0] : null,
        aC = aG.length > 0 ? 0 : -1,
        aF = this,
        aB = function (aJ, aH, aN, aM, aI) {
          var aL = aM[0] + aJ.x * aI[0],
            aK = aM[1] + aJ.y * aI[1];
          return Math.sqrt(Math.pow(aH - aL, 2) + Math.pow(aN - aK, 2));
        },
        ax =
          ay ||
          function (aR, aI, aJ, aK, aH) {
            var aM = aJ[0] + aK[0] / 2,
              aL = aJ[1] + aK[1] / 2;
            var aO = -1,
              aQ = Infinity;
            for (var aN = 0; aN < aH.length; aN++) {
              var aP = aB(aH[aN], aM, aL, aR, aI);
              if (aP < aQ) {
                aO = aN + 0;
                aQ = aP;
              }
            }
            return aH[aO];
          };
      this.compute = function (aL) {
        var aK = aL.xy,
          aH = aL.wh,
          aJ = aL.timestamp,
          aI = aL.txy,
          aN = aL.twh;
        if (aF.locked || aI == null || aN == null) {
          return aA.compute(aL);
        } else {
          aL.timestamp = null;
        }
        aA = ax(aK, aH, aI, aN, aG);
        var aM = aA.compute(aL);
        return aM;
      };
      this.getCurrentLocation = function () {
        var aH = aA != null ? aA.getCurrentLocation() : null;
        return aH;
      };
      this.getOrientation = function () {
        return aA != null ? aA.getOrientation() : [0, 0];
      };
      this.over = function (aH) {
        if (aA != null) {
          aA.over(aH);
        }
      };
      this.out = function () {
        if (aA != null) {
          aA.out();
        }
      };
    };
    var G = function (aR) {
      t.apply(this, arguments);
      var aG = this;
      var ay = true;
      this.isVisible = function () {
        return ay;
      };
      this.setVisible = function (aS) {
        ay = aS;
        if (aG.connector && aG.connector.canvas) {
          aG.connector.canvas.style.display = aS ? "block" : "none";
        }
      };
      var aJ = new String("_jsplumb_c_" + new Date().getTime());
      this.getId = function () {
        return aJ;
      };
      this.parent = aR.parent;
      this.source = u(aR.source);
      this.target = u(aR.target);
      if (aR.sourceEndpoint) {
        this.source = aR.sourceEndpoint.getElement();
      }
      if (aR.targetEndpoint) {
        this.target = aR.targetEndpoint.getElement();
      }
      this.sourceId = c(this.source, "id");
      this.targetId = c(this.target, "id");
      this.endpointsOnTop = aR.endpointsOnTop != null ? aR.endpointsOnTop : true;
      this.getAttachedElements = function () {
        return aG.endpoints;
      };
      this.savePosition = function () {
        srcWhenMouseDown = i.CurrentLibrary.getOffset(i.CurrentLibrary.getElementObject(aG.source));
        targetWhenMouseDown = i.CurrentLibrary.getOffset(i.CurrentLibrary.getElementObject(aG.target));
      };
      this.scope = aR.scope;
      this.endpoints = [];
      this.endpointStyles = [];
      var aP = function (aS) {
        if (aS) {
          return i.makeAnchor(aS);
        }
      };
      var aM = function (aS, aX, aT, aV, aU, aW) {
        if (aS) {
          aG.endpoints[aX] = aS;
          aS.addConnection(aG);
        } else {
          if (!aT.endpoints) {
            aT.endpoints = [null, null];
          }
          var a3 =
            aT.endpoints[aX] ||
            aT.endpoint ||
            D.Defaults.Endpoints[aX] ||
            i.Defaults.Endpoints[aX] ||
            D.Defaults.Endpoint ||
            i.Defaults.Endpoint;
          if (!aT.endpointStyles) {
            aT.endpointStyles = [null, null];
          }
          if (!aT.endpointHoverStyles) {
            aT.endpointHoverStyles = [null, null];
          }
          var a1 =
            aT.endpointStyles[aX] ||
            aT.endpointStyle ||
            D.Defaults.EndpointStyles[aX] ||
            i.Defaults.EndpointStyles[aX] ||
            D.Defaults.EndpointStyle ||
            i.Defaults.EndpointStyle;
          if (a1.fillStyle == null && aU != null) {
            a1.fillStyle = aU.strokeStyle;
          }
          if (a1.outlineColor == null && aU != null) {
            a1.outlineColor = aU.outlineColor;
          }
          if (a1.outlineWidth == null && aU != null) {
            a1.outlineWidth = aU.outlineWidth;
          }
          var a0 =
            aT.endpointHoverStyles[aX] ||
            aT.endpointHoverStyle ||
            D.Defaults.EndpointHoverStyles[aX] ||
            i.Defaults.EndpointHoverStyles[aX] ||
            D.Defaults.EndpointHoverStyle ||
            i.Defaults.EndpointHoverStyle;
          if (aW != null) {
            if (a0 == null) {
              a0 = {};
            }
            if (a0.fillStyle == null) {
              a0.fillStyle = aW.strokeStyle;
            }
          }
          var aZ = aT.anchors
              ? aT.anchors[aX]
              : aP(D.Defaults.Anchors[aX]) ||
                aP(i.Defaults.Anchors[aX]) ||
                aP(D.Defaults.Anchor) ||
                aP(i.Defaults.Anchor),
            a2 = aT.uuids ? aT.uuids[aX] : null,
            aY = an({
              paintStyle: a1,
              hoverPaintStyle: a0,
              endpoint: a3,
              connections: [aG],
              uuid: a2,
              anchor: aZ,
              source: aV,
              container: aT.container,
            });
          aG.endpoints[aX] = aY;
          if (aT.drawEndpoints === false) {
            aY.setVisible(false, true, true);
          }
          return aY;
        }
      };
      var aI = aM(aR.sourceEndpoint, 0, aR, aG.source, aR.paintStyle, aR.hoverPaintStyle);
      if (aI) {
        S(ah, this.sourceId, aI);
      }
      var aH = aM(aR.targetEndpoint, 1, aR, aG.target, aR.paintStyle, aR.hoverPaintStyle);
      if (aH) {
        S(ah, this.targetId, aH);
      }
      if (!this.scope) {
        this.scope = this.endpoints[0].scope;
      }
      this.setConnector = function (aS, aT) {
        if (aG.connector != null) {
          Q(aG.connector.getDisplayElements(), aG.parent);
        }
        var aU = {
          _jsPlumb: aG._jsPlumb,
          parent: aR.parent,
          cssClass: aR.cssClass,
          container: aR.container,
        };
        if (aS.constructor == String) {
          this.connector = new i.Connectors[aa][aS](aU);
        } else {
          if (aS.constructor == Array) {
            this.connector = new i.Connectors[aa][aS[0]](i.extend(aS[1], aU));
          }
        }
        this.canvas = this.connector.canvas;
        this.connector.bind("click", function (aV, aW) {
          _mouseWasDown = false;
          aG.fire("click", aG, aW);
        });
        this.connector.bind("dblclick", function (aV, aW) {
          _mouseWasDown = false;
          aG.fire("dblclick", aG, aW);
        });
        this.connector.bind("mouseenter", function (aV, aW) {
          if (!aG.isHover()) {
            if (p == null) {
              aG.setHover(true);
            }
            aG.fire("mouseenter", aG, aW);
          }
        });
        this.connector.bind("mouseexit", function (aV, aW) {
          if (aG.isHover()) {
            if (p == null) {
              aG.setHover(false);
            }
            aG.fire("mouseexit", aG, aW);
          }
        });
        this.connector.bind("mousedown", function (aV, aW) {
          _mouseDown = true;
          _mouseDownAt = i.CurrentLibrary.getPageXY(aW);
          aG.savePosition();
        });
        this.connector.bind("mouseup", function (aV, aW) {
          _mouseDown = false;
          if (aG.connector == p) {
            p = null;
          }
        });
        if (!aT) {
          aG.repaint();
        }
      };
      aG.setConnector(
        this.endpoints[0].connector ||
          this.endpoints[1].connector ||
          aR.connector ||
          D.Defaults.Connector ||
          i.Defaults.Connector,
        true
      );
      this.setPaintStyle(
        this.endpoints[0].connectorStyle ||
          this.endpoints[1].connectorStyle ||
          aR.paintStyle ||
          D.Defaults.PaintStyle ||
          i.Defaults.PaintStyle,
        true
      );
      this.setHoverPaintStyle(
        this.endpoints[0].connectorHoverStyle ||
          this.endpoints[1].connectorHoverStyle ||
          aR.hoverPaintStyle ||
          D.Defaults.HoverPaintStyle ||
          i.Defaults.HoverPaintStyle,
        true
      );
      this.paintStyleInUse = this.paintStyle;
      this.overlays = [];
      var az = aR.overlays || D.Defaults.Overlays;
      if (az) {
        for (var aO = 0; aO < az.length; aO++) {
          var aN = az[aO],
            aC = null;
          if (aN.constructor == Array) {
            var aA = aN[0];
            var aK = i.CurrentLibrary.extend(
              {
                connection: aG,
                _jsPlumb: D,
              },
              aN[1]
            );
            if (aN.length == 3) {
              i.CurrentLibrary.extend(aK, aN[2]);
            }
            aC = new i.Overlays[aa][aA](aK);
            if (aK.events) {
              for (var aF in aK.events) {
                aC.bind(aF, aK.events[aF]);
              }
            }
          } else {
            if (aN.constructor == String) {
              aC = new i.Overlays[aa][aN]({
                connection: aG,
                _jsPlumb: D,
              });
            } else {
              aC = aN;
            }
          }
          this.overlays.push(aC);
        }
      }
      var aQ = function (aU) {
        var aS = -1;
        for (var aT = 0; aT < aG.overlays.length; aT++) {
          if (aU === aG.overlays[aT].id) {
            aS = aT;
            break;
          }
        }
        return aS;
      };
      this.addOverlay = function (aS) {
        aG.overlays.push(aS);
      };
      this.getOverlay = function (aT) {
        var aS = aQ(aT);
        return aS >= 0 ? aG.overlays[aS] : null;
      };
      this.hideOverlay = function (aT) {
        var aS = aG.getOverlay(aT);
        if (aS) {
          aS.hide();
        }
      };
      this.showOverlay = function (aT) {
        var aS = aG.getOverlay(aT);
        if (aS) {
          aS.show();
        }
      };
      this.removeAllOverlays = function () {
        aG.overlays.splice(0, aG.overlays.length);
        aG.repaint();
      };
      this.removeOverlay = function (aT) {
        var aS = aQ(aT);
        if (aS != -1) {
          aG.overlays.splice(aS, 1);
        }
      };
      this.removeOverlays = function () {
        for (var aS = 0; aS < arguments.length; aS++) {
          aG.removeOverlay(arguments[aS]);
        }
      };
      this.labelStyle = aR.labelStyle || D.Defaults.LabelStyle || i.Defaults.LabelStyle;
      this.label = aR.label;
      if (this.label) {
        this.overlays.push(
          new i.Overlays[aa].Label({
            cssClass: aR.cssClass,
            labelStyle: this.labelStyle,
            label: this.label,
            connection: aG,
            _jsPlumb: D,
          })
        );
      }
      E({
        elId: this.sourceId,
      });
      E({
        elId: this.targetId,
      });
      this.setLabel = function (aS) {
        aG.label = aS;
        D.repaint(aG.source);
      };
      var aD = V[this.sourceId],
        aB = P[this.sourceId];
      var ax = V[this.targetId];
      var aE = P[this.targetId];
      var aL = this.endpoints[0].anchor.compute({
        xy: [aD.left, aD.top],
        wh: aB,
        element: this.endpoints[0],
        txy: [ax.left, ax.top],
        twh: aE,
        tElement: this.endpoints[1],
      });
      this.endpoints[0].paint({
        anchorLoc: aL,
      });
      aL = this.endpoints[1].anchor.compute({
        xy: [ax.left, ax.top],
        wh: aE,
        element: this.endpoints[1],
        txy: [aD.left, aD.top],
        twh: aB,
        tElement: this.endpoints[0],
      });
      this.endpoints[1].paint({
        anchorLoc: aL,
      });
      this.paint = function (aV) {
        aV = aV || {};
        var aW = aV.elId,
          a5 = aV.ui,
          a2 = aV.recalc,
          a4 = aV.timestamp,
          aT = false,
          a0 = aT ? this.sourceId : this.targetId,
          aU = aT ? this.targetId : this.sourceId,
          a3 = aT ? 0 : 1,
          a7 = aT ? 1 : 0;
        E({
          elId: aW,
          offset: a5,
          recalc: a2,
          timestamp: a4,
        });
        E({
          elId: a0,
          timestamp: a4,
        });
        var a1 = this.endpoints[a7].anchor.getCurrentLocation(),
          aY = this.endpoints[a3].anchor.getCurrentLocation();
        var a6 = 0;
        for (var aX = 0; aX < aG.overlays.length; aX++) {
          var aS = aG.overlays[aX];
          if (aS.isVisible()) {
            var a8 = aS.computeMaxSize(aG.connector);
            if (a8 > a6) {
              a6 = a8;
            }
          }
        }
        var aZ = this.connector.compute(
          a1,
          aY,
          this.endpoints[a7].anchor,
          this.endpoints[a3].anchor,
          aG.paintStyleInUse.lineWidth,
          a6
        );
        aG.connector.paint(aZ, aG.paintStyleInUse);
        for (var aX = 0; aX < aG.overlays.length; aX++) {
          var aS = aG.overlays[aX];
          if (aS.isVisible) {
            aG.overlayPlacements[aX] = aS.draw(aG.connector, aG.paintStyleInUse, aZ);
          }
        }
      };
      this.repaint = function () {
        this.paint({
          elId: this.sourceId,
          recalc: true,
        });
      };
      O(aG.source, aR.draggable, aR.dragOptions);
      O(aG.target, aR.draggable, aR.dragOptions);
      if (this.source.resize) {
        this.source.resize(function (aS) {
          i.repaint(aG.sourceId);
        });
      }
      aG.repaint();
    };
    var aq = function (aY) {
      i.jsPlumbUIComponent.apply(this, arguments);
      aY = aY || {};
      var aN = this;
      var az = true;
      this.isVisible = function () {
        return az;
      };
      this.setVisible = function (a0, a3, aZ) {
        az = a0;
        if (aN.canvas) {
          aN.canvas.style.display = a0 ? "block" : "none";
        }
        if (!a3) {
          for (var a2 = 0; a2 < aN.connections.length; a2++) {
            aN.connections[a2].setVisible(a0);
            if (!aZ) {
              var a1 = aN === aN.connections[a2].endpoints[0] ? 1 : 0;
              if (aN.connections[a2].endpoints[a1].connections.length == 1) {
                aN.connections[a2].endpoints[a1].setVisible(a0, true, true);
              }
            }
          }
        }
      };
      var aO = new String("_jsplumb_e_" + new Date().getTime());
      this.getId = function () {
        return aO;
      };
      if (aY.dynamicAnchors) {
        aN.anchor = new ab(i.makeAnchors(aY.dynamicAnchors));
      } else {
        aN.anchor = aY.anchor
          ? i.makeAnchor(aY.anchor)
          : aY.anchors
          ? i.makeAnchor(aY.anchors)
          : i.makeAnchor("TopCenter");
      }
      var aL = aY.endpoint || D.Defaults.Endpoint || i.Defaults.Endpoint || "Dot",
        aF = {
          _jsPlumb: aN._jsPlumb,
          parent: aY.parent,
          container: aY.container,
        };
      if (aL.constructor == String) {
        aL = new i.Endpoints[aa][aL](aF);
      } else {
        if (aL.constructor == Array) {
          aF = i.extend(aL[1], aF);
          aL = new i.Endpoints[aa][aL[0]](aF);
        } else {
          aL = aL.clone();
        }
      }
      this.clone = function () {
        var aZ = new Object();
        aL.constructor.apply(aZ, [aF]);
        return aZ;
      };
      aN.endpoint = aL;
      aN.type = aN.endpoint.type;
      this.endpoint.bind("click", function (aZ) {
        aN.fire("click", aN, aZ);
      });
      this.endpoint.bind("dblclick", function (aZ) {
        aN.fire("dblclick", aN, aZ);
      });
      this.endpoint.bind("mouseenter", function (aZ, a0) {
        if (!aN.isHover()) {
          aN.setHover(true);
          aN.fire("mouseenter", aN, a0);
        }
      });
      this.endpoint.bind("mouseexit", function (aZ, a0) {
        if (aN.isHover()) {
          aN.setHover(false);
          aN.fire("mouseexit", aN, a0);
        }
      });
      this.setPaintStyle(aY.paintStyle || aY.style || D.Defaults.EndpointStyle || i.Defaults.EndpointStyle, true);
      this.setHoverPaintStyle(
        aY.hoverPaintStyle || D.Defaults.EndpointHoverStyle || i.Defaults.EndpointHoverStyle,
        true
      );
      this.paintStyleInUse = this.paintStyle;
      this.connectorStyle = aY.connectorStyle;
      this.connectorHoverStyle = aY.connectorHoverStyle;
      this.connectorOverlays = aY.connectorOverlays;
      this.connector = aY.connector;
      this.parent = aY.parent;
      this.isSource = aY.isSource || false;
      this.isTarget = aY.isTarget || false;
      var aM = aY.source,
        aH = aY.uuid,
        aW = null,
        aB = null;
      if (aH) {
        T[aH] = aN;
      }
      var aE = c(aM, "id");
      this.elementId = aE;
      this.element = aM;
      var aT = aY.maxConnections || D.Defaults.MaxConnections;
      this.getAttachedElements = function () {
        return aN.connections;
      };
      this.canvas = this.endpoint.canvas;
      this.connections = aY.connections || [];
      this.scope = aY.scope || B;
      this.timestamp = null;
      var aJ = aY.reattach || false;
      var aI = aY.dragAllowedWhenFull || true;
      this.computeAnchor = function (aZ) {
        return aN.anchor.compute(aZ);
      };
      this.addConnection = function (aZ) {
        aN.connections.push(aZ);
      };
      this.detach = function (a0, a2) {
        var aZ = l(aN.connections, a0);
        if (aZ >= 0) {
          aN.connections.splice(aZ, 1);
          if (!a2) {
            var a1 = a0.endpoints[0] == aN ? a0.endpoints[1] : a0.endpoints[0];
            a1.detach(a0, true);
            if (a0.endpointToDeleteOnDetach && a0.endpointToDeleteOnDetach.connections.length == 0) {
              i.deleteEndpoint(a0.endpointToDeleteOnDetach);
            }
          }
          Q(a0.connector.getDisplayElements(), a0.parent);
          M(L, a0.scope, a0);
          if (!a2) {
            ad(a0);
          }
        }
      };
      this.detachAll = function () {
        while (aN.connections.length > 0) {
          aN.detach(aN.connections[0]);
        }
      };
      this.detachFrom = function (a0) {
        var a1 = [];
        for (var aZ = 0; aZ < aN.connections.length; aZ++) {
          if (aN.connections[aZ].endpoints[1] == a0 || aN.connections[aZ].endpoints[0] == a0) {
            a1.push(aN.connections[aZ]);
          }
        }
        for (var aZ = 0; aZ < a1.length; aZ++) {
          a1[aZ].setHover(false);
          aN.detach(a1[aZ]);
        }
      };
      this.detachFromConnection = function (a0) {
        var aZ = l(aN.connections, a0);
        if (aZ >= 0) {
          aN.connections.splice(aZ, 1);
        }
      };
      this.getElement = function () {
        return aM;
      };
      this.getUuid = function () {
        return aH;
      };
      this.makeInPlaceCopy = function () {
        return an({
          anchor: aN.anchor,
          source: aM,
          paintStyle: this.paintStyle,
          endpoint: aL,
        });
      };
      this.isConnectedTo = function (a1) {
        var a0 = false;
        if (a1) {
          for (var aZ = 0; aZ < aN.connections.length; aZ++) {
            if (aN.connections[aZ].endpoints[1] == a1) {
              a0 = true;
              break;
            }
          }
        }
        return a0;
      };
      this.isFloating = function () {
        return aW != null;
      };
      this.connectorSelector = function () {
        return aN.connections.length < aT || aT == -1 ? null : aN.connections[0];
      };
      this.isFull = function () {
        return !(aN.isFloating() || aT < 1 || aN.connections.length < aT);
      };
      this.setDragAllowedWhenFull = function (aZ) {
        aI = aZ;
      };
      this.setStyle = aN.setPaintStyle;
      this.equals = function (aZ) {
        return this.anchor.equals(aZ.anchor);
      };
      var aK = function (a0) {
        var aZ = 0;
        if (a0 != null) {
          for (var a1 = 0; a1 < aN.connections.length; a1++) {
            if (aN.connections[a1].sourceId == a0 || aN.connections[a1].targetId == a0) {
              aZ = a1;
              break;
            }
          }
        }
        return aN.connections[aZ];
      };
      this.paint = function (a2) {
        a2 = a2 || {};
        var a6 = a2.timestamp;
        if (!a6 || aN.timestamp !== a6) {
          var a5 = a2.anchorPoint,
            a1 = a2.canvas,
            a3 = a2.connectorPaintStyle;
          if (a5 == null) {
            var bc = a2.offset || V[aE];
            var aZ = a2.dimensions || P[aE];
            if (bc == null || aZ == null) {
              E({
                elId: aE,
                timestamp: a6,
              });
              bc = V[aE];
              aZ = P[aE];
            }
            var a0 = {
              xy: [bc.left, bc.top],
              wh: aZ,
              element: aN,
              timestamp: a6,
            };
            if (aN.anchor.isDynamic) {
              if (aN.connections.length > 0) {
                var a9 = aK(a2.elementWithPrecedence);
                var bb = a9.endpoints[0] == aN ? 1 : 0;
                var a4 = bb == 0 ? a9.sourceId : a9.targetId;
                var a8 = V[a4],
                  ba = P[a4];
                a0.txy = [a8.left, a8.top];
                a0.twh = ba;
                a0.tElement = a9.endpoints[bb];
              }
            }
            a5 = aN.anchor.compute(a0);
          }
          var a7 = aL.compute(a5, aN.anchor.getOrientation(), aN.paintStyleInUse, a3 || aN.paintStyleInUse);
          aL.paint(a7, aN.paintStyleInUse, aN.anchor);
          aN.timestamp = a6;
        }
      };
      this.repaint = this.paint;
      this.removeConnection = this.detach;
      if (aY.isSource && i.CurrentLibrary.isDragSupported(aM)) {
        var aS = null,
          aO = null,
          aR = null,
          ax = false,
          aA = null;
        var aC = function () {
          aR = aN.connectorSelector();
          if (aN.isFull() && !aI) {
            return false;
          }
          E({
            elId: aE,
          });
          aB = aN.makeInPlaceCopy();
          aB.paint();
          aS = document.createElement("div");
          aS.style.position = "absolute";
          var a6 = u(aS);
          R(aS, aN.parent);
          var a0 = aw(a6);
          var a7 = u(aB.canvas),
            a5 = i.CurrentLibrary.getOffset(a7),
            a2 =
              aB.canvas.offsetParent != null
                ? aB.canvas.offsetParent.tagName.toLowerCase() === "body"
                  ? {
                      left: 0,
                      top: 0,
                    }
                  : n(aB.canvas.offsetParent)
                : {
                    left: 0,
                    top: 0,
                  };
          i.CurrentLibrary.setOffset(aS, {
            left: a5.left - a2.left,
            top: a5.top - a2.top,
          });
          E({
            elId: a0,
          });
          e(u(aN.canvas), "dragId", a0);
          e(u(aN.canvas), "elId", aE);
          var a8 = new H({
            reference: aN.anchor,
            referenceCanvas: aN.canvas,
          });
          aW = an({
            paintStyle: aN.paintStyle,
            endpoint: aL,
            anchor: a8,
            source: a6,
          });
          if (aR == null) {
            aN.anchor.locked = true;
            aR = au({
              sourceEndpoint: aN,
              targetEndpoint: aW,
              source: u(aM),
              target: u(aS),
              anchors: [aN.anchor, a8],
              paintStyle: aY.connectorStyle,
              hoverPaintStyle: aY.connectorHoverStyle,
              connector: aY.connector,
              overlays: aY.connectorOverlays,
            });
            aR.connector.setHover(false);
          } else {
            ax = true;
            aR.connector.setHover(false);
            aD(u(aB.canvas));
            var a1 = aR.sourceId == aE ? 0 : 1;
            aR.floatingAnchorIndex = a1;
            aN.detachFromConnection(aR);
            var a4 = u(aN.canvas);
            var a3 = i.CurrentLibrary.getDragScope(a4);
            e(a4, "originalScope", a3);
            var aZ = i.CurrentLibrary.getDropScope(a4);
            i.CurrentLibrary.setDragScope(a4, aZ);
            if (a1 == 0) {
              aA = [aR.source, aR.sourceId, aV, a3];
              aR.source = u(aS);
              aR.sourceId = a0;
            } else {
              aA = [aR.target, aR.targetId, aV, a3];
              aR.target = u(aS);
              aR.targetId = a0;
            }
            aR.endpoints[a1 == 0 ? 1 : 0].anchor.locked = true;
            aR.suspendedEndpoint = aR.endpoints[a1];
            aR.endpoints[a1] = aW;
          }
          Z[a0] = aR;
          aW.addConnection(aR);
          S(ah, a0, aW);
          D.currentlyDragging = true;
        };
        var ay = i.CurrentLibrary,
          aU = aY.dragOptions || {},
          aP = i.extend({}, ay.defaultDragOptions),
          aQ = ay.dragEvents.start,
          aX = ay.dragEvents.stop,
          aG = ay.dragEvents.drag;
        aU = i.extend(aP, aU);
        aU.scope = aU.scope || aN.scope;
        aU[aQ] = am(aU[aQ], aC);
        aU[aG] = am(aU[aG], function () {
          var aZ = i.CurrentLibrary.getUIPosition(arguments);
          i.CurrentLibrary.setOffset(aS, aZ);
          at(u(aS), aZ);
        });
        aU[aX] = am(aU[aX], function () {
          M(ah, aO, aW);
          Q([aS, aW.canvas], aM);
          ae(aB.canvas, aM);
          var aZ = aR.floatingAnchorIndex == null ? 1 : aR.floatingAnchorIndex;
          aR.endpoints[aZ == 0 ? 1 : 0].anchor.locked = false;
          if (aR.endpoints[aZ] == aW) {
            if (ax && aR.suspendedEndpoint) {
              if (aZ == 0) {
                aR.source = aA[0];
                aR.sourceId = aA[1];
              } else {
                aR.target = aA[0];
                aR.targetId = aA[1];
              }
              i.CurrentLibrary.setDragScope(aA[2], aA[3]);
              aR.endpoints[aZ] = aR.suspendedEndpoint;
              if (aJ) {
                aR.floatingAnchorIndex = null;
                aR.suspendedEndpoint.addConnection(aR);
                i.repaint(aA[1]);
              } else {
                aR.endpoints[aZ == 0 ? 1 : 0].detach(aR);
              }
            } else {
              Q(aR.connector.getDisplayElements(), aN.parent);
              aN.detachFromConnection(aR);
            }
          }
          aN.anchor.locked = false;
          aN.paint();
          aR.setHover(false);
          aR.repaint();
          aR = null;
          delete aB;
          delete ah[aW.elementId];
          aW = null;
          delete aW;
          D.currentlyDragging = false;
        });
        var aV = u(aN.canvas);
        i.CurrentLibrary.initDraggable(aV, aU);
      }
      var aD = function (a2) {
        if (aY.isTarget && i.CurrentLibrary.isDropSupported(aM)) {
          var aZ = aY.dropOptions || D.Defaults.DropOptions || i.Defaults.DropOptions;
          aZ = i.extend({}, aZ);
          aZ.scope = aZ.scope || aN.scope;
          var a5 = null;
          var a3 = i.CurrentLibrary.dragEvents.drop;
          var a4 = i.CurrentLibrary.dragEvents.over;
          var a0 = i.CurrentLibrary.dragEvents.out;
          var a1 = function () {
            var be = u(i.CurrentLibrary.getDragObject(arguments));
            var a6 = c(be, "dragId");
            var a8 = c(be, "elId");
            var bd = c(be, "originalScope");
            if (bd) {
              i.CurrentLibrary.setDragScope(be, bd);
            }
            var ba = Z[a6];
            var bb = ba.floatingAnchorIndex == null ? 1 : ba.floatingAnchorIndex,
              bc = bb == 0 ? 1 : 0;
            if (!aN.isFull() && !(bb == 0 && !aN.isSource) && !(bb == 1 && !aN.isTarget)) {
              if (bb == 0) {
                ba.source = aM;
                ba.sourceId = aE;
              } else {
                ba.target = aM;
                ba.targetId = aE;
              }
              ba.endpoints[bb].detachFromConnection(ba);
              if (ba.suspendedEndpoint) {
                ba.suspendedEndpoint.detachFromConnection(ba);
              }
              ba.endpoints[bb] = aN;
              aN.addConnection(ba);
              if (!ba.suspendedEndpoint) {
                S(L, ba.scope, ba);
                O(aM, aY.draggable, {});
              } else {
                var a9 = ba.suspendedEndpoint.getElement(),
                  a7 = ba.suspendedEndpoint.elementId;
                D.fire("jsPlumbConnectionDetached", {
                  source: bb == 0 ? a9 : ba.source,
                  target: bb == 1 ? a9 : ba.target,
                  sourceId: bb == 0 ? a7 : ba.sourceId,
                  targetId: bb == 1 ? a7 : ba.targetId,
                  sourceEndpoint: bb == 0 ? ba.suspendedEndpoint : ba.endpoints[0],
                  targetEndpoint: bb == 1 ? ba.suspendedEndpoint : ba.endpoints[1],
                  connection: ba,
                });
              }
              i.repaint(a8);
              D.fire("jsPlumbConnection", {
                source: ba.source,
                target: ba.target,
                sourceId: ba.sourceId,
                targetId: ba.targetId,
                sourceEndpoint: ba.endpoints[0],
                targetEndpoint: ba.endpoints[1],
                connection: ba,
              });
            }
            D.currentlyDragging = false;
            delete Z[a6];
          };
          aZ[a3] = am(aZ[a3], a1);
          aZ[a4] = am(aZ[a4], function () {
            var a7 = i.CurrentLibrary.getDragObject(arguments);
            var a9 = c(u(a7), "dragId");
            var a8 = Z[a9];
            if (a8 != null) {
              var a6 = a8.floatingAnchorIndex == null ? 1 : a8.floatingAnchorIndex;
              a8.endpoints[a6].anchor.over(aN.anchor);
            }
          });
          aZ[a0] = am(aZ[a0], function () {
            var a7 = i.CurrentLibrary.getDragObject(arguments),
              a9 = c(u(a7), "dragId"),
              a8 = Z[a9];
            if (a8 != null) {
              var a6 = a8.floatingAnchorIndex == null ? 1 : a8.floatingAnchorIndex;
              a8.endpoints[a6].anchor.out();
            }
          });
          i.CurrentLibrary.initDroppable(a2, aZ);
        }
      };
      aD(u(aN.canvas));
      return aN;
    };
  };
  var i = (window.jsPlumb = new q());
  i.getInstance = function (w) {
    var v = new q(w);
    v.init();
    return v;
  };
  var m = function (v, A, z, w) {
    return function () {
      return i.makeAnchor(v, A, z, w);
    };
  };
  i.Anchors.TopCenter = m(0.5, 0, 0, -1);
  i.Anchors.BottomCenter = m(0.5, 1, 0, 1);
  i.Anchors.LeftMiddle = m(0, 0.5, -1, 0);
  i.Anchors.RightMiddle = m(1, 0.5, 1, 0);
  i.Anchors.Center = m(0.5, 0.5, 0, 0);
  i.Anchors.TopRight = m(1, 0, 0, -1);
  i.Anchors.BottomRight = m(1, 1, 0, 1);
  i.Anchors.TopLeft = m(0, 0, 0, -1);
  i.Anchors.BottomLeft = m(0, 1, 0, 1);
  i.Defaults.DynamicAnchors = function () {
    return i.makeAnchors(["TopCenter", "RightMiddle", "BottomCenter", "LeftMiddle"]);
  };
  i.Anchors.AutoDefault = function () {
    return i.makeDynamicAnchor(i.Defaults.DynamicAnchors());
  };
})();
(function () {
  jsPlumb.DOMElementComponent = function (b) {
    jsPlumb.jsPlumbUIComponent.apply(this, arguments);
    this.mousemove = this.dblclick = this.click = this.mousedown = this.mouseup = function (c) {};
  };
  jsPlumb.Connectors.Straight = function () {
    this.type = "Straight";
    var o = this;
    var h = null;
    var d, i, m, l, k, e, n, g, f, c, b;
    this.compute = function (s, G, C, p, z, r) {
      var F = Math.abs(s[0] - G[0]);
      var v = Math.abs(s[1] - G[1]);
      var A = false,
        t = false;
      var u = 0.45 * F,
        q = 0.45 * v;
      F *= 1.9;
      v *= 1.9;
      var D = Math.min(s[0], G[0]) - u;
      var B = Math.min(s[1], G[1]) - q;
      var E = Math.max(2 * z, r);
      if (F < E) {
        F = E;
        D = s[0] + (G[0] - s[0]) / 2 - E / 2;
        u = (F - Math.abs(s[0] - G[0])) / 2;
      }
      if (v < E) {
        v = E;
        B = s[1] + (G[1] - s[1]) / 2 - E / 2;
        q = (v - Math.abs(s[1] - G[1])) / 2;
      }
      g = s[0] < G[0] ? u : F - u;
      f = s[1] < G[1] ? q : v - q;
      c = s[0] < G[0] ? F - u : u;
      b = s[1] < G[1] ? v - q : q;
      h = [D, B, F, v, g, f, c, b];
      (l = c - g), (k = b - f);
      (d = k / l), (i = -1 / d);
      m = -1 * (d * g - f);
      e = Math.atan(d);
      n = Math.atan(i);
      return h;
    };
    this.pointOnPath = function (p) {
      var q = g + p * l;
      var r = d == Infinity || d == -Infinity ? f + p * (b - f) : d * q + m;
      return {
        x: q,
        y: r,
      };
    };
    this.gradientAtPoint = function (p) {
      return d;
    };
    this.pointAlongPathFrom = function (r, v) {
      var t = o.pointOnPath(r);
      var s = v > 0 ? 1 : -1;
      var u = Math.abs(v * Math.sin(e));
      if (f > b) {
        u = u * -1;
      }
      var q = Math.abs(v * Math.cos(e));
      if (g > c) {
        q = q * -1;
      }
      return {
        x: t.x + s * q,
        y: t.y + s * u,
      };
    };
    this.perpendicularToPathAt = function (t, u, z) {
      var v = o.pointAlongPathFrom(t, z);
      var s = o.gradientAtPoint(v.location);
      var r = Math.atan(-1 / s);
      var w = (u / 2) * Math.sin(r);
      var q = (u / 2) * Math.cos(r);
      return [
        {
          x: v.x + q,
          y: v.y + w,
        },
        {
          x: v.x - q,
          y: v.y - w,
        },
      ];
    };
  };
  jsPlumb.Connectors.Bezier = function (f) {
    var p = this;
    f = f || {};
    this.majorAnchor = f.curviness || 150;
    this.minorAnchor = 10;
    var i = null;
    this.type = "Bezier";
    this._findControlPoint = function (z, q, u, x, r) {
      var w = x.getOrientation(),
        y = r.getOrientation();
      var t = w[0] != y[0] || w[1] == y[1];
      var s = [];
      var A = p.majorAnchor,
        v = p.minorAnchor;
      if (!t) {
        if (w[0] == 0) {
          s.push(q[0] < u[0] ? z[0] + v : z[0] - v);
        } else {
          s.push(z[0] - A * w[0]);
        }
        if (w[1] == 0) {
          s.push(q[1] < u[1] ? z[1] + v : z[1] - v);
        } else {
          s.push(z[1] + A * y[1]);
        }
      } else {
        if (y[0] == 0) {
          s.push(u[0] < q[0] ? z[0] + v : z[0] - v);
        } else {
          s.push(z[0] + A * y[0]);
        }
        if (y[1] == 0) {
          s.push(u[1] < q[1] ? z[1] + v : z[1] - v);
        } else {
          s.push(z[1] + A * w[1]);
        }
      }
      return s;
    };
    var o, n, k, c, b, k, g, e, d, m, h;
    this.compute = function (K, t, I, r, q, E) {
      q = q || 0;
      m = Math.abs(K[0] - t[0]) + q;
      h = Math.abs(K[1] - t[1]) + q;
      e = Math.min(K[0], t[0]) - q / 2;
      d = Math.min(K[1], t[1]) - q / 2;
      k = K[0] < t[0] ? m - q / 2 : q / 2;
      g = K[1] < t[1] ? h - q / 2 : q / 2;
      c = K[0] < t[0] ? q / 2 : m - q / 2;
      b = K[1] < t[1] ? q / 2 : h - q / 2;
      o = p._findControlPoint([k, g], K, t, I, r);
      n = p._findControlPoint([c, b], t, K, r, I);
      var D = Math.min(k, c);
      var C = Math.min(o[0], n[0]);
      var y = Math.min(D, C);
      var J = Math.max(k, c);
      var G = Math.max(o[0], n[0]);
      var v = Math.max(J, G);
      if (v > m) {
        m = v;
      }
      if (y < 0) {
        e += y;
        var z = Math.abs(y);
        m += z;
        o[0] += z;
        k += z;
        c += z;
        n[0] += z;
      }
      var H = Math.min(g, b);
      var F = Math.min(o[1], n[1]);
      var u = Math.min(H, F);
      var A = Math.max(g, b);
      var x = Math.max(o[1], n[1]);
      var s = Math.max(A, x);
      if (s > h) {
        h = s;
      }
      if (u < 0) {
        d += u;
        var w = Math.abs(u);
        h += w;
        o[1] += w;
        g += w;
        b += w;
        n[1] += w;
      }
      if (E && m < E) {
        var B = (E - m) / 2;
        m = E;
        e -= B;
        k = k + B;
        c = c + B;
        o[0] = o[0] + B;
        n[0] = n[0] + B;
      }
      if (E && h < E) {
        var B = (E - h) / 2;
        h = E;
        d -= B;
        g = g + B;
        b = b + B;
        o[1] = o[1] + B;
        n[1] = n[1] + B;
      }
      i = [e, d, m, h, k, g, c, b, o[0], o[1], n[0], n[1]];
      return i;
    };
    var l = function () {
      return [
        {
          x: k,
          y: g,
        },
        {
          x: o[0],
          y: o[1],
        },
        {
          x: n[0],
          y: n[1],
        },
        {
          x: c,
          y: b,
        },
      ];
    };
    this.pointOnPath = function (q) {
      return jsBezier.pointOnCurve(l(), q);
    };
    this.gradientAtPoint = function (q) {
      return jsBezier.gradientAtPoint(l(), q);
    };
    this.pointAlongPathFrom = function (q, r) {
      return jsBezier.pointAlongCurveFrom(l(), q, r);
    };
    this.perpendicularToPathAt = function (q, r, s) {
      return jsBezier.perpendicularToCurveAt(l(), q, r, s);
    };
  };
  jsPlumb.Connectors.Flowchart = function (g) {
    this.type = "Flowchart";
    g = g || {};
    var o = this,
      c = g.stub || g.minStubLength || 30,
      k = [],
      i = [],
      m = [],
      h = [],
      b = [],
      n = [],
      e,
      d,
      q = function (u, t, B, A) {
        var y = 0;
        for (var s = 0; s < k.length; s++) {
          var z = s == 0 ? u : k[s][2],
            x = s == 0 ? t : k[s][3],
            w = k[s][0],
            v = k[s][1];
          i[s] = z == w ? Infinity : 0;
          h[s] = Math.abs(z == w ? v - x : w - z);
          y += h[s];
        }
        var r = 0;
        for (var s = 0; s < k.length; s++) {
          b[s] = h[s] / y;
          m[s] = [r, (r += h[s] / y)];
        }
      },
      p = function () {
        n.push(k.length);
        for (var r = 0; r < k.length; r++) {
          n.push(k[r][0]);
          n.push(k[r][1]);
        }
      },
      f = function (s, A, z, w, t, r) {
        var v = k.length == 0 ? z : k[k.length - 1][0];
        var u = k.length == 0 ? w : k[k.length - 1][1];
        k.push([s, A, v, u]);
      },
      l = function (t) {
        var r = m.length - 1,
          s = 0;
        for (var u = 0; u < m.length; u++) {
          if (m[u][1] >= t) {
            r = u;
            s = (t - m[u][0]) / b[u];
            break;
          }
        }
        return {
          segment: k[r],
          proportion: s,
          index: r,
        };
      };
    this.compute = function (R, z, Q, s, r, I) {
      k = [];
      i = [];
      b = [];
      h = [];
      segmentProportionals = [];
      e = z[0] < R[0];
      d = z[1] < R[1];
      var A = r || 1,
        v = A / 2 + c * 2,
        t = A / 2 + c * 2,
        N = Q.orientation || Q.getOrientation(),
        u = s.orientation || s.getOrientation(),
        G = e ? z[0] : R[0],
        F = d ? z[1] : R[1],
        H = Math.abs(z[0] - R[0]) + 2 * v,
        M = Math.abs(z[1] - R[1]) + 2 * t;
      if (H < I) {
        v += (I - H) / 2;
        H = I;
      }
      if (M < I) {
        t += (I - M) / 2;
        M = I;
      }
      var K = e ? H - v : v,
        J = d ? M - t : t,
        T = e ? v : H - v,
        S = d ? t : M - t,
        E = K + N[0] * c,
        D = J + N[1] * c,
        C = T + u[0] * c,
        B = S + u[1] * c,
        O = E + (C - E) / 2,
        L = D + (B - D) / 2;
      G -= v;
      F -= t;
      (n = [G, F, H, M, K, J, T, S]), (extraPoints = []);
      f(E, D, K, J, T, S);
      if (N[0] == 0) {
        var P = D < B;
        if (P) {
          f(E, L, K, J, T, S);
          f(O, L, K, J, T, S);
          f(C, L, K, J, T, S);
        } else {
          f(O, D, K, J, T, S);
          f(O, B, K, J, T, S);
        }
      } else {
        var P = E < C;
        if (P) {
          f(O, D, K, J, T, S);
          f(O, L, K, J, T, S);
          f(O, B, K, J, T, S);
        } else {
          f(E, L, K, J, T, S);
          f(C, L, K, J, T, S);
        }
      }
      f(C, B, K, J, T, S);
      f(T, S, K, J, T, S);
      p();
      q(K, J, T, S);
      return n;
    };
    this.pointOnPath = function (r) {
      return o.pointAlongPathFrom(r, 0);
    };
    this.gradientAtPoint = function (r) {
      return i[l(r)["index"]];
    };
    this.pointAlongPathFrom = function (v, z) {
      var w = l(v),
        u = w.segment,
        y = w.proportion,
        t = h[w.index],
        r = i[w.index];
      var x = {
        x: r == Infinity ? u[2] : u[2] > u[0] ? u[0] + (1 - y) * t - z : u[2] + y * t + z,
        y: r == 0 ? u[3] : u[3] > u[1] ? u[1] + (1 - y) * t - z : u[3] + y * t + z,
        segmentInfo: w,
      };
      return x;
    };
    this.perpendicularToPathAt = function (u, v, A) {
      var w = o.pointAlongPathFrom(u, A);
      var t = i[w.segmentInfo.index];
      var s = Math.atan(-1 / t);
      var z = (v / 2) * Math.sin(s);
      var r = (v / 2) * Math.cos(s);
      return [
        {
          x: w.x + r,
          y: w.y + z,
        },
        {
          x: w.x - r,
          y: w.y - z,
        },
      ];
    };
  };
  jsPlumb.Endpoints.Dot = function (c) {
    this.type = "Dot";
    var b = this;
    c = c || {};
    this.radius = c.radius || 10;
    this.defaultOffset = 0.5 * this.radius;
    this.defaultInnerRadius = this.radius / 3;
    this.compute = function (h, e, k, g) {
      var f = k.radius || b.radius;
      var d = h[0] - f;
      var i = h[1] - f;
      return [d, i, f * 2, f * 2, f];
    };
  };
  jsPlumb.Endpoints.Rectangle = function (c) {
    this.type = "Rectangle";
    var b = this;
    c = c || {};
    this.width = c.width || 20;
    this.height = c.height || 20;
    this.compute = function (i, f, l, h) {
      var g = l.width || b.width;
      var e = l.height || b.height;
      var d = i[0] - g / 2;
      var k = i[1] - e / 2;
      return [d, k, g, e];
    };
  };
  jsPlumb.Endpoints.Image = function (e) {
    this.type = "Image";
    jsPlumb.DOMElementComponent.apply(this, arguments);
    var b = this,
      d = false;
    this.img = new Image();
    b.ready = false;
    this.img.onload = function () {
      b.ready = true;
    };
    this.img.src = e.src || e.url;
    this.compute = function (h, f, i, g) {
      b.anchorPoint = h;
      if (b.ready) {
        return [h[0] - b.img.width / 2, h[1] - b.img.height / 2, b.img.width, b.img.height];
      } else {
        return [0, 0, 0, 0];
      }
    };
    (b.canvas = document.createElement("img")), (d = false);
    b.canvas.style.margin = 0;
    b.canvas.style.padding = 0;
    b.canvas.style.outline = 0;
    b.canvas.style.position = "absolute";
    b.canvas.className = jsPlumb.endpointClass;
    jsPlumb.appendElement(b.canvas, e.parent);
    b.attachListeners(b.canvas, b);
    var c = function (l, k, h) {
      if (!d) {
        b.canvas.setAttribute("src", b.img.src);
        d = true;
      }
      var i = b.img.width,
        g = b.img.height,
        f = b.anchorPoint[0] - i / 2,
        m = b.anchorPoint[1] - g / 2;
      jsPlumb.sizeCanvas(b.canvas, f, m, i, g);
    };
    this.paint = function (h, g, f) {
      if (b.ready) {
        c(h, g, f);
      } else {
        window.setTimeout(function () {
          b.paint(h, g, f);
        }, 200);
      }
    };
  };
  jsPlumb.Endpoints.Blank = function (c) {
    var b = this;
    this.type = "Blank";
    jsPlumb.DOMElementComponent.apply(this, arguments);
    this.compute = function () {
      return [0, 0, 10, 0];
    };
    b.canvas = document.createElement("div");
    b.canvas.style.display = "block";
    b.canvas.style.width = "1px";
    b.canvas.style.height = "1px";
    b.canvas.style.background = "transparent";
    b.canvas.style.position = "absolute";
    jsPlumb.appendElement(b.canvas, c.parent);
    this.paint = function () {};
  };
  jsPlumb.Endpoints.Triangle = function (b) {
    this.type = "Triangle";
    b = b || {};
    b.width = b.width || 55;
    param.height = b.height || 55;
    this.width = b.width;
    this.height = b.height;
    this.compute = function (h, e, k, g) {
      var f = k.width || self.width;
      var d = k.height || self.height;
      var c = h[0] - f / 2;
      var i = h[1] - d / 2;
      return [c, i, f, d];
    };
  };
  var a = function () {
    var c = true,
      b = this;
    this.setVisible = function (d) {
      c = d;
      b.connection.repaint();
    };
    this.isVisible = function () {
      return c;
    };
    this.hide = function () {
      b.setVisible(false);
    };
    this.show = function () {
      b.setVisible(true);
    };
  };
  jsPlumb.Overlays.Arrow = function (g) {
    this.type = "Arrow";
    a.apply(this);
    g = g || {};
    var c = this;
    this.length = g.length || 20;
    this.width = g.width || 20;
    this.id = g.id;
    this.connection = g.connection;
    var f = (g.direction || 1) < 0 ? -1 : 1;
    var d = g.paintStyle || {
      lineWidth: 1,
    };
    this.loc = g.location == null ? 0.5 : g.location;
    var b = g.foldback || 0.623;
    var e = function (h, k) {
      if (b == 0.5) {
        return h.pointOnPath(k);
      } else {
        var i = 0.5 - b;
        return h.pointAlongPathFrom(k, f * c.length * i);
      }
    };
    this.computeMaxSize = function () {
      return c.width * 1.5;
    };
    this.draw = function (l, r, x) {
      var z = l.pointAlongPathFrom(c.loc, f * (c.length / 2));
      var u = l.pointAlongPathFrom(c.loc, -1 * f * (c.length / 2)),
        C = u.x,
        B = u.y;
      var s = l.perpendicularToPathAt(c.loc, c.width, -1 * f * (c.length / 2));
      var k = e(l, c.loc);
      if (c.loc == 1) {
        var i = l.pointOnPath(c.loc);
        var w = (i.x - z.x) * f,
          v = (i.y - z.y) * f;
        k.x += w;
        k.y += v;
        u.x += w;
        u.y += v;
        s[0].x += w;
        s[0].y += v;
        s[1].x += w;
        s[1].y += v;
        z.x += w;
        z.y += v;
      }
      if (c.loc == 0) {
        var i = l.pointOnPath(c.loc);
        var t =
          b > 1
            ? k
            : {
                x: s[0].x + (s[1].x - s[0].x) / 2,
                y: s[0].y + (s[1].y - s[0].y) / 2,
              };
        var w = (i.x - t.x) * f,
          v = (i.y - t.y) * f;
        k.x += w;
        k.y += v;
        u.x += w;
        u.y += v;
        s[0].x += w;
        s[0].y += v;
        s[1].x += w;
        s[1].y += v;
        z.x += w;
        z.y += v;
      }
      var p = Math.min(z.x, s[0].x, s[1].x);
      var o = Math.max(z.x, s[0].x, s[1].x);
      var n = Math.min(z.y, s[0].y, s[1].y);
      var m = Math.max(z.y, s[0].y, s[1].y);
      var A = {
          hxy: z,
          tail: s,
          cxy: k,
        },
        y = d.strokeStyle || r.strokeStyle,
        q = d.fillStyle || r.strokeStyle,
        h = d.lineWidth || r.lineWidth;
      c.paint(l, A, h, y, q, x);
      return [p, o, n, m];
    };
  };
  jsPlumb.Overlays.PlainArrow = function (c) {
    c = c || {};
    var b = jsPlumb.extend(c, {
      foldback: 1,
    });
    jsPlumb.Overlays.Arrow.call(this, b);
    this.type = "PlainArrow";
  };
  jsPlumb.Overlays.Diamond = function (d) {
    d = d || {};
    var b = d.length || 40;
    var c = jsPlumb.extend(d, {
      length: b / 2,
      foldback: 2,
    });
    jsPlumb.Overlays.Arrow.call(this, c);
    this.type = "Diamond";
  };
  jsPlumb.Overlays.Label = function (e) {
    this.type = "Label";
    jsPlumb.DOMElementComponent.apply(this, arguments);
    a.apply(this);
    this.labelStyle = e.labelStyle || jsPlumb.Defaults.LabelStyle;
    this.labelStyle.font = this.labelStyle.font || "12px sans-serif";
    this.label = e.label || "banana";
    this.connection = e.connection;
    this.id = e.id;
    var l = this;
    var i = null,
      f = null,
      d = null,
      c = null;
    this.location = e.location || 0.5;
    this.cachedDimensions = null;
    var k = false,
      d = null,
      b = document.createElement("div");
    b.style.position = "absolute";
    b.style.font = l.labelStyle.font;
    b.style.color = l.labelStyle.color || "black";
    if (l.labelStyle.fillStyle) {
      b.style.background = l.labelStyle.fillStyle;
    }
    if (l.labelStyle.borderWidth > 0) {
      var h = l.labelStyle.borderStyle ? l.labelStyle.borderStyle : "black";
      b.style.border = l.labelStyle.borderWidth + "px solid " + h;
    }
    if (l.labelStyle.padding) {
      b.style.padding = l.labelStyle.padding;
    }
    var g =
      e._jsPlumb.overlayClass + " " + (l.labelStyle.cssClass ? l.labelStyle.cssClass : e.cssClass ? e.cssClass : "");
    b.className = g;
    jsPlumb.appendElement(b, e.connection.parent);
    jsPlumb.getId(b);
    l.attachListeners(b, l);
    var m = l.setVisible;
    l.setVisible = function (n) {
      m(n);
      b.style.display = n ? "block" : "none";
    };
    this.paint = function (n, p, o) {
      if (!k) {
        n.appendDisplayElement(b);
        l.attachListeners(b, n);
        k = true;
      }
      b.style.left = o[0] + p.minx + "px";
      b.style.top = o[1] + p.miny + "px";
    };
    this.getTextDimensions = function (n) {
      d = typeof l.label == "function" ? l.label(l) : l.label;
      b.innerHTML = d.replace(/\r\n/g, "<br/>");
      var p = jsPlumb.CurrentLibrary.getElementObject(b),
        o = jsPlumb.CurrentLibrary.getSize(p);
      return {
        width: o[0],
        height: o[1],
      };
    };
    this.computeMaxSize = function (n) {
      var o = l.getTextDimensions(n);
      return o.width ? Math.max(o.width, o.height) * 1.5 : 0;
    };
    this.draw = function (p, r, q) {
      var t = l.getTextDimensions(p);
      if (t.width != null) {
        var s = p.pointOnPath(l.location);
        var o = s.x - t.width / 2;
        var n = s.y - t.height / 2;
        l.paint(
          p,
          {
            minx: o,
            miny: n,
            td: t,
            cxy: s,
          },
          q
        );
        return [o, o + t.width, n, n + t.height];
      } else {
        return [0, 0, 0, 0];
      }
    };
  };
})();
(function () {
  var h = {
    "stroke-linejoin": "joinstyle",
    joinstyle: "joinstyle",
    endcap: "endcap",
    miterlimit: "miterlimit",
  };
  if (document.createStyleSheet) {
    document.createStyleSheet().addRule(".jsplumb_vml", "behavior:url(#default#VML);position:absolute;");
    document.createStyleSheet().addRule("jsplumb\\:textbox", "behavior:url(#default#VML);position:absolute;");
    document.createStyleSheet().addRule("jsplumb\\:oval", "behavior:url(#default#VML);position:absolute;");
    document.createStyleSheet().addRule("jsplumb\\:rect", "behavior:url(#default#VML);position:absolute;");
    document.createStyleSheet().addRule("jsplumb\\:stroke", "behavior:url(#default#VML);position:absolute;");
    document.createStyleSheet().addRule("jsplumb\\:shape", "behavior:url(#default#VML);position:absolute;");
    document.namespaces.add("jsplumb", "urn:schemas-microsoft-com:vml");
  }
  var c = 1000,
    d = function (p, q) {
      for (var n in q) {
        p[n] = q[n];
      }
    },
    m = function (n, q, r) {
      r = r || {};
      var p = document.createElement("jsplumb:" + n);
      p.className = (r["class"] ? r["class"] + " " : "") + "jsplumb_vml";
      l(p, q);
      d(p, r);
      return p;
    },
    l = function (p, n) {
      p.style.left = n[0] + "px";
      p.style.top = n[1] + "px";
      p.style.width = n[2] + "px";
      p.style.height = n[3] + "px";
      p.style.position = "absolute";
    },
    g = function (n) {
      return Math.floor(n * c);
    },
    a = function (p, n) {
      var v = p,
        u = function (o) {
          return o.length == 1 ? "0" + o : o;
        },
        q = function (o) {
          return u(Number(o).toString(16));
        },
        r = /(rgb[a]?\()(.*)(\))/;
      if (p.match(r)) {
        var t = p.match(r)[2].split(",");
        v = "#" + q(t[0]) + q(t[1]) + q(t[2]);
        if (!n && t.length == 4) {
          v = v + q(t[3]);
        }
      }
      return v;
    },
    f = function (s, r, p) {
      var u = {};
      if (r.strokeStyle) {
        u.stroked = "true";
        u.strokecolor = a(r.strokeStyle, true);
        u.strokeweight = r.lineWidth + "px";
      } else {
        u.stroked = "false";
      }
      if (r.fillStyle) {
        u.filled = "true";
        u.fillcolor = a(r.fillStyle, true);
      } else {
        u.filled = "false";
      }
      if (r.dashstyle) {
        if (p.strokeNode == null) {
          p.strokeNode = m("stroke", [0, 0, 0, 0], {
            dashstyle: r.dashstyle,
          });
          s.appendChild(p.strokeNode);
        } else {
          p.strokeNode.dashstyle = r.dashstyle;
        }
      } else {
        if (r["stroke-dasharray"] && r.lineWidth) {
          var o = r["stroke-dasharray"].indexOf(",") == -1 ? " " : ",",
            t = r["stroke-dasharray"].split(o),
            n = "";
          for (var q = 0; q < t.length; q++) {
            n += Math.floor(t[q] / r.lineWidth) + o;
          }
          if (p.strokeNode == null) {
            p.strokeNode = m("stroke", [0, 0, 0, 0], {
              dashstyle: n,
            });
            s.appendChild(p.strokeNode);
          } else {
            p.strokeNode.dashstyle = n;
          }
        }
      }
      d(s, u);
    },
    i = function () {
      jsPlumb.jsPlumbUIComponent.apply(this, arguments);
    },
    e = function (p) {
      var n = this;
      n.strokeNode = null;
      n.canvas = null;
      i.apply(this, arguments);
      clazz = n._jsPlumb.connectorClass + (p.cssClass ? " " + p.cssClass : "");
      this.paint = function (w, s, q) {
        if (s != null) {
          var v = n.getPath(w),
            u = {
              path: v,
            };
          if (s.outlineColor) {
            var t = s.outlineWidth || 1,
              r = s.lineWidth + 2 * t;
            outlineStyle = {
              strokeStyle: a(s.outlineColor),
              lineWidth: r,
            };
            if (n.bgCanvas == null) {
              u["class"] = clazz;
              u.coordsize = w[2] * c + "," + w[3] * c;
              n.bgCanvas = m("shape", w, u);
              jsPlumb.appendElement(n.bgCanvas, p.parent);
              l(n.bgCanvas, w);
              o.push(n.bgCanvas);
            } else {
              u.coordsize = w[2] * c + "," + w[3] * c;
              l(n.bgCanvas, w);
              d(n.bgCanvas, u);
            }
            f(n.bgCanvas, outlineStyle, n);
          }
          if (n.canvas == null) {
            u["class"] = clazz;
            u.coordsize = w[2] * c + "," + w[3] * c;
            n.canvas = m("shape", w, u);
            jsPlumb.appendElement(n.canvas, p.parent);
            o.push(n.canvas);
            n.attachListeners(n.canvas, n);
          } else {
            u.coordsize = w[2] * c + "," + w[3] * c;
            l(n.canvas, w);
            d(n.canvas, u);
          }
          f(n.canvas, s, n);
        }
      };
      var o = [n.canvas];
      this.getDisplayElements = function () {
        return o;
      };
      this.appendDisplayElement = function (q) {
        n.canvas.parentNode.appendChild(q);
        o.push(q);
      };
    },
    k = function (p) {
      i.apply(this, arguments);
      var n = null,
        o = this;
      o.canvas = document.createElement("div");
      o.canvas.style.position = "absolute";
      jsPlumb.appendElement(o.canvas, p.parent);
      this.paint = function (t, r, q) {
        var s = {};
        jsPlumb.sizeCanvas(o.canvas, t[0], t[1], t[2], t[3]);
        if (n == null) {
          s["class"] = jsPlumb.endpointClass;
          n = o.getVml([0, 0, t[2], t[3]], s, q);
          o.canvas.appendChild(n);
          o.attachListeners(n, o);
        } else {
          l(n, [0, 0, t[2], t[3]]);
          d(n, s);
        }
        f(n, r);
      };
    };
  jsPlumb.Connectors.vml.Bezier = function () {
    jsPlumb.Connectors.Bezier.apply(this, arguments);
    e.apply(this, arguments);
    this.getPath = function (n) {
      return (
        "m" +
        g(n[4]) +
        "," +
        g(n[5]) +
        " c" +
        g(n[8]) +
        "," +
        g(n[9]) +
        "," +
        g(n[10]) +
        "," +
        g(n[11]) +
        "," +
        g(n[6]) +
        "," +
        g(n[7]) +
        " e"
      );
    };
  };
  jsPlumb.Connectors.vml.Straight = function () {
    jsPlumb.Connectors.Straight.apply(this, arguments);
    e.apply(this, arguments);
    this.getPath = function (n) {
      return "m" + g(n[4]) + "," + g(n[5]) + " l" + g(n[6]) + "," + g(n[7]) + " e";
    };
  };
  jsPlumb.Connectors.vml.Flowchart = function () {
    jsPlumb.Connectors.Flowchart.apply(this, arguments);
    e.apply(this, arguments);
    this.getPath = function (o) {
      var q = "m " + g(o[4]) + "," + g(o[5]) + " l";
      for (var n = 0; n < o[8]; n++) {
        q = q + " " + g(o[9 + n * 2]) + "," + g(o[10 + n * 2]);
      }
      q = q + " " + g(o[6]) + "," + g(o[7]) + " e";
      return q;
    };
  };
  jsPlumb.Endpoints.vml.Dot = function () {
    jsPlumb.Endpoints.Dot.apply(this, arguments);
    k.apply(this, arguments);
    this.getVml = function (o, p, n) {
      return m("oval", o, p);
    };
  };
  jsPlumb.Endpoints.vml.Rectangle = function () {
    jsPlumb.Endpoints.Rectangle.apply(this, arguments);
    k.apply(this, arguments);
    this.getVml = function (o, p, n) {
      return m("rect", o, p);
    };
  };
  jsPlumb.Endpoints.vml.Image = jsPlumb.Endpoints.Image;
  jsPlumb.Endpoints.vml.Blank = jsPlumb.Endpoints.Blank;
  jsPlumb.Overlays.vml.Label = jsPlumb.Overlays.Label;
  var b = function (s, q) {
    s.apply(this, q);
    i.apply(this, arguments);
    var o = this,
      p = null,
      r = null;
    var n = function (u, t) {
      return (
        "m " +
        g(u.hxy.x) +
        "," +
        g(u.hxy.y) +
        " l " +
        g(u.tail[0].x) +
        "," +
        g(u.tail[0].y) +
        " " +
        g(u.cxy.x) +
        "," +
        g(u.cxy.y) +
        " " +
        g(u.tail[1].x) +
        "," +
        g(u.tail[1].y) +
        " x e"
      );
    };
    this.paint = function (x, C, B, D, H, G) {
      var u = {};
      if (D) {
        u.stroked = "true";
        u.strokecolor = a(D, true);
      }
      if (B) {
        u.strokeweight = B + "px";
      }
      if (H) {
        u.filled = "true";
        u.fillcolor = H;
      }
      var t = Math.min(C.hxy.x, C.tail[0].x, C.tail[1].x, C.cxy.x),
        F = Math.min(C.hxy.y, C.tail[0].y, C.tail[1].y, C.cxy.y),
        y = Math.max(C.hxy.x, C.tail[0].x, C.tail[1].x, C.cxy.x),
        v = Math.max(C.hxy.y, C.tail[0].y, C.tail[1].y, C.cxy.y),
        E = Math.abs(y - t),
        A = Math.abs(v - F),
        z = [t, F, E, A];
      u.path = n(C, G);
      u.coordsize = G[2] * c + "," + G[3] * c;
      z[0] = G[0];
      z[1] = G[1];
      z[2] = G[2];
      z[3] = G[3];
      if (p == null) {
        p = m("shape", z, u);
        x.appendDisplayElement(p);
        o.attachListeners(p, x);
      } else {
        l(p, z);
        d(p, u);
      }
    };
  };
  jsPlumb.Overlays.vml.Arrow = function () {
    b.apply(this, [jsPlumb.Overlays.Arrow, arguments]);
  };
  jsPlumb.Overlays.vml.PlainArrow = function () {
    b.apply(this, [jsPlumb.Overlays.PlainArrow, arguments]);
  };
  jsPlumb.Overlays.vml.Diamond = function () {
    b.apply(this, [jsPlumb.Overlays.Diamond, arguments]);
  };
})();
(function () {
  var i = {
    "stroke-linejoin": "stroke-linejoin",
    joinstyle: "stroke-linejoin",
    "stroke-dashoffset": "stroke-dashoffset",
  };
  var h = {
      svg: "http://www.w3.org/2000/svg",
      xhtml: "http://www.w3.org/1999/xhtml",
    },
    d = function (r, p) {
      for (var q in p) {
        r.setAttribute(q, "" + p[q]);
      }
    },
    o = function (q, p) {
      var r = document.createElementNS(h.svg, q);
      p = p || {};
      p.version = "1.1";
      p.xmnls = h.xhtml;
      d(r, p);
      return r;
    },
    m = function (p) {
      return "position:absolute;left:" + p[0] + "px;top:" + p[1] + "px";
    },
    a = function (q, p) {
      var w = q,
        v = function (s) {
          return s.length == 1 ? "0" + s : s;
        },
        r = function (s) {
          return v(Number(s).toString(16));
        },
        t = /(rgb[a]?\()(.*)(\))/;
      if (q.match(t)) {
        var u = q.match(t)[2].split(",");
        w = "#" + r(u[0]) + r(u[1]) + r(u[2]);
        if (!p && u.length == 4) {
          w = w + r(u[3]);
        }
      }
      return w;
    },
    b = function (q) {
      for (var p = 0; p < q.childNodes.length; p++) {
        if (q.childNodes[p].tagName == "linearGradient" || q.childNodes[p].tagName == "radialGradient") {
          q.removeChild(q.childNodes[p]);
        }
      }
    },
    l = function (z, v, r, p) {
      var t = "jsplumb_gradient_" + new Date().getTime();
      b(z);
      if (!r.gradient.offset) {
        var x = o("linearGradient", {
          id: t,
        });
        z.appendChild(x);
      } else {
        var x = o("radialGradient", {
          id: t,
        });
        z.appendChild(x);
      }
      for (var w = 0; w < r.gradient.stops.length; w++) {
        var u = w;
        if (p.length == 8) {
          u = p[4] < p[6] ? w : r.gradient.stops.length - 1 - w;
        } else {
          u = p[4] < p[6] ? r.gradient.stops.length - 1 - w : w;
        }
        var y = a(r.gradient.stops[u][1], true);
        var A = o("stop", {
          offset: Math.floor(r.gradient.stops[w][0] * 100) + "%",
          "stop-color": y,
        });
        x.appendChild(A);
      }
      var q = r.strokeStyle ? "stroke" : "fill";
      v.setAttribute("style", q + ":url(#" + t + ")");
    },
    f = function (t, v, s, u) {
      if (s.gradient) {
        l(t, v, s, u);
      } else {
        b(t);
        v.setAttribute("style", "");
      }
      v.setAttribute("fill", s.fillStyle ? a(s.fillStyle, true) : "none");
      v.setAttribute("stroke", s.strokeStyle ? a(s.strokeStyle, true) : "none");
      if (s.lineWidth) {
        v.setAttribute("stroke-width", s.lineWidth);
      }
      if (s["stroke-dasharray"]) {
        v.setAttribute("stroke-dasharray", s["stroke-dasharray"]);
      }
      if (s.dashstyle && s.lineWidth) {
        var q = s.dashstyle.indexOf(",") == -1 ? " " : ",",
          w = s.dashstyle.split(q),
          p = "";
        w.forEach(function (x) {
          p += Math.floor(x * s.lineWidth) + q;
        });
        v.setAttribute("stroke-dasharray", p);
      }
      for (var r in i) {
        if (s[r]) {
          v.setAttribute(i[r], s[r]);
        }
      }
    },
    g = function (s) {
      var p = /([0-9].)(p[xt])\s(.*)/;
      var q = s.match(p);
      return {
        size: q[1] + q[2],
        font: q[3],
      };
    };
  var k = function (p, t, u) {
    var q = this;
    u = u || "all";
    jsPlumb.jsPlumbUIComponent.apply(this, t);
    (q.canvas = null), (q.path = null), (q.svg = null);
    this.setHover = function () {};
    q.canvas = document.createElement("div");
    q.canvas.style.position = "absolute";
    jsPlumb.sizeCanvas(q.canvas, 0, 0, 1, 1);
    var s = p + " " + (t[0].cssClass || "");
    q.canvas.className = s;
    q.svg = o("svg", {
      style: "",
      width: 0,
      height: 0,
      "pointer-events": u,
    });
    jsPlumb.appendElement(q.canvas, t[0]["parent"]);
    q.canvas.appendChild(q.svg);
    var r = [q.canvas];
    this.getDisplayElements = function () {
      return r;
    };
    this.appendDisplayElement = function (v) {
      r.push(v);
    };
    this.paint = function (x, w, v) {
      if (w != null) {
        jsPlumb.sizeCanvas(q.canvas, x[0], x[1], x[2], x[3]);
        d(q.svg, {
          style: m([0, 0, x[2], x[3]]),
          width: x[2],
          height: x[3],
        });
        q._paint.apply(this, arguments);
      }
    };
  };
  var e = function (q) {
    var p = this;
    k.apply(this, [q._jsPlumb.connectorClass, arguments, "none"]);
    this._paint = function (x, t) {
      var w = p.getPath(x),
        r = {
          d: w,
        },
        v = null;
      r["pointer-events"] = "all";
      if (t.outlineColor) {
        var u = t.outlineWidth || 1,
          s = t.lineWidth + 2 * u;
        v = {
          strokeStyle: a(t.outlineColor),
          lineWidth: s,
        };
        if (p.bgPath == null) {
          p.bgPath = o("path", r);
          p.svg.appendChild(p.bgPath);
          p.attachListeners(p.bgPath, p);
        } else {
          d(p.bgPath, r);
        }
        f(p.svg, p.bgPath, v, x);
      }
      if (p.path == null) {
        p.path = o("path", r);
        p.svg.appendChild(p.path);
        p.attachListeners(p.path, p);
      } else {
        d(p.path, r);
      }
      f(p.svg, p.path, t, x);
    };
  };
  jsPlumb.Connectors.svg.Bezier = function (p) {
    jsPlumb.Connectors.Bezier.apply(this, arguments);
    e.apply(this, arguments);
    this.getPath = function (q) {
      return "M " + q[4] + " " + q[5] + " C " + q[8] + " " + q[9] + " " + q[10] + " " + q[11] + " " + q[6] + " " + q[7];
    };
  };
  jsPlumb.Connectors.svg.Straight = function (p) {
    jsPlumb.Connectors.Straight.apply(this, arguments);
    e.apply(this, arguments);
    this.getPath = function (q) {
      return "M " + q[4] + " " + q[5] + " L " + q[6] + " " + q[7];
    };
  };
  jsPlumb.Connectors.svg.Flowchart = function () {
    var p = this;
    jsPlumb.Connectors.Flowchart.apply(this, arguments);
    e.apply(this, arguments);
    this.getPath = function (r) {
      var s = "M " + r[4] + "," + r[5];
      for (var q = 0; q < r[8]; q++) {
        s = s + " L " + r[9 + q * 2] + " " + r[10 + q * 2];
      }
      s = s + " " + r[6] + "," + r[7];
      return s;
    };
  };
  var n = function (q) {
    var p = this;
    k.apply(this, [q._jsPlumb.endpointClass, arguments, "all"]);
    this._paint = function (u, t) {
      var r = jsPlumb.extend({}, t);
      if (r.outlineColor) {
        r.strokeWidth = r.outlineWidth;
        r.strokeStyle = a(r.outlineColor, true);
      }
      if (p.node == null) {
        p.node = p.makeNode(u, r);
        p.svg.appendChild(p.node);
        p.attachListeners(p.node, p);
      }
      f(p.svg, p.node, r, u);
      m(p.node, u);
    };
  };
  jsPlumb.Endpoints.svg.Dot = function () {
    jsPlumb.Endpoints.Dot.apply(this, arguments);
    n.apply(this, arguments);
    this.makeNode = function (q, p) {
      return o("circle", {
        cx: q[2] / 2,
        cy: q[3] / 2,
        r: q[2] / 2,
      });
    };
  };
  jsPlumb.Endpoints.svg.Rectangle = function () {
    jsPlumb.Endpoints.Rectangle.apply(this, arguments);
    n.apply(this, arguments);
    this.makeNode = function (q, p) {
      return o("rect", {
        width: q[2],
        height: q[3],
      });
    };
  };
  jsPlumb.Endpoints.svg.Image = jsPlumb.Endpoints.Image;
  jsPlumb.Endpoints.svg.Blank = jsPlumb.Endpoints.Blank;
  jsPlumb.Overlays.svg.Label = jsPlumb.Overlays.Label;
  var c = function (t, r) {
    t.apply(this, r);
    jsPlumb.jsPlumbUIComponent.apply(this, r);
    var p = this,
      s = null;
    this.paint = function (v, x, u, y, w) {
      if (s == null) {
        s = o("path");
        v.svg.appendChild(s);
        p.attachListeners(s, v);
        p.attachListeners(s, p);
      }
      d(s, {
        d: q(x),
        stroke: y ? y : null,
        fill: w ? w : null,
      });
    };
    var q = function (u) {
      return (
        "M" +
        u.hxy.x +
        "," +
        u.hxy.y +
        " L" +
        u.tail[0].x +
        "," +
        u.tail[0].y +
        " L" +
        u.cxy.x +
        "," +
        u.cxy.y +
        " L" +
        u.tail[1].x +
        "," +
        u.tail[1].y +
        " L" +
        u.hxy.x +
        "," +
        u.hxy.y
      );
    };
  };
  jsPlumb.Overlays.svg.Arrow = function () {
    c.apply(this, [jsPlumb.Overlays.Arrow, arguments]);
  };
  jsPlumb.Overlays.svg.PlainArrow = function () {
    c.apply(this, [jsPlumb.Overlays.PlainArrow, arguments]);
  };
  jsPlumb.Overlays.svg.Diamond = function () {
    c.apply(this, [jsPlumb.Overlays.Diamond, arguments]);
  };
})();
(function () {
  var o = null,
    b = function (t, u) {
      return jsPlumb.CurrentLibrary.getAttribute(s(t), u);
    },
    c = function (u, v, t) {
      jsPlumb.CurrentLibrary.setAttribute(s(u), v, t);
    },
    q = function (u, t) {
      jsPlumb.CurrentLibrary.addClass(s(u), t);
    },
    f = function (u, t) {
      return jsPlumb.CurrentLibrary.hasClass(s(u), t);
    },
    h = function (u, t) {
      jsPlumb.CurrentLibrary.removeClass(s(u), t);
    },
    s = function (t) {
      return jsPlumb.CurrentLibrary.getElementObject(t);
    },
    m = function (t) {
      return jsPlumb.CurrentLibrary.getOffset(s(t));
    },
    a = function (t) {
      return jsPlumb.CurrentLibrary.getSize(s(t));
    },
    e = function (t) {
      return jsPlumb.CurrentLibrary.getPageXY(t);
    },
    i = function (t) {
      return jsPlumb.CurrentLibrary.getClientXY(t);
    },
    g = function (t, u) {
      jsPlumb.CurrentLibrary.setOffset(t, u);
    };
  var n = function () {
    var v = this;
    v.overlayPlacements = [];
    jsPlumb.jsPlumbUIComponent.apply(this, arguments);
    jsPlumb.EventGenerator.apply(this, arguments);
    this._over = function (C) {
      var E = m(s(v.canvas)),
        G = e(C),
        z = G[0] - E.left,
        F = G[1] - E.top;
      if (z > 0 && F > 0 && z < v.canvas.width && F < v.canvas.height) {
        for (var A = 0; A < v.overlayPlacements.length; A++) {
          var B = v.overlayPlacements[A];
          if (B && B[0] <= z && B[1] >= z && B[2] <= F && B[3] >= F) {
            return true;
          }
        }
        var D = v.canvas.getContext("2d").getImageData(parseInt(z), parseInt(F), 1, 1);
        return D.data[0] != 0 || D.data[1] != 0 || D.data[2] != 0 || D.data[3] != 0;
      }
      return false;
    };
    var u = false;
    var t = false,
      y = null,
      x = false;
    var w = function (A, z) {
      return A != null && f(A, z);
    };
    this.mousemove = function (C) {
      var E = e(C),
        B = i(C),
        A = document.elementFromPoint(B[0], B[1]),
        D = w(A, "_jsPlumb_overlay");
      var z = o == null && (w(A, "_jsPlumb_endpoint") || w(A, "_jsPlumb_connector"));
      if (!u && z && v._over(C)) {
        u = true;
        v.fire("mouseenter", v, C);
        return true;
      } else {
        if (u && (!v._over(C) || !z) && !D) {
          u = false;
          v.fire("mouseexit", v, C);
        }
      }
      v.fire("mousemove", v, C);
    };
    this.click = function (z) {
      if (u && v._over(z) && !x) {
        v.fire("click", v, z);
      }
      x = false;
    };
    this.dblclick = function (z) {
      if (u && v._over(z) && !x) {
        v.fire("dblclick", v, z);
      }
      x = false;
    };
    this.mousedown = function (z) {
      if (v._over(z) && !t) {
        t = true;
        y = m(s(v.canvas));
        v.fire("mousedown", v, z);
      }
    };
    this.mouseup = function (z) {
      t = false;
      v.fire("mouseup", v, z);
    };
  };
  var p = function (u) {
    var t = document.createElement("canvas");
    jsPlumb.appendElement(t, u.parent);
    t.style.position = "absolute";
    if (u["class"]) {
      t.className = u["class"];
    }
    u._jsPlumb.getId(t, u.uuid);
    return t;
  };
  var d = (jsPlumb.CanvasConnector = function (x) {
    n.apply(this, arguments);
    var t = function (B, z) {
      u.ctx.save();
      jsPlumb.extend(u.ctx, z);
      if (z.gradient) {
        var A = u.createGradient(B, u.ctx);
        for (var y = 0; y < z.gradient.stops.length; y++) {
          A.addColorStop(z.gradient.stops[y][0], z.gradient.stops[y][1]);
        }
        u.ctx.strokeStyle = A;
      }
      u._paint(B);
      u.ctx.restore();
    };
    var u = this,
      w = u._jsPlumb.connectorClass + " " + (x.cssClass || "");
    u.canvas = p({
      class: w,
      _jsPlumb: u._jsPlumb,
      parent: x.parent,
    });
    u.ctx = u.canvas.getContext("2d");
    var v = [u.canvas];
    this.getDisplayElements = function () {
      return v;
    };
    this.appendDisplayElement = function (y) {
      v.push(y);
    };
    u.paint = function (C, z) {
      if (z != null) {
        jsPlumb.sizeCanvas(u.canvas, C[0], C[1], C[2], C[3]);
        if (z.outlineColor != null) {
          var B = z.outlineWidth || 1,
            y = z.lineWidth + 2 * B;
          var A = {
            strokeStyle: z.outlineColor,
            lineWidth: y,
          };
          t(C, A);
        }
        t(C, z);
      }
    };
  });
  var l = function (v) {
    var t = this;
    n.apply(this, arguments);
    var u = t._jsPlumb.endpointClass + " " + (v.cssClass || "");
    t.canvas = p({
      class: u,
      _jsPlumb: t._jsPlumb,
      parent: v.parent,
    });
    t.ctx = t.canvas.getContext("2d");
    this.paint = function (B, y, w) {
      jsPlumb.sizeCanvas(t.canvas, B[0], B[1], B[2], B[3]);
      if (y.outlineColor != null) {
        var A = y.outlineWidth || 1,
          x = y.lineWidth + 2 * A;
        var z = {
          strokeStyle: y.outlineColor,
          lineWidth: x,
        };
      }
      t._paint.apply(this, arguments);
    };
  };
  jsPlumb.Endpoints.canvas.Dot = function (w) {
    var v = this;
    jsPlumb.Endpoints.Dot.apply(this, arguments);
    l.apply(this, arguments);
    var u = function (x) {
      try {
        return parseInt(x);
      } catch (y) {
        if (x.substring(x.length - 1) == "%") {
          return parseInt(x.substring(0, x - 1));
        }
      }
    };
    var t = function (z) {
      var x = v.defaultOffset,
        y = v.defaultInnerRadius;
      z.offset && (x = u(z.offset));
      z.innerRadius && (y = u(z.innerRadius));
      return [x, y];
    };
    this._paint = function (F, y, C) {
      if (y != null) {
        var G = v.canvas.getContext("2d"),
          z = C.getOrientation();
        jsPlumb.extend(G, y);
        if (y.gradient) {
          var A = t(y.gradient),
            D = z[1] == 1 ? A[0] * -1 : A[0],
            x = z[0] == 1 ? A[0] * -1 : A[0],
            E = G.createRadialGradient(F[4], F[4], F[4], F[4] + x, F[4] + D, A[1]);
          for (var B = 0; B < y.gradient.stops.length; B++) {
            E.addColorStop(y.gradient.stops[B][0], y.gradient.stops[B][1]);
          }
          G.fillStyle = E;
        }
        G.beginPath();
        G.arc(F[4], F[4], F[4], 0, Math.PI * 2, true);
        G.closePath();
        if (y.fillStyle || y.gradient) {
          G.fill();
        }
        if (y.strokeStyle) {
          G.stroke();
        }
      }
    };
  };
  jsPlumb.Endpoints.canvas.Rectangle = function (u) {
    var t = this;
    jsPlumb.Endpoints.Rectangle.apply(this, arguments);
    l.apply(this, arguments);
    this._paint = function (C, w, A) {
      var F = t.canvas.getContext("2d"),
        y = A.getOrientation();
      jsPlumb.extend(F, w);
      if (w.gradient) {
        var E = y[1] == 1 ? C[3] : y[1] == 0 ? C[3] / 2 : 0;
        var D = y[1] == -1 ? C[3] : y[1] == 0 ? C[3] / 2 : 0;
        var x = y[0] == 1 ? C[2] : y[0] == 0 ? C[2] / 2 : 0;
        var v = y[0] == -1 ? C[2] : y[0] == 0 ? C[2] / 2 : 0;
        var B = F.createLinearGradient(x, E, v, D);
        for (var z = 0; z < w.gradient.stops.length; z++) {
          B.addColorStop(w.gradient.stops[z][0], w.gradient.stops[z][1]);
        }
        F.fillStyle = B;
      }
      F.beginPath();
      F.rect(0, 0, C[2], C[3]);
      F.closePath();
      if (w.fillStyle || w.gradient) {
        F.fill();
      }
      if (w.strokeStyle) {
        F.stroke();
      }
    };
  };
  jsPlumb.Endpoints.canvas.Triangle = function (u) {
    var t = this;
    jsPlumb.Endpoints.Triangle.apply(this, arguments);
    l.apply(this, arguments);
    this._paint = function (D, v, B) {
      var w = D[2],
        G = D[3],
        F = D[0],
        E = D[1];
      var H = t.canvas.getContext("2d");
      var C = 0,
        A = 0,
        z = 0;
      if (orientation[0] == 1) {
        C = w;
        A = G;
        z = 180;
      }
      if (orientation[1] == -1) {
        C = w;
        z = 90;
      }
      if (orientation[1] == 1) {
        A = G;
        z = -90;
      }
      H.fillStyle = v.fillStyle;
      H.translate(C, A);
      H.rotate((z * Math.PI) / 180);
      H.beginPath();
      H.moveTo(0, 0);
      H.lineTo(w / 2, G / 2);
      H.lineTo(0, G);
      H.closePath();
      if (v.fillStyle || v.gradient) {
        H.fill();
      }
      if (v.strokeStyle) {
        H.stroke();
      }
    };
  };
  jsPlumb.Endpoints.canvas.Image = jsPlumb.Endpoints.Image;
  jsPlumb.Endpoints.canvas.Blank = jsPlumb.Endpoints.Blank;
  jsPlumb.Connectors.canvas.Bezier = function () {
    var t = this;
    jsPlumb.Connectors.Bezier.apply(this, arguments);
    d.apply(this, arguments);
    this._paint = function (u) {
      t.ctx.beginPath();
      t.ctx.moveTo(u[4], u[5]);
      t.ctx.bezierCurveTo(u[8], u[9], u[10], u[11], u[6], u[7]);
      t.ctx.stroke();
    };
    this.createGradient = function (w, u, v) {
      return t.ctx.createLinearGradient(w[6], w[7], w[4], w[5]);
    };
  };
  jsPlumb.Connectors.canvas.Straight = function () {
    var t = this;
    jsPlumb.Connectors.Straight.apply(this, arguments);
    d.apply(this, arguments);
    this._paint = function (u) {
      t.ctx.beginPath();
      t.ctx.moveTo(u[4], u[5]);
      t.ctx.lineTo(u[6], u[7]);
      t.ctx.stroke();
    };
    this.createGradient = function (v, u) {
      return u.createLinearGradient(v[4], v[5], v[6], v[7]);
    };
  };
  jsPlumb.Connectors.canvas.Flowchart = function () {
    var t = this;
    jsPlumb.Connectors.Flowchart.apply(this, arguments);
    d.apply(this, arguments);
    this._paint = function (v) {
      t.ctx.beginPath();
      t.ctx.moveTo(v[4], v[5]);
      for (var u = 0; u < v[8]; u++) {
        t.ctx.lineTo(v[9 + u * 2], v[10 + u * 2]);
      }
      t.ctx.lineTo(v[6], v[7]);
      t.ctx.stroke();
    };
    this.createGradient = function (v, u) {
      return u.createLinearGradient(v[4], v[5], v[6], v[7]);
    };
  };
  jsPlumb.Overlays.canvas.Label = jsPlumb.Overlays.Label;
  var k = function () {
    jsPlumb.jsPlumbUIComponent.apply(this, arguments);
  };
  var r = function (u, t) {
    u.apply(this, t);
    k.apply(this, arguments);
    this.paint = function (x, z, v, A, y) {
      var w = x.ctx;
      w.lineWidth = v;
      w.beginPath();
      w.moveTo(z.hxy.x, z.hxy.y);
      w.lineTo(z.tail[0].x, z.tail[0].y);
      w.lineTo(z.cxy.x, z.cxy.y);
      w.lineTo(z.tail[1].x, z.tail[1].y);
      w.lineTo(z.hxy.x, z.hxy.y);
      w.closePath();
      if (A) {
        w.strokeStyle = A;
        w.stroke();
      }
      if (y) {
        w.fillStyle = y;
        w.fill();
      }
    };
  };
  jsPlumb.Overlays.canvas.Arrow = function () {
    r.apply(this, [jsPlumb.Overlays.Arrow, arguments]);
  };
  jsPlumb.Overlays.canvas.PlainArrow = function () {
    r.apply(this, [jsPlumb.Overlays.PlainArrow, arguments]);
  };
  jsPlumb.Overlays.canvas.Diamond = function () {
    r.apply(this, [jsPlumb.Overlays.Diamond, arguments]);
  };
})();
(function (a) {
  jsPlumb.CurrentLibrary = {
    addClass: function (c, b) {
      c.addClass(b);
    },
    animate: function (d, c, b) {
      d.animate(c, b);
    },
    appendElement: function (c, b) {
      jsPlumb.CurrentLibrary.getElementObject(b).append(c);
    },
    bind: function (b, c, d) {
      b = jsPlumb.CurrentLibrary.getElementObject(b);
      b.bind(c, d);
    },
    dragEvents: {
      start: "start",
      stop: "stop",
      drag: "drag",
      step: "step",
      over: "over",
      out: "out",
      drop: "drop",
      complete: "complete",
    },
    extend: function (c, b) {
      return a.extend(c, b);
    },
    getAttribute: function (b, c) {
      return b.attr(c);
    },
    getClientXY: function (b) {
      return [b.clientX, b.clientY];
    },
    getDocumentElement: function () {
      return document;
    },
    getDragObject: function (b) {
      return b[1].draggable;
    },
    getDragScope: function (b) {
      return b.draggable("option", "scope");
    },
    getDropScope: function (b) {
      return b.droppable("option", "scope");
    },
    getElementObject: function (b) {
      return typeof b == "string" ? a("#" + b) : a(b);
    },
    getOffset: function (b) {
      return b.offset();
    },
    getPageXY: function (b) {
      return [b.pageX, b.pageY];
    },
    getParent: function (b) {
      return jsPlumb.CurrentLibrary.getElementObject(b).parent();
    },
    getScrollLeft: function (b) {
      return b.scrollLeft();
    },
    getScrollTop: function (b) {
      return b.scrollTop();
    },
    getSize: function (b) {
      return [b.outerWidth(), b.outerHeight()];
    },
    getUIPosition: function (c) {
      var d = c[1],
        b = d.offset;
      return b || d.absolutePosition;
    },
    hasClass: function (c, b) {
      return c.hasClass(b);
    },
    initDraggable: function (c, b) {
      b.helper = null;
      b.scope = b.scope || jsPlumb.Defaults.Scope;
      c.draggable(b);
    },
    initDroppable: function (c, b) {
      b.scope = b.scope || jsPlumb.Defaults.Scope;
      c.droppable(b);
    },
    isAlreadyDraggable: function (b) {
      b = jsPlumb.CurrentLibrary.getElementObject(b);
      return b.hasClass("ui-draggable");
    },
    isDragSupported: function (c, b) {
      return c.draggable;
    },
    isDropSupported: function (c, b) {
      return c.droppable;
    },
    removeClass: function (c, b) {
      c.removeClass(b);
    },
    removeElement: function (b, c) {
      jsPlumb.CurrentLibrary.getElementObject(b).remove();
    },
    setAttribute: function (c, d, b) {
      c.attr(d, b);
    },
    setDraggable: function (c, b) {
      c.draggable("option", "disabled", !b);
    },
    setDragScope: function (c, b) {
      c.draggable("option", "scope", b);
    },
    setOffset: function (b, c) {
      jsPlumb.CurrentLibrary.getElementObject(b).offset(c);
    },
  };
  a(document).ready(jsPlumb.init);
})(jQuery);
(function () {
  if (typeof Math.sgn == "undefined") {
    Math.sgn = function (l) {
      return l == 0 ? 0 : l > 0 ? 1 : -1;
    };
  }
  var b = {
      subtract: function (m, l) {
        return {
          x: m.x - l.x,
          y: m.y - l.y,
        };
      },
      dotProduct: function (m, l) {
        return m.x * l.x + m.y * l.y;
      },
      square: function (l) {
        return Math.sqrt(l.x * l.x + l.y * l.y);
      },
      scale: function (m, l) {
        return {
          x: m.x * l,
          y: m.y * l,
        };
      },
    },
    d = Math.pow(2, -65),
    h = function (y, x) {
      for (
        var s = [],
          v = x.length - 1,
          r = 2 * v - 1,
          t = [],
          w = [],
          o = [],
          p = [],
          q = [
            [1, 0.6, 0.3, 0.1],
            [0.4, 0.6, 0.6, 0.4],
            [0.1, 0.3, 0.6, 1],
          ],
          u = 0;
        u <= v;
        u++
      ) {
        t[u] = b.subtract(x[u], y);
      }
      for (u = 0; u <= v - 1; u++) {
        w[u] = b.subtract(x[u + 1], x[u]);
        w[u] = b.scale(w[u], 3);
      }
      for (u = 0; u <= v - 1; u++) {
        for (var n = 0; n <= v; n++) {
          o[u] || (o[u] = []);
          o[u][n] = b.dotProduct(w[u], t[n]);
        }
      }
      for (u = 0; u <= r; u++) {
        p[u] || (p[u] = []);
        p[u].y = 0;
        p[u].x = parseFloat(u) / r;
      }
      r = v - 1;
      for (t = 0; t <= v + r; t++) {
        w = Math.min(t, v);
        for (u = Math.max(0, t - r); u <= w; u++) {
          j = t - u;
          p[u + j].y += o[j][u] * q[j][u];
        }
      }
      v = x.length - 1;
      p = k(p, 2 * v - 1, s, 0);
      r = b.subtract(y, x[0]);
      o = b.square(r);
      for (u = q = 0; u < p; u++) {
        r = b.subtract(y, i(x, v, s[u], null, null));
        r = b.square(r);
        if (r < o) {
          o = r;
          q = s[u];
        }
      }
      r = b.subtract(y, x[v]);
      r = b.square(r);
      if (r < o) {
        o = r;
        q = 1;
      }
      return {
        location: q,
        distance: o,
      };
    },
    k = function (E, D, y, B) {
      var x = [],
        z = [],
        C = [],
        u = [],
        v = 0,
        w,
        A;
      A = Math.sgn(E[0].y);
      for (var t = 1; t <= D; t++) {
        w = Math.sgn(E[t].y);
        w != A && v++;
        A = w;
      }
      switch (v) {
        case 0:
          return 0;
        case 1:
          if (B >= 64) {
            y[0] = (E[0].x + E[D].x) / 2;
            return 1;
          }
          var s, r, p;
          v = E[0].y - E[D].y;
          w = E[D].x - E[0].x;
          A = E[0].x * E[D].y - E[D].x * E[0].y;
          t = max_distance_below = 0;
          for (r = 1; r < D; r++) {
            p = v * E[r].x + w * E[r].y + A;
            if (p > t) {
              t = p;
            } else {
              if (p < max_distance_below) {
                max_distance_below = p;
              }
            }
          }
          s = v;
          r = w;
          p = A - t;
          s = 0 * r - s * 1;
          s = 1 / s;
          t = (1 * p - r * 0) * s;
          s = v;
          r = w;
          p = A - max_distance_below;
          s = 0 * r - s * 1;
          s = 1 / s;
          v = (1 * p - r * 0) * s;
          if (Math.max(t, v) - Math.min(t, v) < d ? 1 : 0) {
            C = E[D].x - E[0].x;
            u = E[D].y - E[0].y;
            y[0] = 0 + 1 * (C * (E[0].y - 0) - u * (E[0].x - 0)) * (1 / (C * 0 - u * 1));
            return 1;
          }
      }
      i(E, D, 0.5, x, z);
      E = k(x, D, C, B + 1);
      D = k(z, D, u, B + 1);
      for (B = 0; B < E; B++) {
        y[B] = C[B];
      }
      for (B = 0; B < D; B++) {
        y[B + E] = u[B];
      }
      return E + D;
    },
    i = function (m, l, o, q, n) {
      for (var p = [[]], r = 0; r <= l; r++) {
        p[0][r] = m[r];
      }
      for (m = 1; m <= l; m++) {
        for (r = 0; r <= l - m; r++) {
          p[m] || (p[m] = []);
          p[m][r] || (p[m][r] = {});
          p[m][r].x = (1 - o) * p[m - 1][r].x + o * p[m - 1][r + 1].x;
          p[m][r].y = (1 - o) * p[m - 1][r].y + o * p[m - 1][r + 1].y;
        }
      }
      if (q != null) {
        for (r = 0; r <= l; r++) {
          q[r] = p[r][0];
        }
      }
      if (n != null) {
        for (r = 0; r <= l; r++) {
          n[r] = p[l - r][r];
        }
      }
      return p[l][0];
    },
    g = {},
    c = function (u) {
      var t = g[u];
      if (!t) {
        t = [];
        var p = function (l) {
            return function () {
              return l;
            };
          },
          r = function () {
            return function (l) {
              return l;
            };
          },
          o = function () {
            return function (l) {
              return 1 - l;
            };
          },
          q = function (l) {
            return function (w) {
              for (var v = 1, x = 0; x < l.length; x++) {
                v *= l[x](w);
              }
              return v;
            };
          };
        t.push(
          new (function () {
            return function (l) {
              return Math.pow(l, u);
            };
          })()
        );
        for (var s = 1; s < u; s++) {
          for (var m = [new p(u)], n = 0; n < u - s; n++) {
            m.push(new r());
          }
          for (n = 0; n < s; n++) {
            m.push(new o());
          }
          t.push(new q(m));
        }
        t.push(
          new (function () {
            return function (l) {
              return Math.pow(1 - l, u);
            };
          })()
        );
        g[u] = t;
      }
      return t;
    },
    a = function (m, l) {
      for (var o = c(m.length - 1), q = 0, n = 0, p = 0; p < m.length; p++) {
        q += m[p].x * o[p](l);
        n += m[p].y * o[p](l);
      }
      return {
        x: q,
        y: n,
      };
    },
    f = function (m, l, o) {
      var q = a(m, l),
        n = 0;
      l = l;
      for (var p = o > 0 ? 1 : -1, r = null; n < Math.abs(o); ) {
        l += 0.005 * p;
        r = a(m, l);
        n += Math.sqrt(Math.pow(r.x - q.x, 2) + Math.pow(r.y - q.y, 2));
        q = r;
      }
      return {
        point: r,
        location: l,
      };
    },
    e = function (m, l) {
      var n = a(m, l),
        o = a(m.slice(0, m.length - 1), l);
      return Math.atan((o.y - n.y) / (o.x - n.x));
    };
  window.jsBezier = {
    distanceFromCurve: h,
    gradientAtPoint: e,
    nearestPointOnCurve: function (m, l) {
      var n = h(m, l);
      return {
        point: i(l, l.length - 1, n.location, null, null),
        location: n.location,
      };
    },
    pointOnCurve: a,
    pointAlongCurveFrom: function (m, l, n) {
      return f(m, l, n).point;
    },
    perpendicularToCurveAt: function (m, l, n, o) {
      o = o == null ? 0 : o;
      l = f(m, l, o);
      m = e(m, l.location);
      o = Math.atan(-1 / m);
      m = (n / 2) * Math.sin(o);
      n = (n / 2) * Math.cos(o);
      return [
        {
          x: l.point.x + n,
          y: l.point.y + m,
        },
        {
          x: l.point.x - n,
          y: l.point.y - m,
        },
      ];
    },
  };
})();
