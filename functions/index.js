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
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

const constructGame = (players) => {
  const details = {};
  details["players"] = players;
  for (let i=0; i<players.length; i++) {
    const playerId = players[i];
    details[playerId] = {
      move: 0,
    };
  }

  return JSON.stringify(details);
};

exports.createWaitingRoom = functions.database.ref("loggedInUsers").onWrite(
    async (change) => {
      logger.log("starting createWaitingRoom");
      let docRef = null;
      const db = admin.database();
      db.ref("loggedInUsers")
          .on("value", (snapshot) => {
            logger.log("extracting players");
            if (snapshot.numChildren() < 3) {
              const value = snapshot.val();
              const players = [];
              for (const key in value) {
                if (Object.hasOwn(value, key)) {
                  players.push(key);
                }
              }
              docRef = db.ref("waitingRoom")
                  .push({
                    "created": admin.database.ServerValue.TIMESTAMP,
                    "duration": 120,
                    "players": players,
                  }).key;
              logger.log("created docRef", docRef);
              db.ref("waitingRoom")
                  .child(docRef)
                  .child("players")
                  .get().then((snapshot) => {
                    const players = snapshot.val();
                    logger.log("players", players);
                    logger.log("constructGame(players)",
                        constructGame(players));
                    const gameKey = db.ref("games")
                        .push({"players": players}).key;
                    db.ref("games").child("currTurn").set(players[0]);
                    for (let i=0; i<players.length; i++) {
                      db.ref("games").child(gameKey).child(players[i]).set({
                        "move": 0,
                      });
                      db.ref("users").child(players[i]).set({
                        "game": gameKey,
                      });
                    }
                  }).catch((error)=>{
                    logger.log(error);
                  });
            }
          });
    });
