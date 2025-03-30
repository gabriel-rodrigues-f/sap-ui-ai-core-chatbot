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
            id: "",
            messageId: "",
            timestamp: "",
            user: "",
            content: '',
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
            const sId = oChatModel.getProperty("/id");
            const { email } = await this._getCurrentUser();
            const oUserPrompt = {
                id: oChatModel.getProperty("/messageId"),
                conversationId: sId,
                timestamp: oChatModel.getProperty("/timestamp"),
                user: email,
                content: oChatModel.getProperty("/content")
            };
            const { body, error } = await models.create({ sService: "/chat", sPath: "/generate", oUserPrompt });
            if (error) return MessageBox.error("Unexpected Error!");
            this._appendChatResponse(response.data.getChatRagResponse);
            this.navigateTo({ sViewName: "ChatMessageHistory", sId });
            this._setBusy(false);
            this._setEnableTextArea(true);
        },

        _appendUserPrompt: function (sMessage) {
            const oChatModel = this.getModel('chatModel');
            const aMessages = oChatModel.getProperty("/messages");
            const oCurrentUserModel = this.getModel('currentUserModel');
            if (aMessages) {
                const sId = aMessages[0].conversation_id;
                oChatModel.setProperty("/id", sId);
                oChatModel.setProperty("/messageId", crypto.randomUUID());
                oChatModel.setProperty("/timestamp", new Date().toISOString());
                oChatModel.setProperty("/content", sMessage);
                oChatModel.setProperty("/user", oCurrentUserModel.getProperty("/user"));
                aMessages.push({
                    id: oChatModel.getProperty("/messageId"),
                    conversationId: oChatModel.getProperty("/id"),
                    role: "user",
                    content: sMessage,
                    createdAt: new Date(oChatModel.getProperty("/timestamp"))
                });
                oChatModel.setProperty("/messages", aMessages);
            }
        },

        _appendChatResponse: function (oResponse) {
            const oChatModel = this.getModel("chatModel");
            const aMessages = oChatModel.getProperty("/messages");
            aMessages.push({
                id: crypto.randomUUID(),
                conversationId: oChatModel.getProperty("/id"),
                role: oResponse.role,
                content: oResponse.content,
                iconPath: "sap-icon://da-2",
                createdAt: new Date(oResponse.createdAt),
                initials: ""
            });
            oChatModel.setProperty("/messages", aMessages);
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
            } catch (error) {
                MessageBox.error("Unable to get current user!");
            };
        },

        _onRouteMatched: async function (oEvent) {
            const sId = oEvent.getParameter("arguments").id;
            const { body: oBody, error: oError } = await models.read({
                sService: "/chat",
                sPath: "/Conversation",
                oOptions: {
                    urlParameters: { "$expand": "messages", "$filter": `id eq ${sId}` }
                }
            });
            if (oError) return MessageBox.error("Unexpected Error!");
            if(oBody.results.length){
                const oCurrentChat = oBody.results[0];
                const oChatModel = {
                    ...oCurrentChat,
                    messages: oCurrentChat.messages.results
                }
                this.setModel({ oModel: oChatModel, sModelName: "chatModel" });
                this._setConversationHistory(oBody.results);
            };
        },

        _setConversationHistory: async function (aCurrentConversationMessages) {
            const oCurrentUserModel = await this.getModel('currentUserModel');
            const oChatModel = this.getModel('chatModel');
            const aMessages = oChatModel.getProperty("/messages");
            for (const oMessage of aCurrentConversationMessages) {
                const oBody = {
                    id: oMessage.id,
                    conversationId: oMessage.conversation_id,
                    timestamp: new Date(oMessage.createdAt),
                    content: oMessage.content,
                    email: "",
                    role: oMessage.role === "assistant" ? "assistant " : "You",
                    iconPath: oMessage.role === "assistant" ? "sap-icon://da-2" : "",
                    initials: oMessage.role === "assistant" ? "" : oCurrentUserModel.getProperty("/firstname").charAt(0) + oCurrentUserModel.getProperty("/lastname").charAt(0),
                };
                if (oBody.id) aMessages.push(oBody);
            };
            oChatModel.setProperty("/messages", aMessages);
        },

        _setBusy: function (bIsBusy) {
            this.setProperty({ sModel: "chatModel", sPath: "/isBusy", oProperty: bIsBusy });
        },

        _setEnableTextArea: function (bIsEnabled) {
            this.setProperty({ sModel: "chatModel", sPath: "/enableTextArea", oProperty: bIsEnabled });
        },
    });
});