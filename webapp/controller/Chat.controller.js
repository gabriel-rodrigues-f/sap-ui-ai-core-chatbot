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

        _chat: {
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
            this.setModel({ oModel: this._chat, sModelName: "chatModel" })
            const user = await this._getCurrentUser();
            this.setModel({ oModel: user, sModelName: "currentUserModel" })
            const oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("Chat").attachPatternMatched(this._clearMessages(), this);
        },

        onListUpdateFinished: function (oEvent) {
            const items = oEvent.getSource().getItems();
            if (items.length === 0) return;
            items[items.length - 1].focus();
        },

        onSendMessage: async function (oEvent) {
            this._setBusy(true);
            this._setEnableTextArea(false);
            const chatModel = this.getModel('chatModel');
            const id = chatModel.getProperty("/id");
            const message = oEvent.getParameter("value");
            const source = oEvent.getSource();
            const oRouter = UIComponent.getRouterFor(this);
            this._appendUserPrompt(message);
            const { email } = await this._getCurrentUser();
            const oBody = {
                id,
                messageId: chatModel.getProperty("/messageId"),
                timestamp: chatModel.getProperty("/timestamp"),
                user: email,
                content: chatModel.getProperty("/content")
            };
            const { body, error } = await await models.create({ sService: "", sPath: "", oBody });
            if (error) return MessageBox.error("Unexpected Error!");
            this._appendChatResponse(response.data.getChatRagResponse);
            oRouter.navTo("ChatMessageHistory", { id });
            this._setBusy(false);
            this._setEnableTextArea(true);
        },

        _setBusy: function (isBusy) {
            this.setProperty({ sModel: "chatModel", sPath: "/isBusy", oProperty: isBusy });
        },

        _setEnableTextArea: function (isEnable) {
            this.setProperty({ sModel: "chatModel", sPath: "/enableTextArea", oProperty: isEnable });
        },

        _appendUserPrompt: function (oMessage) {
            const chatModel = this.getModel('chatModel');
            const messages = chatModel.getProperty("/messages");
            const currentUserModel = this.getModel('currentUserModel');
            if(messages){
                const id = messages[0].conversation_id;
                console.log("appendUserPrompt" + id)
                chatModel.setProperty("/id", id);
                chatModel.setProperty("/messageId", crypto.randomUUID());
                chatModel.setProperty("/timestamp", new Date().toISOString());
                chatModel.setProperty("/content", oMessage);
                chatModel.setProperty("/user", currentUserModel.getProperty("/user"));
                messages.push({
                    id: chatModel.getProperty("/id"),
                    messageId: chatModel.getProperty("/messageId"),
                    role: "user",
                    content: oMessage,
                    createdAt: new Date(chatModel.getProperty("/timestamp"))
                });
                chatModel.setProperty("/messages", messages);
            }
        },

        _appendChatResponse: function (oResponse) {
            const chatModel = this.getModel("chatModel");
            const messages = chatModel.getProperty("/messages");
            messages.push({
                conversationId: chatModel.getProperty("/id"),
                messageId: crypto.randomUUID(),
                role: oResponse.role,
                content: oResponse.content,
                iconPath: "sap-icon://da-2",
                createdAt: new Date(oResponse.createdAt),
                initials: ""
            });
            chatModel.setProperty("/messages", messages);
        },

        _clearMessages: function () {
            this.setProperty({ sModel: "chatModel", sPath: "/messages", oProperty: [] })
        },

        _getCurrentUser: async function () {
            const URI = this.resolveURI("user-api/currentUser");
            try {
                return Promise.resolve({
                    firstname: "FirstName",
                    lastname: "LastName",
                    email: "mail@mail.com"
                });
                // const response = await fetch(URI, {
                //     method: "GET",
                //     headers: { "content-type": "application/json" }
                // });
                // return await response.json();
            } catch (error) {
                MessageBox.error("Unable to get current user!");
            };
        },
    });
});