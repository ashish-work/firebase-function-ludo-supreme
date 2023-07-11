/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
"use strict";
const {logger} = require("firebase-functions");
// const {onRequest} = require("firebase-functions/v2/https");
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

exports.createWaitingRoom = functions.database.ref("loggedInUsers").onWrite(
    async (change) => {
      const db = admin.database();
      const docRef = db.ref("waitingRoom").push({"test": "test"});
      logger.log("created docRef", docRef);
    });
