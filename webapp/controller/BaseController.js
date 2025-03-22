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
          setModel: function ({ oModel, sModelName }) {
            return this.getView().setModel(new JSONModel(oModel), sModelName)
          },
  
          getModel: function (sModelName) {
            return this.getView().getModel(sModelName)
          },
  
          setProperty({ sModel, sPath, oProperty }) {
            return this.getView().getModel(sModel).setProperty(sPath, oProperty)
          },
  
          getProperty: function ({ sModel, sPath }) {
            return this.getView().getModel(sModel).getProperty(sPath)
          },
  
          filterById: function ({ sId, sProperty, sOperator }) {
            const sItem = this.byId(sId).getValue()
            return new Filter(sProperty, FilterOperator[sOperator], sItem)
          }
        }
      )
    }
  )