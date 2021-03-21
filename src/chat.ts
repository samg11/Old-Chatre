import express from "express";

const chat = express();

import { db, auth } from './fire';
import { Group } from './commonTypes';

chat.get("/:name", async (req, res) => {
  // @ts-ignore
  const group: Group = (await db.collection('groups').doc(req.params.name).get()).data();
  console.log(group);
  res.render('pages/chat', {
    groupName: group.name
  });
});

chat.post('/:name/sendmsg', async (req, res) => {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
    const idToken = req.headers.authorization.split('Bearer ')[1];
    const [decodedToken, group] = await Promise.all([
      auth.verifyIdToken(idToken),
      db.collection('groups').doc(req.params.name).get()
    ]);

    if (decodedToken.uid === group.data()?.admin || decodedToken.uid in group.data()?.members) {
      db.collection('groups').doc(req.params.name).collection('messages').add({
        date_created: Math.floor((new Date()).getTime() / 1000),
        text: req.body.text,
        posted_by: decodedToken.uid,
        image: null
      });
    } else {
      res.sendStatus(401);
    }

  } else {
    res.sendStatus(401);
  }
});

export default chat;