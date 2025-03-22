sap.ui.define([
    "com/lab2dev/uichatbotaigabrielmarangoni/controller/BaseController",
    "com/lab2dev/uichatbotaigabrielmarangoni/model/models",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, models, MessageToast, MessageBox) {
    'use strict';

    return BaseController.extend("com.lab2dev.uichatbotaigabrielmarangoni.controller.ChatHistory", {

        onInit: async function () {
            const { body } = await models.read({ sService: "/chat", sPath: "/Conversation" });
            console.log(body)
            this.setModel({ oModel: body.results, sModelName: "conversation" })
        },

        onChatPress: function (oEvent) {
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            const listItem = oEvent.getParameter("listItem");
            const oBindingContext = listItem.getBindingContext("conversation");
            const conversationId = oBindingContext.getProperty("id");
            oRouter.navTo("ChatMessageHistory", { conversationId });
        },

        onChatCreate: function () {
            this.getOwnerComponent().getRouter().navTo("Chat");
        },

        onChatDelete: function (oEvent) {
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            const listItem = oEvent.getParameter("listItem");
            const conversationId = listItem.getBindingContext("conversation").getProperty("id");
            const conversationTitle = listItem.getBindingContext("conversation").getProperty("title").toString();
            const curRouteHash = oRouter.getHashChanger().getHash();
            const curRouteName = oRouter.getRouteInfoByHash(curRouteHash);

            MessageBox.warning(
                `This action will delete the ${conversationTitle} file`,
                {
                    icon: MessageBox.Icon.WARNING,
                    title: "Do you want to delete chat?",
                    actions: ["Remover", MessageBox.Action.CANCEL],
                    emphasizedAction: "Remove",
                    styleClass: "sapMUSTRemovePopoverContainer",
                    initialFocus: MessageBox.Action.CANCEL,
                    onClose: async sAction => {
                        if (sAction !== "Remove") return;
                        try {
                            const { error } = await models.remove({ sService: "/chat", sPath: `/Conversation(${conversationId})` })
                            error
                                ? MessageBox.error("An unexpected error occurred!")
                                : MessageToast.show("Chat deleted successfully!");
                            if (curRouteName.name !== "Chat") this.oRouter.navTo("Chat");
                            else { this.getView().byId("leftScreenChatHistory").getBinding("items").refresh(); }
                        } catch (error) {
                            console.log(error);
                            MessageBox.error("An unexpected error occurred!");
                        };
                    }
                }
            )
        },
    });
});