sap.ui.define([
    "com/lab2dev/uichatbotaigabrielmarangoni/controller/BaseController",
    "com/lab2dev/uichatbotaigabrielmarangoni/model/models",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent"
], function (BaseController, models, MessageToast, MessageBox, UIComponent) {
    'use strict';

    return BaseController.extend("com.lab2dev.uichatbotaigabrielmarangoni.controller.ChatHistory", {

        onInit: async function () {
            const { body: oBody, error: oError } = await models.read({ sService: "/chat", sPath: "/Conversation" });
            if (oError) return MessageBox.error("An unexpected error occurred!");
            this.setModel({ oModel: oBody.results, sModelName: "conversation" });
        },

        onChatPress: function (oEvent) {
            const oRouter = UIComponent.getRouterFor(this);
            const aListItems = oEvent.getParameter("listItem");
            const oBindingContext = aListItems.getBindingContext("conversation");
            const sId = oBindingContext.getProperty("id");

            this.navigateTo({ sViewName: "ChatMessageHistory", sId });
        },

        onChatCreate: function () {
            this.getOwnerComponent().getRouter().navTo("Chat");
        },

        onChatDelete: function (oEvent) {
            const oRouter = UIComponent.getRouterFor(this);
            const oListItem = oEvent.getParameter("listItem");
            const sId = oListItem.getBindingContext("conversation").getProperty("id");
            const sTitle = oListItem.getBindingContext("conversation").getProperty("title");
            MessageBox.warning(
                "Are you sure you want to delete this conversation?",
                {
                    icon: MessageBox.Icon.WARNING,
                    title: "Do you want to delete chat?",
                    actions: ["teste", MessageBox.Action.CANCEL],
                    emphasizedAction: "Remove",
                    styleClass: "sapMUSTRemovePopoverContainer",
                    initialFocus: MessageBox.Action.CANCEL,
                    onClose: async sAction => {
                        if (sAction !== "Remove") return;
                        try {
                            const { error: oRemoveError } = await models.remove({ sService: "/chat", sPath: `/Conversation(${sId})` })
                            if (oRemoveError) return MessageBox.error("An unexpected error occurred!");
                            MessageToast.show("Chat deleted successfully!");
                            const { body: oBody, error: oReadError } = await models.read({ sService: "/chat", sPath: "/Conversation" });
                            if (oReadError) return MessageBox.error("An unexpected error occurred!");
                            this.setModel({ oModel: oBody.results, sModelName: "conversation" });
                        } catch (oError) {
                            console.error(oError);
                            MessageBox.error("An unexpected error occurred!");
                        };
                    }
                }
            );
        }
    });
});