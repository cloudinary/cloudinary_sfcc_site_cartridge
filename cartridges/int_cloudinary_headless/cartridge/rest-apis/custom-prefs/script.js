"use strict";

var RESTResponseMgr = require("dw/system/RESTResponseMgr");
var System = require("dw/system/System");
var Logger = require("dw/system/Logger");

exports.GetCustomPrefs = function () {
  var prefs =
    "c_prefs" in request.getHttpParameterMap()
      ? request.getHttpParameterMap().get("c_prefs").getStringValue().split(",")
      : "";
  var info;
  var systemPrefs = dw.system.Site.current.preferences.custom;
  try {
    if (!prefs.length) {
      var err = new Error("c_prefs parameter is required.");
      err.statusCode = 400;
      throw err;
    }
    var data = {};
    prefs.forEach(function (prefKey) {
      if (prefKey in systemPrefs) {
        var prefValue = systemPrefs[prefKey];
        if (prefValue instanceof dw.value.EnumValue) {
          data[prefKey] = prefValue.value;
        } else {
          data[prefKey] = prefValue;
        }
      }
    });

    info = { success: true, customPreferences: data };
    response.setExpires(Date.now() + 24 * 60 * 60000); //cache for 24 hours
    RESTResponseMgr.createSuccess(info).render();
  } catch (e) {
    info = { success: false, error: e.message };
    RESTResponseMgr.createError(info).render();
  }
};

exports.GetCustomPrefs.public = true;
