sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
  ],
  function (Controller, JSONModel, Filter, FilterOperator) {
    "use strict"

    return Controller.extend(
      "com.lab2dev.uichatbotaigabrielmarangoni.controller.BaseController",
      {
        getModel: function (sModelName) {
          return this.getView().getModel(sModelName);
        },

        setModel: function ({ oModel, sModelName }) {
          return this.getView().setModel(new JSONModel(oModel), sModelName);
        },

        getProperty: function ({ sModelName, sPath }) {
          return this.getView().getModel(sModelName).getProperty(sPath);
        },

        setProperty({ sModelName, sPath, oProperty }) {
          return this.getView().getModel(sModelName).setProperty(sPath, oProperty);
        },

        resolveURI: function (sURI) {
          const oComponent = this.getOwnerComponent();
          return oComponent.getManifestObject().resolveUri(sURI);
        }
      }
    )
  }
)