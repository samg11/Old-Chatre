const db = firebase.firestore();
// const auth = firebase.auth();

$('#chat-bar').on('submit', async (e) => {
    e.preventDefault();
    const authToken = await auth.currentUser.getIdToken(true);
    fetch(`/chat/${groupName}/sendmsg`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify({
            text: $('#msgText').val()
        })
    })
        .then((res) => console.log(res))
        .catch(console.error)
        .finally(() => $('#msgText').val(''))
});

auth.onAuthStateChanged(user => {
    if (user) {
        db.collection("groups").doc(groupName).collection('messages').orderBy('date_created')
        .onSnapshot(col => {
            $('#messages').html('');
            col.forEach(doc => {
                const msg = doc.data();
                $('#messages')
                    .append(
                        $("<div></div>")
                            .addClass('message')
                            
                            .append(
                                $("<span></span>")
                                    .addClass('user')
                                    .text(msg.posted_by)
                            )
                            
                            .append(': ')

                            .append(
                                $("<span></span>")
                                    .addClass('text')
                                    .text(msg.text)
                            )
                    );
                console.log([$("#messages").scrollTop(0) + $("#messages").height(), $("#messages").height() - 100])
                

            });
        });
    }
})

