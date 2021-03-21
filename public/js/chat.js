const db = firebase.firestore();
// const auth = firebase.auth();

$('#chat-bar').on('submit', async (e) => {
    e.preventDefault();
    const authToken = await auth.currentUser.getIdToken(true);
    console.log(authToken);
    fetch(`/chat/${groupName}/sendmsg`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify({
            text: $('#msgText').val()
        })
    }).then(() => console.log('sent')).catch(() => console.log('an error occured'))
});

auth.onAuthStateChanged(user => {
    if (user) {
        console.log('logged in')
        db.collection("groups").doc(groupName).collection('messages').orderBy('date_created')
        .onSnapshot(col => {
            $('#messages').html('');
            col.forEach(doc => {
                const msg = doc.data();
                $('#messages').append(`<li>
                    ${msg.posted_by}: ${msg.text}
                </li>`)
            });
        });
    }
})

