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
            const { body } = await models.read({ sService: "/chat", sPath: "/Conversation" });
            console.log(body)
            this.setModel({ oModel: body.results, sModelName: "conversation" });
        },

        onChatPress: function (oEvent) {
            const oRouter = UIComponent.getRouterFor(this);
            const listItem = oEvent.getParameter("listItem");
            const oBindingContext = listItem.getBindingContext("conversation");
            const id = oBindingContext.getProperty("id");
            oRouter.navTo("ChatMessageHistory", { id });
        },

        onChatCreate: function () {
            this.getOwnerComponent().getRouter().navTo("Chat");
        },

        onChatDelete: function (oEvent) {
            const oRouter = UIComponent.getRouterFor(this);
            const listItem = oEvent.getParameter("listItem");
            const id = listItem.getBindingContext("conversation").getProperty("/id");
            const title = listItem.getBindingContext("conversation").getProperty("/title").toString();
            const currentRouteHash = oRouter.getHashChanger().getHash();
            const currentRouteName = oRouter.getRouteInfoByHash(currentRouteHash);

            MessageBox.warning(
                `This action will delete the ${title} file`,
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
                            const { error } = await models.remove({ sService: "/chat", sPath: `/Conversation(${id})` })
                            error
                                ? MessageBox.error("An unexpected error occurred!")
                                : MessageToast.show("Chat deleted successfully!");
                            if (currentRouteName.name !== "Chat") this.oRouter.navTo("Chat");
                            else { this.getView().byId("leftScreenChatHistory").getBinding("items").refresh(); }
                        } catch (error) {
                            console.log(error);
                            MessageBox.error("An unexpected error occurred!");
                        };
                    }
                }
            );
        }
    });
});