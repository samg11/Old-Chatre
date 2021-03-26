import express from "express";

const groups = express();

import { db, auth } from './fire';

// List Groups
groups.get("/", (req, res) => {
  res.render('pages/groups');
});

groups.post('/getGroups', async (req, res) => {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
    const idToken = req.headers.authorization.split('Bearer ')[1];
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      const [adminGroups, memberGroups] = await Promise.all([
        db.collection('groups').where('admin', '==', decodedToken.uid).get(),
        db.collection('groups').where('members', 'array-contains', decodedToken.uid).get()
      ]);

      const adminGroupNames: any[] = [];
      const memberGroupNames: any[] = [];

      await Promise.all([
        Promise.resolve().then(() => {
          adminGroups.forEach((group: any) => {
            console.log('admin', group.data())
            adminGroupNames.push(group.data().name);
          }
          )}
        ),
  
        Promise.resolve().then(() => {
          memberGroups.forEach((group: any) => {
            console.log('member', group.data())
            memberGroupNames.push(group.data().name);
          }
          )}
        )
      ]);
      console.log(memberGroupNames);

      res.json({
        error: false,
        adminGroups: adminGroupNames,
        memberGroups: memberGroupNames
      });

    } catch (err) {
      console.log(err);
      res.status(500).json({ error: true, msg: "An error occurred" });
    }
  } else {
    console.log('unauthenticated')
    res.status(401).json({ error: true, msg: "Unauthenticated" })
  }
});

groups.post("/create/:name", async (req, res) => {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
    const idToken = req.headers.authorization.split('Bearer ')[1];
    try {
      const [decodedToken, groupExists] = await Promise.all([
        auth.verifyIdToken(idToken),
        db.collection('groups').doc(req.params['name']).get()
      ]);
      
      if (!groupExists.exists) {
        db.collection('groups').doc(req.params['name']).set({
          name: req.params['name'],
          date_created: Math.floor((new Date()).getTime() / 1000),
          admin: decodedToken.uid,
          members: [],
          messages: [],
          icon: null
        })
      } else {
        res.status(409).json({ error: true, msg: 'Group already exists' });
      }
    
      res.json({ everything: 'create', error: false });
    } catch (err) {
      res.status(400).json({ error: true, msg: 'unknown error occured' });
    }
  } else {
    res.sendStatus(401);
  }
});
  
export default groups;
