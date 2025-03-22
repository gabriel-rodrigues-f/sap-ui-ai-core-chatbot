/* global QUnit */
// https://api.qunitjs.com/config/autostart/
QUnit.config.autostart = false;

sap.ui.require([
	"comlab2dev/ui-chatbot-ai-gabriel-marangoni/test/unit/AllTests"
], function (Controller) {
	"use strict";
	QUnit.start();
});