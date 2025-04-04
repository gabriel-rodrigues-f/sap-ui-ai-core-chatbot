sap.ui.define([
    "com/lab2dev/uichatbotaigabrielmarangoni/controller/BaseController",
    "com/lab2dev/uichatbotaigabrielmarangoni/model/models",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
], function (BaseController, models, MessageToast, MessageBox) {
    'use strict';

    return BaseController.extend("com.lab2dev.uichatbotaigabrielmarangoni.controller.ChatHistory", {

        onInit: function () {
            this._setConversationModel()
            this.getOwnerComponent().getEventBus().subscribe("conversationHistoryLoaded", this._setConversationModel, this)
        },

        _setConversationModel: async function () {
            const { body: oUser } = await models.environment.getCurrentUser({ oContext: this });
            const { body: oBody, error: oError } = await models.read({
                sService: "/chat",
                sPath: "/Conversation",
                oOptions: {
                    urlParameters: { "$filter": `user eq '${oUser.email}'` }
                }
            });
            if (oError) return MessageBox.error("Error fetching chats!");
            this.setModel({ oModel: oBody.results, sModelName: "conversation" });
        },

        onChatPress: function (oEvent) {
            const oListItem = oEvent.getParameter("listItem");
            const oBindingContext = oListItem.getBindingContext("conversation");
            const sId = oBindingContext.getProperty("id");
            this.navigateTo({ sViewName: "ChatMessageHistory", sId });
        },

        onChatCreate: async function () {
            this.getOwnerComponent().getRouter().navTo("Chat");
            const { body: oBody, error: oError } = await models.read({ sService: "/chat", sPath: "/Conversation" });
            if (oError) return MessageBox.error("Error fetching chats!");
            this.setModel({ oModel: oBody.results, sModelName: "conversation" });
        },

        onChatDelete: function (oEvent) {
            const oListItem = oEvent.getParameter("listItem");
            const sId = oListItem.getBindingContext("conversation").getProperty("id");
            const sTitle = oListItem.getBindingContext("conversation").getProperty("title");
            MessageBox.warning(
                `This will delete: ${sTitle}`, {
                icon: MessageBox.Icon.WARNING,
                title: "Delete Chat?",
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                initialFocus: MessageBox.Action.CANCEL,
                onClose: async sAction => {
                    if (sAction !== MessageBox.Action.OK) return;
                    const { error: oRemoveError } = await models.remove({ sService: "/chat", sPath: `/Conversation/${sId}` });
                    oRemoveError
                        ? MessageBox.error("Error deleting chat!")
                        : MessageToast.show("Chat deleted successfully!");
                    this.getOwnerComponent().getRouter().navTo("Chat");
                    const { body: oBody, error: oReadError } = await models.read({ sService: "/chat", sPath: "/Conversation" });
                    if (oReadError) {
                        this.setModel({ oModel: [], sModelName: "conversation" });
                        return MessageBox.error("Error fetching chats!");
                    };
                    this.setModel({ oModel: oBody.results, sModelName: "conversation" });
                }
            });
        }
    });
});