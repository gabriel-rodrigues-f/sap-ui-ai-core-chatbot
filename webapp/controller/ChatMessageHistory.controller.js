sap.ui.define([
    "com/lab2dev/uichatbotaigabrielmarangoni/controller/BaseController",
    "com/lab2dev/uichatbotaigabrielmarangoni/model/models",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent",
], function (BaseController, models, MessageToast, MessageBox, UIComponent) {
    'use strict';

    return BaseController.extend("com.lab2dev.uichatbotaigabrielmarangoni.controller.ChatMessageHistory", {

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
            this.setModel({ oModel: user, sModelName: "currentUserModel" });
            const oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("ChatMessageHistory").attachPatternMatched(this._onRouteMatched, this);
        },

        onListUpdateFinished: function (oEvent) {
            const items = oEvent.getSource().getItems();
            if (items.length === 0) return;
            items[items.length - 1].focus();
        },

        onSendMessage: async function (oEvent) {
            this._setBusy(true);
            this._setEnableTextArea(false);
            const message = oEvent.getParameter("value");
            const source = oEvent.getSource();
            const oRouter = UIComponent.getRouterFor(this);
            this._appendUserPrompt(message);
            const chatModel = this.getModel("chatModel");
            const id = chatModel.getProperty("/id");
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

        _appendUserPrompt: function (oMessage) {
            const chatModel = this.getModel('chatModel');
            const messages = chatModel.getProperty("/messages");
            const currentUserModel = this.getModel('currentUserModel');
            if (messages) {
                const id = messages[0].conversation_id;
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

        _onRouteMatched: async function (oEvent) {
            const id = oEvent.getParameter("arguments").id;
            const { body, error } = await models.read({
                sService: "/chat",
                sPath: "/Conversation",
                oOptions: {
                    urlParameters: { "$expand": "messages", "$filter": `id eq ${id}` }
                }
            });
            const currentChat = body.results[0];
            console.log(currentChat)
            const chatModelData = {
                ...currentChat,
                messages: currentChat.messages.results
            };
            this.setModel({ oModel: chatModelData, sModelName: "chatModel" });
            this._setConversationHistory(body.results);
        },


        _setConversationHistory: async function (aConversations) {
            const currentUserModel = await this.getModel('currentUserModel');
            const chatModel = this.getModel('chatModel');
            const messages = chatModel.getProperty("/messages");
            for (const message of aConversations) {
                const messageModel = {
                    messageId: message.id,
                    conversationId: message.conversation_id,
                    timestamp: new Date(message.createdAt),
                    content: message.content,
                    email: "",
                    role: message.role === "assistant" ? "assistant " : "You",
                    iconPath: message.role === "assistant" ? "sap-icon://da-2" : "",
                    initials: message.role === "assistant" ? "" : currentUserModel.getProperty("/firstname").charAt(0) + currentUserModel.getProperty("/lastname").charAt(0),
                };
                if (message.id) messages.push(messageModel);
            }
            chatModel.setProperty("/messages", messages);
        },

        _setBusy: function (isBusy) {
            this.setProperty({ sModel: "chatModel", sPath: "/isBusy", oProperty: isBusy });
        },

        _setEnableTextArea: function (isEnable) {
            this.setProperty({ sModel: "chatModel", sPath: "/enableTextArea", oProperty: isEnable });
        },
    });
});