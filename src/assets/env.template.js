(function(window) {
  window.env = window.env || {};

  // Environment variables
  //todo external env var has to be changed in Helm
  window["env"]["BASE_URL"] = "${BASE_URL}";
  window["env"]["REGISTRATION_FORM_URL"]= "${REGISTRATION_FORM_URL}"
  window["env"]["ISBE_REGISTER_LINK"]= "${ISBE_REGISTER_LINK}"
  window["env"]["AUTHORITY"] = "${AUTHORITY}";
  window["env"]["REDIRECT_URL"] = "${REDIRECT_URL}";
})(this);
