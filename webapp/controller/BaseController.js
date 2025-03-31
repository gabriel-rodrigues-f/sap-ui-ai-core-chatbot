sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent",
  ],
  function (Controller, JSONModel, UIComponent) {
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

        navigateTo({ sViewName, sId }) {
          const oRouter = UIComponent.getRouterFor(this);
          oRouter.navTo(sViewName, { id: sId });
        }
      }
    )
  }
)