sap.ui.define([
    "com/lab2dev/uichatbotaigabrielmarangoni/controller/BaseController",
    "com/lab2dev/uichatbotaigabrielmarangoni/model/models",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent",
], function (BaseController, models, MessageToast, MessageBox, UIComponent) {
    'use strict';

    return BaseController.extend("com.lab2dev.uichatbotaigabrielmarangoni.controller.Chat", {

        /* 
            chatModel: {
                id: UUID,
                messageId: UUID,
                timestamp: Date,
                user: string,
                content: string,
                messages [],
                isBusy: boolean
                enableTextArea: boolean
            }

            messages : {
                id: chatModel.getProperty("/messageId"),
                conversationId,
                timestamp: chatModel.getProperty("/timestamp"),
                user,
                content: chatModel.getProperty("/content")
            }
        */

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
            const oChatModel = this.getModel('chatModel');
            const sConversationId = oChatModel.getProperty("/id");
            const sMessage = oEvent.getParameter("value");
            this._appendUserPrompt(sMessage);
            const { email: sEmail } = await this._getCurrentUser();
            const oUserPrompt = {
                id: oChatModel.getProperty("/messageId"),
                conversationId: sConversationId,
                timestamp: oChatModel.getProperty("/timestamp"),
                user: sEmail,
                content: oChatModel.getProperty("/content")
            };
            const { body: oBody, error: oError } = await models.create({ sService: "/chat", sPath: "/generate", oBody: oUserPrompt });
            if (oError) return MessageBox.error("Unexpected Error!");
            this._appendChatResponse(response.data.getChatRagResponse);
            this.navigateTo({ sViewName: "ChatMessageHistory", sId: sConversationId });
            this._setBusy(false);
            this._setEnableTextArea(true);
        },

        _setBusy: function (bIsBusy) {
            this.setProperty({ sModel: "chatModel", sPath: "/isBusy", oProperty: bIsBusy });
        },

        _setEnableTextArea: function (sIsEnabled) {
            this.setProperty({ sModel: "chatModel", sPath: "/enableTextArea", oProperty: sIsEnabled });
        },

        _appendUserPrompt: function (sMessage) {
            const oChatModel = this.getModel('chatModel');
            const aMessages = oChatModel.getProperty("/messages");
            const oCurrentUserModel = this.getModel('currentUserModel');
            if (aMessages) {
                const sConversationId = aMessages[0].conversation_id;
                oChatModel.setProperty("/id", sConversationId);
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
            };
        },

        _appendChatResponse: function (oResponse) {
            const oChatModel = this.getModel("chatModel");
            const aMessages = chatModel.getProperty("/messages");
            aMessages.push({
                conversationId: oChatModel.getProperty("/id"),
                id: crypto.randomUUID(),
                role: oResponse.role,
                content: oResponse.content,
                iconPath: "sap-icon://da-2",
                createdAt: new Date(oResponse.createdAt),
                initials: ""
            });
            oChatModel.setProperty("/messages", aMessages);
        },

        _clearMessages: function () {
            this.setProperty({ sModel: "chatModel", sPath: "/messages", oProperty: [] })
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