sap.ui.define([
    "com/lab2dev/uichatbotaigabrielmarangoni/controller/BaseController",
    "com/lab2dev/uichatbotaigabrielmarangoni/model/models",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent",
], function (BaseController, models, MessageBox, UIComponent) {
    'use strict';

    return BaseController.extend("com.lab2dev.uichatbotaigabrielmarangoni.controller.ChatMessageHistory", {

        _oChat: {
            messages: [],
            isBusy: false,
            enableTextArea: true,
        },

        onInit: async function () {
            const oComponent = this.getOwnerComponent();
            const sResolvedURI = oComponent.getManifestObject().resolveUri('user-api/currentUser');
            const { body: oUser } = await models.environment.getCurrentUser({ sPath: sResolvedURI });
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
            const chatModel = this.getView().getModel('chatModel');
            const conversationId = chatModel.getProperty("/conversationId");
            this._appendMessage({
                role: "user",
                content: sMessage,
                createdAt: new Date().toISOString()
            })
            const { body: oBody, error: oError } = await models.create({
                sService: "/chat",
                sPath: "/sendMessage",
                oBody: { content: sMessage, conversationId }
            });
            if (oError) {
                this._setBusy(false);
                this._setEnableTextArea(true);
                return MessageBox.error("Unexpected Error!");
            }
            this._appendMessage({
                role: "assistant",
                content: oBody.sendMessage.content,
                createdAt: new Date().toISOString(),
                icon: "sap-icon://da-2",
            })
            this._setBusy(false);
            this._setEnableTextArea(true);
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
            const aMessages = oBody.messages.results.map(oMessage => ({
                ...oMessage,
                icon: oMessage.role === "assistant" ? "sap-icon://da-2" : undefined
            }));

            const oChatModel = { conversationId, messages: aMessages };
            this.setModel({ oModel: oChatModel, sModelName: "chatModel" });
        },

        _appendMessage: function (oMessage) {
            const oChatModel = this.getModel('chatModel');
            const aMessages = oChatModel.getProperty("/messages") || [];
            aMessages.push({ ...oMessage });
            oChatModel.setProperty("/messages", aMessages);
        },

        _setBusy: function (bIsBusy) {
            this.setProperty({ sModel: "chatModel", sPath: "/isBusy", oProperty: bIsBusy });
        },

        _setEnableTextArea: function (bIsEnabled) {
            this.setProperty({ sModel: "chatModel", sPath: "/enableTextArea", oProperty: bIsEnabled });
        }
    });
});
