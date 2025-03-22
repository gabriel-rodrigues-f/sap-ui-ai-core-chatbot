sap.ui.define([
    "com/lab2dev/uichatbotaigabrielmarangoni/controller/BaseController",
    "com/lab2dev/uichatbotaigabrielmarangoni/model/models",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, models, MessageToast, MessageBox) {
    'use strict';

    return BaseController.extend("com.lab2dev.uichatbotaigabrielmarangoni.controller.ChatMessageHistory", {

        onInit: async function () {
            console.log("testing");
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("ChatMessageHistory").attachPatternMatched(this._onRouteMatched, this);
        },

        _loadChatMessages: async function (sId) {
            const { body } = await models.read({
                sService: "/chat",
                sPath: "/Conversation",
                oOptions: { $expand: "messages" }
            });
            const conversationModel = new JSONModel(body.results);
            this.getView().setModel(conversationModel, "conversation");
            const allConversations = conversationModel.getData();
            const selectedConversation = allConversations.find(chat => chat.id === sId);
            const chatModelData = {
                ...selectedConversation,
                chatHistory: selectedConversation.to_messages.results
            };
            this.getView().getModel('chatModel').setProperty("/id", selectedConversation.id);
            this.getView().setModel(new JSONModel(chatModelData), "chatModel");
            this._setConversationHistory(body.results);
        },

        _onRouteMatched: function (oEvent) {
            const conversationId = oEvent.getParameter("arguments").id;
            this._loadChatMessages(conversationId);
        },
    });
});