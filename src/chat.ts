import express from "express";

const chat = express();

import { db, auth } from "./fire";
import { Group } from "./commonTypes";

chat.get("/:name/:rank", async (req, res) => {
  // @ts-ignore
  const group: Group = (
    await db.collection("groups").doc(req.params.name).get()
  ).data();
  res.render("pages/chat", {
    groupName: group.name,
    rank: req.params.rank === "a" ? "admin" : "member",
    time: Date.now()
  });
});

chat.post('/:name/getMembers', async (req, res) => {
  if (req.headers?.authorization?.startsWith("Bearer ")) {
    const idToken = req.headers.authorization.split("Bearer ")[1];
    const [decodedToken, group] = await Promise.all([
      auth.verifyIdToken(idToken),
      db.collection("groups").doc(req.params.name).get()
    ]);
    
    // @ts-ignore
    const groupData: Group = group.data();

    const members = groupData?.members;
    console.log(members)

    if (
      decodedToken.uid === groupData.admin ||
      members.includes(decodedToken.uid)
    ) {
      
      const memberList: string[][] = [];

      const admin = await auth.getUser(groupData.admin);

      // @ts-ignore
      memberList.push([ admin.email, admin.displayName ])

      if (members.length) {
        members.forEach((member: string) => {
          auth.getUser(member).then(user => {
            console.log(1);
            // @ts-ignore
            memberList.push([ user.email, user.displayName]);
            if (memberList.length >= members.length + 1) {
              res.json(memberList);
            }
          }).catch(console.error);
        });
      } else {
        console.log(2);
        res.json(memberList);
      } 
      
    } else {
      res.sendStatus(401);
    }

  } else {
    res.sendStatus(401);
  }
  
})

chat.post("/:name/sendmsg", async (req, res) => {
  if (req.headers?.authorization?.startsWith("Bearer ")) {
    const MAX_TIME = 1296000; // 15 * 86400 (15 days)

    const idToken = req.headers.authorization.split("Bearer ")[1];
    const [decodedToken, group, oldDocs] = await Promise.all([
      auth.verifyIdToken(idToken),
      db.collection("groups").doc(req.params.name).get(),
      db.collection('groups').doc(req.params.name).collection('messages')
        .where('date_created', '<', (Date.now() / 1000) - MAX_TIME).get()
    ]);
    if (
      decodedToken.uid === group.data()?.admin ||
      group.data()?.members.includes(decodedToken.uid)
    ) {
      db.collection("groups")
        .doc(req.params.name)
        .collection("messages")
        .add({
          date_created: Date.now(),
          text: req.body.text,
          posted_by: decodedToken.name,
          image: null,
          userIcon: decodedToken.picture
        });
      

      res.sendStatus(201);
      } else {
      res.sendStatus(401);
    }

    oldDocs.forEach((doc) => {
      console.log('old doc')
      db.collection('groups').doc(req.params.name).collection('messages').doc(doc.id).delete()
        .catch(console.error)
    });

  } else {
    res.sendStatus(401);
  }
});

chat.post("/:name/add-member", async (req, res) => {
  try {
    if (req.headers.authorization?.startsWith("Bearer ")) {
      const idToken = req.headers.authorization.split("Bearer ")[1];

      const [decodedToken, group, userRecord] = await Promise.all([
        auth.verifyIdToken(idToken),
        db.collection("groups").doc(req.params.name).get(),
        auth.getUserByEmail(req.body.userEmail)
      ])

      // @ts-ignore
      const groupData: Group = group.data();

      if (!userRecord) {
        res.json({ error: true, msg: 'User does not exist' });
      }


      if (decodedToken.uid === groupData.admin && userRecord) {
        // ADMIN

        if (!(groupData.members.includes(userRecord.uid))) {

          const newMembers = groupData.members;
          newMembers.push(userRecord.uid);

          db.collection("groups").doc(req.params.name).update({
            members: newMembers
          });

          res.json({ error: false, msg: `Successfully added ${userRecord.displayName} to your group!`});
        } else {
          res.status(409).json({ error: true, msg: `${userRecord.displayName} is already in your group`});
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
    // res.status(500).json({ error: true, msg: 'User does not exist' });
  }
});

chat.post("/:name/remove-member", async (req, res) => {
  if (req.headers.authorization?.startsWith("Bearer ")) {
    const idToken = req.headers.authorization.split("Bearer ")[1];

    const [decodedToken, group, userRecord] = await Promise.all([
      auth.verifyIdToken(idToken),
      db.collection("groups").doc(req.params.name).get(),
      auth.getUserByEmail(req.body.userEmail)
    ]);

    // @ts-ignore
    const groupData: Group = group.data();

    if (decodedToken.uid === groupData.admin) {
      if (groupData.members.includes(userRecord.uid)) {
        db.collection("groups").doc(req.params.name).update({
          members: groupData.members.filter(m => m !== userRecord.uid)
        });
      } else {
        res.status(400).send(`${userRecord.email} is not the email of a member`)
      }
    } else {
      res.status(403).send('You must be an admin to remove a member')
    }

    res.send('remove member endpoint');
  } else {
    res.status(401).send('remember to set the authorization header to a jwt')
  }
});

export default chat;
