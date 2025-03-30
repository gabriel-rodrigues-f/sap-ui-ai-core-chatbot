sap.ui.define([
    "com/lab2dev/uichatbotaigabrielmarangoni/controller/BaseController",
    "com/lab2dev/uichatbotaigabrielmarangoni/model/models",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent",
], function (BaseController, models, MessageToast, MessageBox, UIComponent) {
    'use strict';

    return BaseController.extend("com.lab2dev.uichatbotaigabrielmarangoni.controller.ChatMessageHistory", {

        _oChat: {
            conversationId: "",
            messages: [],
            isBusy: false,
            enableTextArea: true,
        },

        onInit: async function () {
            this.setModel({ oModel: this._oChat, sModelName: "chatModel" });
            const oUser = await this._getCurrentUser();
            this.setModel({ oModel: oUser, sModelName: "currentUserModel" });
            const oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("ChatMessageHistory").attachPatternMatched(this._onRouteMatched, this);
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
            this._appendUserPrompt(sMessage);
            const oChatModel = this.getModel("chatModel");
            const conversationId = oChatModel.getProperty("/conversationId");
            const { email: sEmail } = await this._getCurrentUser();
            const { body: oBody, error: oError } = await models.create({
                sService: "/chat",
                sPath: "/generate",
                oUserPrompt: { content: sMessage, user: sEmail }
            });
            if (oError) {
                this._setBusy(false);
                this._setEnableTextArea(true);
                return MessageBox.error("Unexpected Error!");
            }
            this._appendChatResponse(oBody);
            this._setBusy(false);
            this._setEnableTextArea(true);
        },

        _appendUserPrompt: function (sMessage) {
            const oChatModel = this.getModel("chatModel");
            const aMessages = oChatModel.getProperty("/messages") || [];
            aMessages.push({ role: "user", content: sMessage, timestamp: new Date().toISOString() });
            oChatModel.setProperty("/messages", aMessages);
        },

        _appendChatResponse: function (oResponse) {
            const oChatModel = this.getModel("chatModel");
            const aMessages = oChatModel.getProperty("/messages") || [];
            aMessages.push({ role: "assistant", content: oResponse.content, timestamp: oResponse.timestamp });
            oChatModel.setProperty("/messages", aMessages);
            oChatModel.setProperty("/conversationId", oResponse.conversationId);
        },

        _onRouteMatched: async function (oEvent) {
            const conversationId = oEvent.getParameter("arguments").id;
            const { body: oBody, error: oError } = await models.read({
                sService: "/chat",
                sPath: `/Conversation(${conversationId})`,
                oOptions: { urlParameters: { "$expand": "messages" } }
            });
            if (oError) {
                this.setModel({ oModel: this._oChat, sModelName: "chatModel" });
                return MessageBox.error("Unexpected Error!");
            };
            const oChatModel = { conversationId: oBody.id, messages: oBody.messages.results };
            this.setModel({ oModel: oChatModel, sModelName: "chatModel" });
        },

        _setBusy: function (bIsBusy) {
            this.setProperty({ sModel: "chatModel", sPath: "/isBusy", oProperty: bIsBusy });
        },

        _setEnableTextArea: function (bIsEnabled) {
            this.setProperty({ sModel: "chatModel", sPath: "/enableTextArea", oProperty: bIsEnabled });
        },

        _getCurrentUser: async function () {
            const sURI = this.resolveURI("user-api/currentUser");
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
            };
        },
    });
});
