/*global QUnit*/

sap.ui.define([
	"comlab2dev/ui-chatbot-ai-gabriel-marangoni/controller/ChatHistory.controller"
], function (Controller) {
	"use strict";

	QUnit.module("ChatHistory Controller");

	QUnit.test("I should test the ChatHistory controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
