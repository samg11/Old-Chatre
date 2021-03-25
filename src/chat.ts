import express from "express";

const chat = express();

import { db, auth } from "./fire";
import { Group } from "./commonTypes";

chat.get("/:name/:rank", async (req, res) => {
  // @ts-ignore
  const group: Group = (
    await db.collection("groups").doc(req.params.name).get()
  ).data();
  console.log(group);
  res.render("pages/chat", {
    groupName: group.name,
    rank: req.params.rank === "a" ? "admin" : "member",
  });
});

chat.post("/:name/sendmsg", async (req, res) => {
  if (req.headers?.authorization?.startsWith("Bearer ")) {
    const idToken = req.headers.authorization.split("Bearer ")[1];
    const [decodedToken, group] = await Promise.all([
      auth.verifyIdToken(idToken),
      db.collection("groups").doc(req.params.name).get(),
    ]);
    if (
      decodedToken.uid === group.data()?.admin ||
      group.data()?.members.includes(decodedToken.uid)
    ) {
      db.collection("groups")
        .doc(req.params.name)
        .collection("messages")
        .add({
          date_created: Math.floor(new Date().getTime() / 1000),
          text: req.body.text,
          posted_by: decodedToken.name,
          image: null,
        });
      res.sendStatus(201);
    } else {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }
});

chat.post("/:name/add-member", async (req, res) => {
  try {
    if (req.headers.authorization?.startsWith("Bearer ")) {
      const idToken = req.headers.authorization.split("Bearer ")[1];
      console.log(req.body);
      const [decodedToken, group] = await Promise.all([
        auth.verifyIdToken(idToken),
        db.collection("groups").doc(req.params.name).get(),
      ]);

      // @ts-ignore
      const groupData: Group = group.data();

      if (decodedToken.uid === groupData.admin) {
        // ADMIN

        const userRecord = await auth.getUserByEmail(req.body.userEmail);

        if (!(groupData.members.includes(userRecord.uid))) {

          const newMembers = groupData.members;
          newMembers.push(userRecord.uid);

          db.collection("groups").doc(req.params.name).update({
            members: newMembers
          });

          res.json({ error: false, msg: `Successfully added user to group`});
        } else {
          res.status(409).json({ error: true, msg: 'User already in group'});
        }

      } else {
        // NOT ADMIN
        res.sendStatus(401);
      }
    } else {
      // INVALID AUTHORIZATION HEADER
      res
        .status(401)
        .send(`
          No authorization header or authorization header incorrectly formatted.
          Make sure the authorization header is a jwt prefixed with, "Bearer ".
        `);
    }
  } catch (err) {
    // ERROR OCCURS
    console.log(err);
    res.sendStatus(500);
  }
});

export default chat;
