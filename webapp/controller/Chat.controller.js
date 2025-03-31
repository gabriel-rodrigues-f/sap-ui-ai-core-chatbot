sap.ui.define([
    "com/lab2dev/uichatbotaigabrielmarangoni/controller/BaseController",
    "com/lab2dev/uichatbotaigabrielmarangoni/model/models",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent",
], function (BaseController, models, MessageToast, MessageBox, UIComponent) {
    'use strict';

    return BaseController.extend("com.lab2dev.uichatbotaigabrielmarangoni.controller.Chat", {

        _oChat: {
            messages: [],
            isBusy: false,
            enableTextArea: true,
        },

        onInit: async function () {
            this.setModel({ oModel: this._oChat, sModelName: "chatModel" });
            const oUser = await this._getCurrentUser();
            this.setModel({ oModel: oUser, sModelName: "currentUserModel" });
            const oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("Chat").attachPatternMatched(this._clearMessages, this);
        },

        onListUpdateFinished: function (oEvent) {
            const aItems = oEvent.getSource().getItems();
            if (aItems.length === 0) return;
            aItems[aItems.length - 1].focus();
        },

        onSendMessage: async function (oEvent) {
            this._setBusy(true);
            this._setEnableTextArea(false);
            const sMessage = oEvent.getParameter("value");
            this._appendMessage({ role: "user", content: sMessage, createdAt: new Date().toISOString() })
            const { email: sEmail } = await this._getCurrentUser();
            const { body: oBody, error: oError } = await models.create({
                sService: "/chat",
                sPath: "/startConversation",
                oBody: { user: sEmail, content: sMessage }
            });
            if (oError) {
                this._setBusy(false);
                this._setEnableTextArea(true);
                return MessageBox.error("Unexpected Error!");
            }
            this._appendMessage({
                role: "assistant",
                content: oBody.startConversation.content,
                createdAt: new Date().toISOString(),
                icon: oBody.startConversation.icon
            })
            this._setBusy(false);
            this._setEnableTextArea(true);

            this.navigateTo({ sViewName: "ChatHistory", sId: oBody.startConversation
                .conversationId });

            this.navigateTo({ sViewName: "ChatMessageHistory", sId: oBody.startConversation
                .conversationId });
        },
        _clearMessages: function () {
            this.getView().getModel("chatModel").setProperty("/messages", []);
        },

        _setBusy: function (bIsBusy) {
            this.getView().getModel("chatModel").setProperty("/isBusy", bIsBusy);
        },

        _setEnableTextArea: function (sIsEnabled) {
            this.getView().getModel("chatModel").setProperty("/isEnabled", sIsEnabled)
        },

        // _clearMessages: function () {
        //     this.setProperty({ sModel: "chatModel", sPath: "/messages", oProperty: [] });
        // },

        // _setBusy: function (bIsBusy) {
        //     this.setProperty({ sModel: "chatModel", sPath: "/isBusy", oProperty: bIsBusy });
        // },

        // _setEnableTextArea: function (sIsEnabled) {
        //     this.setProperty({ sModel: "chatModel", sPath: "/enableTextArea", oProperty: sIsEnabled });
        // },

        _appendMessage: function (oMessage) {
            const oChatModel = this.getModel('chatModel');
            const aMessages = oChatModel.getProperty("/messages");
            aMessages.push({ ...oMessage });
            oChatModel.setProperty("/messages", aMessages);
        },

        _getCurrentUser: async function () {
            try {
                return Promise.resolve({
                    firstname: "FirstName",
                    lastname: "LastName",
                    email: "mail@mail.com"
                });
                // const response = await fetch(sURI, {
                //     method: "GET",
                //     headers: { "content-type": "application/json" }
                // });
                // return await response.json();
            } catch (oError) {
                console.error(oError);
                MessageBox.error("Unable to get current user!");
            }
        },
    });
});
